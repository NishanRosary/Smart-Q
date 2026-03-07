const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const Event = require("../models/event");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { sendQueueRegistrationEmail } = require("../services/emailService");
const { getPredictionsIfTrained } = require("../services/mlPredictionService");
const { purgeExpiredEvents, isEventExpired } = require("../services/eventCleanupService");
const mlConfig = require("../../src/config/mlConfig");
const { callMLInference } = require("../../src/services/mlSafeWrapper");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// =======================
// ML NOTIFICATION HELPER
// =======================
const notifyMLUserJoined = async (queueRecord) => {
  try {
    await callMLInference({
      endpoint: "/queue/joined",
      payload: {
        service: queueRecord.service,
        positionInQueue: queueRecord.position,
        totalInQueue: queueRecord.totalWaiting,
        waitingTime: queueRecord.estimatedWaitTime,
        noShow: false,
        status: "waiting",
        joinedAt: new Date().toISOString()
      },
      mlServiceUrl: ML_SERVICE_URL,
      timeoutMs: mlConfig.inferenceTimeoutMs
    });
    console.log(`[ML] Notified — Token #${queueRecord.tokenNumber} joined`);
  } catch (err) {
    // Non-critical — queue still works even if ML is down
    console.log("[ML] Notification failed (non-critical):", err.message);
  }
};

// =======================
// ML PREDICTION HELPERS
// =======================
const AVG_SERVICE_TIME = 4;

const calculateWaitTime = (position) => {
  const now = new Date();
  const hour = now.getHours();

  let peakMultiplier = 1.0;
  if (hour >= 10 && hour <= 12) peakMultiplier = 1.4;
  else if (hour >= 14 && hour <= 16) peakMultiplier = 1.2;
  else if (hour >= 9 && hour <= 10) peakMultiplier = 1.1;

  const baseWait = position * AVG_SERVICE_TIME * peakMultiplier;
  return Math.max(1, Math.round(baseWait));
};

const getCrowdLevel = (waitingCount) => {
  if (waitingCount <= 5) return "Low";
  if (waitingCount <= 15) return "Medium";
  return "High";
};

const getPredictions = async (positionInQueue, service) => {
  const totalWaiting = await Queue.countDocuments({ status: "waiting" });
  return getPredictionsIfTrained({
    service,
    positionInQueue: Math.max(1, Number(positionInQueue || 1)),
    totalWaiting
  });
};

const broadcastQueueUpdate = async (io) => {
  try {
    const waitingQueue = await Queue.find({ status: "waiting" }).sort({ tokenNumber: 1 }).lean();
    const servingQueue = await Queue.find({ status: "serving" }).lean();
    const totalWaiting = waitingQueue.length;
    const crowdLevel = getCrowdLevel(totalWaiting);

    const queueStatus = waitingQueue.map((item, index) => {
      const position = index + 1;
      return {
        _id: item._id,
        tokenNumber: item.tokenNumber,
        service: item.service,
        status: item.status,
        position,
        estimatedWaitTime: calculateWaitTime(position),
        crowdLevel,
        totalWaiting,
        joinedAt: item.createdAt
      };
    });

    io.emit("queue:update", {
      queue: queueStatus,
      serving: servingQueue,
      totalWaiting,
      crowdLevel,
      timestamp: new Date()
    });
    return true;
  } catch (err) {
    console.error("broadcastQueueUpdate failed:", err);
    return false;
  }
};

// =======================
// JOIN QUEUE
// =======================
router.post("/join", async (req, res) => {
  try {
    const {
      service,
      guestName,
      guestMobile,
      guestEmail,
      email,
      isCustomerUser,
      eventId,
      eventName,
      organizationName,
      organizationType
    } = req.body;

    if (!service || !eventId) {
      return res.status(400).json({ message: "Service and eventId are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (isEventExpired(event)) {
      await purgeExpiredEvents();
      return res.status(400).json({
        message: "This event has ended and is no longer available"
      });
    }

    const joinedTokensForEvent = await Queue.countDocuments({
      eventId: String(eventId),
      status: { $ne: "cancelled" }
    });
    const totalTokensForEvent = Number(event.totalTokens) || 0;
    if (joinedTokensForEvent >= totalTokensForEvent) {
      return res.status(400).json({ message: "This event queue is full" });
    }

    const count = await Queue.countDocuments();
    const tokenNumber = count + 1;

    const newQueue = new Queue({
      tokenNumber,
      service,
      guestName: guestName || null,
      guestMobile: guestMobile || null,
      guestEmail: guestEmail || email || null,
      eventId: String(eventId),
      eventName: eventName || event.title || null,
      organizationName: organizationName || event.organizationName || null,
      organizationType: organizationType || event.organizationType || null
    });

    await newQueue.save();

    const waitingAhead = await Queue.countDocuments({
      status: "waiting",
      tokenNumber: { $lt: tokenNumber }
    });
    const position = waitingAhead + 1;
    const totalWaiting = await Queue.countDocuments({ status: "waiting" });
    const estimatedWaitTime = calculateWaitTime(position);
    const crowdLevel = getCrowdLevel(totalWaiting);

    const predictions = await getPredictions(position, service);

    // ── NOTIFY ML SERVICE AUTOMATICALLY ──
    await notifyMLUserJoined({
      tokenNumber,
      service,
      position,
      totalWaiting,
      estimatedWaitTime
    });
    // ─────────────────────────────────────

    const recipientEmail = guestEmail || email;
    if (isCustomerUser && recipientEmail) {
      sendQueueRegistrationEmail({
        toEmail: recipientEmail,
        userName: guestName || "User",
        tokenNumber,
        serviceName: service,
        estimatedWaitTime
      }).catch((mailError) => {
        console.error("Queue confirmation email failed:", mailError.message);
      });
    }

    const io = req.app.get("io");
    if (io) {
      await broadcastQueueUpdate(io);
    }

    res.status(201).json({
      tokenNumber,
      service,
      position,
      totalWaiting,
      estimatedWaitTime,
      crowdLevel,
      predictions,
      queueId: newQueue._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to join queue" });
  }
});

// =======================
// GET MY QUEUE STATUS
// =======================
router.get("/status/:tokenNumber", async (req, res) => {
  try {
    const rawToken = String(req.params.tokenNumber || "").trim();
    const numericToken = rawToken.replace(/\D/g, "");

    if (!numericToken) {
      return res.status(400).json({ message: "Invalid token number format" });
    }

    const tokenNum = Number.parseInt(numericToken, 10);
    const myEntry = await Queue.findOne({ tokenNumber: tokenNum });

    if (!myEntry) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (myEntry.status === "completed") {
      return res.json({
        tokenNumber: myEntry.tokenNumber,
        service: myEntry.service,
        status: "completed",
        position: 0,
        estimatedWaitTime: 0,
        crowdLevel: "Low",
        totalWaiting: await Queue.countDocuments({ status: "waiting" })
      });
    }

    if (myEntry.status === "serving") {
      return res.json({
        tokenNumber: myEntry.tokenNumber,
        service: myEntry.service,
        status: "serving",
        position: 0,
        estimatedWaitTime: 0,
        crowdLevel: getCrowdLevel(await Queue.countDocuments({ status: "waiting" })),
        totalWaiting: await Queue.countDocuments({ status: "waiting" })
      });
    }

    const waitingAhead = await Queue.countDocuments({
      status: "waiting",
      tokenNumber: { $lt: tokenNum }
    });
    const position = waitingAhead + 1;
    const totalWaiting = await Queue.countDocuments({ status: "waiting" });
    const estimatedWaitTime = calculateWaitTime(position);
    const crowdLevel = getCrowdLevel(totalWaiting);
    const predictions = await getPredictions(position, myEntry.service);

    res.json({
      tokenNumber: myEntry.tokenNumber,
      service: myEntry.service,
      status: myEntry.status,
      position,
      totalWaiting,
      estimatedWaitTime,
      crowdLevel,
      predictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get queue status" });
  }
});

// =======================
// GET QUEUE LIST (Admin)
// =======================
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const queue = await Queue.find().sort({ tokenNumber: 1 }).lean();
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =======================
// START SERVING (Admin)
// =======================
router.put("/:id/start", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "serving" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// =======================
// COMPLETE (Admin)
// =======================
router.put("/:id/complete", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// =======================
// CANCEL (Admin)
// =======================
router.put("/:id/cancel", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// =======================
// REVOKE (Admin)
// =======================
router.put("/:id/revoke", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "waiting" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

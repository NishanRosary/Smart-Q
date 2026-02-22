const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { sendQueueRegistrationEmail } = require("../services/emailService");

/**
 * Queue utility helpers
 */
const AVG_SERVICE_TIME_MIN = 4;

const calculateWaitTime = (position) => {
  const safePosition = Math.max(0, Number(position) || 0);
  return safePosition === 0 ? 0 : safePosition * AVG_SERVICE_TIME_MIN;
};

const getCrowdLevel = (waitingCount) => {
  if (waitingCount <= 5) return "Low";
  if (waitingCount <= 15) return "Medium";
  return "High";
};

const buildQueueSnapshot = async () => {
  const waitingQueue = await Queue.find({ status: "waiting" }).sort({ tokenNumber: 1 });
  const servingQueue = await Queue.find({ status: "serving" }).sort({ tokenNumber: 1 });
  const cancelledQueue = await Queue.find({ status: "cancelled" }).sort({ tokenNumber: 1 });
  const completedQueue = await Queue.find({ status: "completed" }).sort({ tokenNumber: 1 });
  const totalWaiting = waitingQueue.length;
  const crowdLevel = getCrowdLevel(totalWaiting);

  const toQueueItem = (item, position) => ({
    _id: item._id,
    tokenNumber: item.tokenNumber,
    service: item.service,
    status: item.status,
    position,
    estimatedWaitTime: item.status === "waiting" ? calculateWaitTime(position) : 0,
    crowdLevel,
    totalWaiting,
    guestName: item.guestName ?? null,
    guestMobile: item.guestMobile ?? null,
    guestEmail: item.guestEmail ?? null,
    eventId: item.eventId ?? null,
    eventName: item.eventName ?? null,
    organizationName: item.organizationName ?? null,
    organizationType: item.organizationType ?? null,
    createdAt: item.createdAt
  });

  const waitingStatus = waitingQueue.map((item, index) => {
    const position = index + 1;
    return toQueueItem(item, position);
  });

  const servingStatus = servingQueue.map((item) => toQueueItem(item, 0));
  const cancelledStatus = cancelledQueue.map((item) => toQueueItem(item, 0));
  const completedStatus = completedQueue.map((item) => toQueueItem(item, 0));

  return {
    queue: [...waitingStatus, ...servingStatus, ...cancelledStatus, ...completedStatus],
    serving: servingStatus,
    totalWaiting,
    crowdLevel
  };
};

/**
 * Safe broadcast helper
 * Won't crash if io is missing
 */
const safeBroadcast = async (req) => {
  try {
    const io = req.app.get("io");
    if (io) {
      const snapshot = await buildQueueSnapshot();
      io.emit("queue:update", {
        ...snapshot,
        timestamp: new Date()
      });
    }
  } catch (err) {
    console.error("Broadcast error:", err.message);
  }
};

// ================= JOIN QUEUE =================
router.post("/join", async (req, res) => {
  try {
    const {
      service,
      guestName,
      guestMobile,
      guestEmail,
      eventId,
      eventName,
      organizationName,
      organizationType
    } = req.body;

    if (!service) {
      return res.status(400).json({ message: "Service is required" });
    }

    const lastToken = await Queue.findOne().sort({ tokenNumber: -1 });
    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const parsedEventId = Number(eventId);
    const queuePayload = {
      tokenNumber,
      service,
      guestName: guestName || null,
      guestMobile: guestMobile || null,
      guestEmail: guestEmail || null,
      eventName: eventName || null,
      organizationName: organizationName || null,
      organizationType: organizationType || null,
      status: "waiting"
    };

    // `eventId` is numeric in schema; only persist if it's a valid number.
    if (!Number.isNaN(parsedEventId) && Number.isFinite(parsedEventId)) {
      queuePayload.eventId = parsedEventId;
    }

    const newQueue = await Queue.create(queuePayload);

    const waitingAhead = await Queue.countDocuments({
      status: "waiting",
      tokenNumber: { $lt: tokenNumber }
    });
    const position = waitingAhead + 1;
    const totalWaiting = await Queue.countDocuments({ status: "waiting" });
    const estimatedWaitTime = calculateWaitTime(position);
    const crowdLevel = getCrowdLevel(totalWaiting);

    if (guestEmail) {
      sendQueueRegistrationEmail({
        toEmail: guestEmail,
        userName: guestName || "User",
        tokenNumber,
        serviceName: service,
        estimatedWaitTime
      }).catch((mailError) => {
        console.error("Queue confirmation email failed:", mailError.message);
      });
    }

    await safeBroadcast(req);

    res.status(201).json({
      tokenNumber,
      service,
      position,
      totalWaiting,
      estimatedWaitTime,
      crowdLevel,
      status: "waiting",
      queueId: newQueue._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to join queue" });
  }
});

// ================= GET MY QUEUE STATUS =================
router.get("/status/:tokenNumber", async (req, res) => {
  try {
    const tokenNum = parseInt(String(req.params.tokenNumber).replace(/\D/g, ""), 10);
    if (Number.isNaN(tokenNum)) {
      return res.status(400).json({ message: "Invalid token number" });
    }

    const myEntry = await Queue.findOne({ tokenNumber: tokenNum });
    if (!myEntry) {
      return res.status(404).json({ message: "Token not found" });
    }

    const totalWaiting = await Queue.countDocuments({ status: "waiting" });
    const crowdLevel = getCrowdLevel(totalWaiting);

    if (myEntry.status === "serving" || myEntry.status === "completed" || myEntry.status === "cancelled") {
      return res.json({
        tokenNumber: myEntry.tokenNumber,
        service: myEntry.service,
        status: myEntry.status,
        position: 0,
        estimatedWaitTime: 0,
        crowdLevel,
        totalWaiting
      });
    }

    const waitingAhead = await Queue.countDocuments({
      status: "waiting",
      tokenNumber: { $lt: tokenNum }
    });
    const position = waitingAhead + 1;
    const estimatedWaitTime = calculateWaitTime(position);

    res.json({
      tokenNumber: myEntry.tokenNumber,
      service: myEntry.service,
      status: myEntry.status,
      position,
      totalWaiting,
      estimatedWaitTime,
      crowdLevel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get queue status" });
  }
});

// ================= GET QUEUE LIST =================
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const queue = await Queue.find({}).sort({ tokenNumber: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= START SERVING =================
router.put("/:id/start", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findOneAndUpdate(
      { _id: req.params.id, status: "waiting" },
      { $set: { status: "serving" } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        message: "Token cannot be started (invalid state or not found)"
      });
    }

    await safeBroadcast(req);
    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to start token" });
  }
});


// ================= COMPLETE =================
router.put("/:id/complete", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findOneAndUpdate(
      { _id: req.params.id, status: "serving" },
      { $set: { status: "completed" } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        message: "Token cannot be completed (invalid state or not found)"
      });
    }

    await safeBroadcast(req);
    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to complete token" });
  }
});


// ================= CANCEL =================
router.put("/:id/cancel", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $in: ["waiting", "serving"] }
      },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        message: "Token cannot be cancelled"
      });
    }

    await safeBroadcast(req);
    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel token" });
  }
});


// ================= REVOKE =================
router.put("/:id/revoke", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findOneAndUpdate(
      { _id: req.params.id, status: "cancelled" },
      { $set: { status: "waiting" } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({
        message: "Token cannot be revoked"
      });
    }

    await safeBroadcast(req);
    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to revoke token" });
  }
});

module.exports = router;

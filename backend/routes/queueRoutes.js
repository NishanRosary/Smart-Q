const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { sendQueueRegistrationEmail } = require("../services/emailService");
const axios = require("axios"); // ← ADD THIS

const ML_SERVICE_URL = "http://localhost:5001"; // ← ADD THIS

// =======================
// ML NOTIFICATION HELPER
// =======================
const notifyMLUserJoined = async (queueRecord) => {
  try {
    await axios.post(`${ML_SERVICE_URL}/queue/joined`, {
      service:         queueRecord.service,
      positionInQueue: queueRecord.position,
      totalInQueue:    queueRecord.totalWaiting,
      waitingTime:     queueRecord.estimatedWaitTime,
      noShow:          false,
      status:          "waiting",
      joinedAt:        new Date().toISOString()
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

const getPredictions = async (tokenNumber, service) => {
  const now = new Date();
  const hour = now.getHours();

  const totalWaiting = await Queue.countDocuments({ status: "waiting" });
  const serviceWaiting = await Queue.countDocuments({ status: "waiting", service });

  const peakTimes = [];
  for (let h = 0; h < 6; h++) {
    const futureHour = (hour + h) % 24;
    let prediction = "Low";
    let confidence = 60 + Math.floor(Math.random() * 15);
    let customers = Math.floor(Math.random() * 20) + 5;

    if (futureHour >= 10 && futureHour <= 12) {
      prediction = "High";
      confidence = 85 + Math.floor(Math.random() * 10);
      customers = 50 + Math.floor(Math.random() * 40);
    } else if (futureHour >= 14 && futureHour <= 16) {
      prediction = "Medium";
      confidence = 70 + Math.floor(Math.random() * 15);
      customers = 30 + Math.floor(Math.random() * 25);
    }

    peakTimes.push({
      hour: `${String(futureHour).padStart(2, "0")}:00`,
      prediction,
      confidence,
      customers
    });
  }

  const waitTimePredictions = [];
  for (let i = 0; i < 4; i++) {
    const futureWaiting = Math.max(1, totalWaiting - i * 3 + Math.floor(Math.random() * 4));
    const predictedWait = calculateWaitTime(futureWaiting);
    waitTimePredictions.push({
      time: i === 0 ? "Now" : `+${i} hour${i > 1 ? "s" : ""}`,
      predictedWait,
      accuracy: Math.max(75, 95 - i * 5 + Math.floor(Math.random() * 5))
    });
  }

  const optimalVisitTimes = [
    { time: "08:00-09:00", score: 92 + Math.floor(Math.random() * 6), waitTime: 3 + Math.floor(Math.random() * 4), crowdLevel: "Low" },
    { time: "13:00-14:00", score: 82 + Math.floor(Math.random() * 8), waitTime: 6 + Math.floor(Math.random() * 5), crowdLevel: "Low" },
    { time: "16:00-17:00", score: 75 + Math.floor(Math.random() * 10), waitTime: 10 + Math.floor(Math.random() * 6), crowdLevel: "Medium" }
  ];

  return {
    peakTimes,
    waitTimePredictions,
    optimalVisitTimes,
    totalWaiting,
    serviceWaiting,
    crowdLevel: getCrowdLevel(totalWaiting),
    mlModelStats: {
      isSimulated: true,
      note: "These values are simulated for demo purposes.",
      modelAccuracy: null,
      predictionsToday: null,
      avgAccuracy: null,
      lastUpdated: null
    }
  };
};

const broadcastQueueUpdate = async (io) => {
  try {
    const waitingQueue = await Queue.find({ status: "waiting" }).sort({ tokenNumber: 1 });
    const servingQueue = await Queue.find({ status: "serving" });
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
    const { service, guestName, guestMobile, guestEmail, email, isCustomerUser } = req.body;

    if (!service) {
      return res.status(400).json({ message: "Service is required" });
    }

    const count = await Queue.countDocuments();
    const tokenNumber = count + 1;

    const newQueue = new Queue({
      tokenNumber,
      service,
      guestName: guestName || null,
      guestMobile: guestMobile || null
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

    const predictions = await getPredictions(tokenNumber, service);

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
    const tokenNum = parseInt(req.params.tokenNumber);
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
    const predictions = await getPredictions(tokenNum, myEntry.service);

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
    const queue = await Queue.find().sort({ tokenNumber: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =======================
// START SERVING (Admin)
// =======================
router.put("/:id/start", authMiddleware, adminMiddleware, async (req, res) => {
  const updated = await Queue.findByIdAndUpdate(
    req.params.id,
    { status: "serving" },
    { new: true }
  );
  const io = req.app.get("io");
  if (io) await broadcastQueueUpdate(io);
  res.json(updated);
});

// =======================
// COMPLETE (Admin)
// =======================
router.put("/:id/complete", authMiddleware, adminMiddleware, async (req, res) => {
  const updated = await Queue.findByIdAndUpdate(
    req.params.id,
    { status: "completed" },
    { new: true }
  );
  const io = req.app.get("io");
  if (io) await broadcastQueueUpdate(io);
  res.json(updated);
});

module.exports = router;
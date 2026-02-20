const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { sendQueueRegistrationEmail } = require("../services/emailService");

const AVG_SERVICE_TIME = 4;

const calculateWaitTime = (position) => {
  const now = new Date();
  const hour = now.getHours();

  let peakMultiplier = 1.0;
  if (hour >= 10 && hour <= 12) peakMultiplier = 1.4;
  else if (hour >= 14 && hour <= 16) peakMultiplier = 1.2;
  else if (hour >= 9 && hour <= 10) peakMultiplier = 1.1;

  return Math.max(1, Math.round(position * AVG_SERVICE_TIME * peakMultiplier));
};

const getCrowdLevel = (waitingCount) => {
  if (waitingCount <= 5) return "Low";
  if (waitingCount <= 15) return "Medium";
  return "High";
};

const getPredictions = async (service) => {
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
    const futureWaiting = Math.max(1, totalWaiting - (i * 3) + Math.floor(Math.random() * 4));
    waitTimePredictions.push({
      time: i === 0 ? "Now" : `+${i} hour${i > 1 ? "s" : ""}`,
      predictedWait: calculateWaitTime(futureWaiting),
      accuracy: Math.max(75, 95 - (i * 5) + Math.floor(Math.random() * 5))
    });
  }

  return {
    peakTimes,
    waitTimePredictions,
    optimalVisitTimes: [
      { time: "08:00-09:00", score: 92 + Math.floor(Math.random() * 6), waitTime: 3 + Math.floor(Math.random() * 4), crowdLevel: "Low" },
      { time: "13:00-14:00", score: 82 + Math.floor(Math.random() * 8), waitTime: 6 + Math.floor(Math.random() * 5), crowdLevel: "Low" },
      { time: "16:00-17:00", score: 75 + Math.floor(Math.random() * 10), waitTime: 10 + Math.floor(Math.random() * 6), crowdLevel: "Medium" }
    ],
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

const buildQueueSnapshot = async () => {
  const waitingQueue = await Queue.find({ status: "waiting" }).sort({ tokenNumber: 1 });
  const servingQueue = await Queue.find({ status: "serving" }).sort({ tokenNumber: 1 });
  const cancelledQueue = await Queue.find({ status: "cancelled" }).sort({ tokenNumber: 1 });
  const completedQueue = await Queue.find({ status: "completed" }).sort({ tokenNumber: 1 });
  const totalWaiting = waitingQueue.length;
  const crowdLevel = getCrowdLevel(totalWaiting);

  const waitingStatus = waitingQueue.map((item, index) => {
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
      guestName: item.guestName ?? null,
      guestMobile: item.guestMobile ?? null,
      guestEmail: item.guestEmail ?? null,
      eventId: item.eventId ?? null,
      eventName: item.eventName ?? null,
      organizationName: item.organizationName ?? null,
      organizationType: item.organizationType ?? null,
      createdAt: item.createdAt
    };
  });

  const servingStatus = servingQueue.map((item) => ({
    _id: item._id,
    tokenNumber: item.tokenNumber,
    service: item.service,
    status: item.status,
    position: 0,
    estimatedWaitTime: 0,
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
  }));

  const cancelledStatus = cancelledQueue.map((item) => ({
    _id: item._id,
    tokenNumber: item.tokenNumber,
    service: item.service,
    status: item.status,
    position: 0,
    estimatedWaitTime: 0,
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
  }));

  const completedStatus = completedQueue.map((item) => ({
    _id: item._id,
    tokenNumber: item.tokenNumber,
    service: item.service,
    status: item.status,
    position: 0,
    estimatedWaitTime: 0,
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
  }));

  return {
    queue: [...waitingStatus, ...servingStatus, ...cancelledStatus, ...completedStatus],
    serving: servingStatus,
    cancelled: cancelledStatus,
    completed: completedStatus,
    totalWaiting,
    crowdLevel
  };
};

const broadcastQueueUpdate = async (io) => {
  try {
    const { queue, serving, cancelled, completed, totalWaiting, crowdLevel } = await buildQueueSnapshot();

    io.emit("queue:update", {
      queue,
      serving,
      cancelled,
      completed,
      totalWaiting,
      crowdLevel,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Broadcast failed:", err);
  }
};

// ================= JOIN QUEUE =================
router.post("/join", async (req, res) => {
  try {
    const {
      service,
      eventId,
      eventName,
      organizationName,
      organizationType,
      guestName,
      guestMobile,
      guestEmail,
      email,
      isCustomerUser
    } = req.body;

    if (!service) {
      return res.status(400).json({ message: "Service is required" });
    }

    const lastToken = await Queue.findOne().sort({ tokenNumber: -1 });
    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const newQueue = new Queue({
      tokenNumber,
      service,
      eventId: Number.isFinite(Number(eventId)) ? Number(eventId) : null,
      eventName: eventName || null,
      organizationName: organizationName || null,
      organizationType: organizationType || null,
      guestName: guestName || null,
      guestMobile: guestMobile || null,
      guestEmail: guestEmail || null,
      status: "waiting"
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
    const predictions = await getPredictions(service);

    const recipientEmail = guestEmail || email;
    const shouldSendConfirmationEmail = Boolean(isCustomerUser && recipientEmail);

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);

    res.status(201).json({
      tokenNumber,
      service,
      eventId: newQueue.eventId,
      eventName: newQueue.eventName,
      organizationName: newQueue.organizationName,
      organizationType: newQueue.organizationType,
      position,
      totalWaiting,
      estimatedWaitTime,
      crowdLevel,
      predictions,
      queueId: newQueue._id
    });

    if (shouldSendConfirmationEmail) {
      setTimeout(() => {
        sendQueueRegistrationEmail({
          toEmail: recipientEmail,
          userName: guestName || "User",
          tokenNumber,
          serviceName: service,
          estimatedWaitTime
        }).catch((mailError) => {
          console.error("Queue confirmation email failed:", mailError.message);
        });
      }, 2000);
    }
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

    if (myEntry.status === "completed") {
      return res.json({
        tokenNumber: myEntry.tokenNumber,
        service: myEntry.service,
        status: "completed",
        position: 0,
        estimatedWaitTime: 0,
        crowdLevel,
        totalWaiting
      });
    }

    if (myEntry.status === "serving") {
      return res.json({
        tokenNumber: myEntry.tokenNumber,
        service: myEntry.service,
        status: "serving",
        position: 0,
        estimatedWaitTime: 0,
        crowdLevel,
        totalWaiting
      });
    }

    if (myEntry.status === "cancelled") {
      return res.json({
        tokenNumber: myEntry.tokenNumber,
        service: myEntry.service,
        status: "cancelled",
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
    const predictions = await getPredictions(myEntry.service);

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

// ================= GET QUEUE LIST =================
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const queue = await Queue.find({ status: { $in: ["waiting", "serving", "cancelled", "completed"] } }).sort({ tokenNumber: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= START SERVING =================
router.put("/:id/start", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "serving" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Token not found" });
    }

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to start token" });
  }
});

// ================= COMPLETE =================
router.put("/:id/complete", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Token not found" });
    }

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to complete token" });
  }
});

// ================= CANCEL =================
router.put("/:id/cancel", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Token not found" });
    }

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel token" });
  }
});

// ================= REVOKE =================
router.put("/:id/revoke", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "waiting" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Token not found" });
    }

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to revoke token" });
  }
});

module.exports = router;

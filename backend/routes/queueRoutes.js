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

const broadcastQueueUpdate = async (io) => {
  try {
    const waitingQueue = await Queue.find({ status: "waiting" }).sort({ createdAt: 1 });
    const servingQueue = await Queue.find({ status: "serving" });

    const totalWaiting = waitingQueue.length;
    const crowdLevel = getCrowdLevel(totalWaiting);

    const queueStatus = waitingQueue.map((item, index) => ({
      _id: item._id,
      tokenNumber: item.tokenNumber,
      service: item.service,
      status: item.status,
      position: index + 1,
      estimatedWaitTime: calculateWaitTime(index + 1),
      crowdLevel,
      totalWaiting,
      joinedAt: item.createdAt
    }));

    io.emit("queue:update", {
      queue: queueStatus,
      serving: servingQueue,
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
    const { service, guestName, guestMobile, guestEmail, email, isCustomerUser } = req.body;

    if (!service) {
      return res.status(400).json({ message: "Service is required" });
    }

    // SAFE TOKEN GENERATION
    const lastToken = await Queue.findOne().sort({ tokenNumber: -1 });
    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const newQueue = new Queue({
      tokenNumber,
      service,
      guestName: guestName || null,
      guestMobile: guestMobile || null,
      status: "waiting"
    });

    await newQueue.save();

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);

    res.status(201).json({
      tokenNumber,
      service,
      queueId: newQueue._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to join queue" });
  }
});

// ================= GET QUEUE LIST =================
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const queue = await Queue.find().sort({ createdAt: 1 });
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

module.exports = router;

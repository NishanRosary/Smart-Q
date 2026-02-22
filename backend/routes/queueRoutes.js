const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const Event = require("../models/event");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const { sendQueueRegistrationEmail } = require("../services/emailService");
const rateLimit = require("express-rate-limit");

/* =========================
   RATE LIMITER (ANTI-SPAM)
========================= */
const joinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});

/* =========================
   HELPERS
========================= */

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

/* =========================
   JOIN QUEUE (Public but Safe)
========================= */

router.post("/join", joinLimiter, async (req, res) => {
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

    if (!service || !eventId) {
      return res.status(400).json({ message: "Service and Event are required" });
    }

    const selectedEvent = await Event.findById(eventId);
    if (!selectedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const totalTokensForEvent = Number(selectedEvent.totalTokens) || 0;
    const joinedForEvent = await Queue.countDocuments({
      eventId: String(eventId),
      status: { $ne: "cancelled" }
    });

    if (totalTokensForEvent > 0 && joinedForEvent >= totalTokensForEvent) {
      return res.status(409).json({ message: "Queue is full for this event" });
    }

    const lastToken = await Queue.findOne().sort({ tokenNumber: -1 });
    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const newQueue = await Queue.create({
      tokenNumber,
      service,
      guestName: guestName || null,
      guestMobile: guestMobile || null,
      guestEmail: guestEmail || null,
      eventId,
      eventName: eventName || null,
      organizationName: organizationName || null,
      organizationType: organizationType || null,
      branchId: selectedEvent.branchId,
      status: "waiting"
    });

    if (guestEmail) {
      sendQueueRegistrationEmail({
        toEmail: guestEmail,
        userName: guestName || "User",
        tokenNumber,
        serviceName: service,
        estimatedWaitTime: 0
      }).catch(() => {});
    }

    res.status(201).json({
      tokenNumber,
      queueId: newQueue._id,
      status: "waiting"
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to join queue" });
  }
});

/* =========================
   GET ALL QUEUES (ADMIN ONLY + BRANCH SAFE)
========================= */

router.get("/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const queue = await Queue.find({
        branchId: req.user.branchId
      }).sort({ tokenNumber: 1 });

      res.json(queue);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* =========================
   START SERVING
========================= */

router.put("/:id/start",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const queueItem = await Queue.findById(req.params.id);

      if (!queueItem) {
        return res.status(404).json({ message: "Queue not found" });
      }

      if (queueItem.branchId.toString() !== req.user.branchId.toString()) {
        return res.status(403).json({ message: "Wrong branch" });
      }

      if (queueItem.status !== "waiting") {
        return res.status(400).json({ message: "Invalid state" });
      }

      queueItem.status = "serving";
      await queueItem.save();

      res.json(queueItem);

    } catch (error) {
      res.status(500).json({ message: "Failed to start token" });
    }
  }
);

/* =========================
   COMPLETE
========================= */

router.put("/:id/complete",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const queueItem = await Queue.findById(req.params.id);

      if (!queueItem) {
        return res.status(404).json({ message: "Queue not found" });
      }

      if (queueItem.branchId.toString() !== req.user.branchId.toString()) {
        return res.status(403).json({ message: "Wrong branch" });
      }

      if (queueItem.status !== "serving") {
        return res.status(400).json({ message: "Invalid state" });
      }

      queueItem.status = "completed";
      await queueItem.save();

      res.json(queueItem);

    } catch (error) {
      res.status(500).json({ message: "Failed to complete token" });
    }
  }
);

/* =========================
   CANCEL
========================= */

router.put("/:id/cancel",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const queueItem = await Queue.findById(req.params.id);

      if (!queueItem) {
        return res.status(404).json({ message: "Queue not found" });
      }

      if (queueItem.branchId.toString() !== req.user.branchId.toString()) {
        return res.status(403).json({ message: "Wrong branch" });
      }

      if (!["waiting", "serving"].includes(queueItem.status)) {
        return res.status(400).json({ message: "Invalid state" });
      }

      queueItem.status = "cancelled";
      await queueItem.save();

      res.json(queueItem);

    } catch (error) {
      res.status(500).json({ message: "Failed to cancel token" });
    }
  }
);

module.exports = router;
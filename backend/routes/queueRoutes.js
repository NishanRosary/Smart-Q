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

const emitQueueSnapshot = async (req) => {
  try {
    const io = req.app.get("io");
    if (!io) return;
    const queue = await Queue.find().sort({ tokenNumber: 1 });
    io.emit("queue:update", { queue });
  } catch (_) {
    // Non-blocking: status updates should succeed even if socket emit fails.
  }
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

    await emitQueueSnapshot(req);
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
   GET QUEUE STATUS (PUBLIC)
========================= */

router.get("/status/:tokenNumber", async (req, res) => {
  try {
    const rawToken = String(req.params.tokenNumber || "");
    const normalizedDigits = rawToken.replace(/\D/g, "");
    const tokenNumber = Number.parseInt(normalizedDigits, 10);

    if (!Number.isFinite(tokenNumber) || tokenNumber <= 0) {
      return res.status(400).json({ message: "Invalid token number" });
    }

    const queueItem = await Queue.findOne({ tokenNumber });
    if (!queueItem) {
      return res.status(404).json({ message: "Token not found" });
    }

    const eventFilter = queueItem.eventId ? { eventId: queueItem.eventId } : {};
    const waitingFilter = { ...eventFilter, status: "waiting" };

    const [waitingAhead, totalWaiting] = await Promise.all([
      Queue.countDocuments({ ...waitingFilter, tokenNumber: { $lt: tokenNumber } }),
      Queue.countDocuments(waitingFilter)
    ]);

    const position = queueItem.status === "waiting" ? waitingAhead + 1 : 0;

    return res.json({
      tokenNumber: queueItem.tokenNumber,
      service: queueItem.service,
      status: queueItem.status,
      position,
      estimatedWaitTime: calculateWaitTime(position),
      totalWaiting,
      crowdLevel: getCrowdLevel(totalWaiting)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch queue status" });
  }
});

/* =========================
   GET ALL QUEUES (ADMIN ONLY)
========================= */

router.get("/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const queue = await Queue.find().sort({ tokenNumber: 1 });

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

      if (queueItem.status !== "waiting") {
        return res.status(400).json({ message: "Invalid state" });
      }

      queueItem.status = "serving";
      await queueItem.save();
      await emitQueueSnapshot(req);

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

      if (queueItem.status !== "serving") {
        return res.status(400).json({ message: "Invalid state" });
      }

      queueItem.status = "completed";
      await queueItem.save();
      await emitQueueSnapshot(req);

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

      if (!["waiting", "serving"].includes(queueItem.status)) {
        return res.status(400).json({ message: "Invalid state" });
      }

      queueItem.status = "cancelled";
      await queueItem.save();
      await emitQueueSnapshot(req);

      res.json(queueItem);

    } catch (error) {
      res.status(500).json({ message: "Failed to cancel token" });
    }
  }
);

/* =========================
   REVOKE TO WAITING
========================= */

router.put("/:id/revoke",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const queueItem = await Queue.findById(req.params.id);

      if (!queueItem) {
        return res.status(404).json({ message: "Queue not found" });
      }

      if (!["cancelled", "completed"].includes(queueItem.status)) {
        return res.status(400).json({ message: "Invalid state" });
      }

      queueItem.status = "waiting";
      await queueItem.save();
      await emitQueueSnapshot(req);

      res.json(queueItem);

    } catch (error) {
      res.status(500).json({ message: "Failed to revoke token" });
    }
  }
);

module.exports = router;

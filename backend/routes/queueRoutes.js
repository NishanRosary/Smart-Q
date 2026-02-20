const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

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

    const io = req.app.get("io");
    if (io) await broadcastQueueUpdate(io);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to revoke token" });
  }
});

module.exports = router;
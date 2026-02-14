const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// =======================
// JOIN QUEUE (Customer)
// =======================
router.post("/join", async (req, res) => {
  try {
    const { service } = req.body;

    if (!service) {
      return res.status(400).json({ message: "Service is required" });
    }

    const count = await Queue.countDocuments();
    const tokenNumber = count + 1;

    const newQueue = new Queue({
      tokenNumber,
      service
    });

    await newQueue.save();

    res.status(201).json({
      tokenNumber
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to join queue" });
  }
});

// =======================
// GET QUEUE LIST (Admin)
// =======================
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const queue = await Queue.find().sort({ tokenNumber: 1 });
      res.json(queue);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// =======================
// START SERVING (Admin)
// =======================
router.put(
  "/:id/start",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "serving" },
      { new: true }
    );
    res.json(updated);
  }
);

// =======================
// COMPLETE (Admin)
// =======================
router.put(
  "/:id/complete",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const updated = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    res.json(updated);
  }
);

module.exports = router;

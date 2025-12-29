const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");

// JOIN QUEUE
router.post("/join", async (req, res) => {
  try {
    const { service } = req.body;

    if (!service) {
      return res.status(400).json({ message: "Service is required" });
    }

    // Generate token number
    const count = await Queue.countDocuments();
    const tokenNumber = `T${count + 1}`;

    const newQueue = new Queue({
      tokenNumber,
      service
    });

    await newQueue.save();

    res.status(201).json({
      message: "Joined queue successfully",
      token: tokenNumber
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET QUEUE LIST (Admin)
router.get("/", async (req, res) => {
  try {
    const queue = await Queue.find().sort({ createdAt: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// START SERVING TOKEN
router.put("/:id/start", async (req, res) => {
  try {
    const queueItem = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "In Progress" },
      { new: true }
    );

    res.json(queueItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// COMPLETE TOKEN
router.put("/:id/complete", async (req, res) => {
  try {
    const queueItem = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );

    res.json(queueItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

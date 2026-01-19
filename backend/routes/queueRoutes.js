const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const { io } = require("../server");


// JOIN QUEUE (Customer)
router.post("/join", async (req, res) => {
  try {
    const { service } = req.body;

    if (!service) {
      return res.status(400).json({ message: "Service is required" });
    }

    // Generate token number
    const count = await Queue.countDocuments();
    const tokenNumber = count + 1;

    const newQueue = new Queue({
      tokenNumber,
      service,
      status: "waiting",
      createdAt: new Date()
    });

    await newQueue.save();

    // Emit real-time update
    const updatedQueue = await Queue.find().sort({ tokenNumber: 1 });
    io.emit("queueUpdated", updatedQueue);

    res.status(201).json({
      message: "Joined queue successfully",
      tokenNumber
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET QUEUE LIST (Admin)
router.get("/", async (req, res) => {
  try {
    const queue = await Queue.find().sort({ tokenNumber: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// START SERVING TOKEN (Admin)
router.put("/:id/start", async (req, res) => {
  try {
    const queueItem = await Queue.findById(req.params.id);

    if (!queueItem) {
      return res.status(404).json({ message: "Queue item not found" });
    }

    queueItem.status = "serving";
    await queueItem.save();

    // Emit real-time update
    const updatedQueue = await Queue.find().sort({ tokenNumber: 1 });
    io.emit("queueUpdated", updatedQueue);

    res.json(queueItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// COMPLETE TOKEN (Admin)
router.put("/:id/complete", async (req, res) => {
  try {
    const queueItem = await Queue.findById(req.params.id);

    if (!queueItem) {
      return res.status(404).json({ message: "Queue item not found" });
    }

    queueItem.status = "completed";
    await queueItem.save();

    // Emit real-time update
    const updatedQueue = await Queue.find().sort({ tokenNumber: 1 });
    io.emit("queueUpdated", updatedQueue);

    res.json(queueItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// =======================
// CREATE EVENT (Admin)
// =======================
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { title, organizationType, organizationName, date, time, location, serviceTypes } = req.body;

      // Validate required fields
      if (!title || !organizationType || !organizationName || !date || !time || !location) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const event = new Event({
        title,
        organizationType,
        organizationName,
        date,
        time,
        location,
        serviceTypes: serviceTypes || [],
        status: 'Upcoming',
        crowdLevel: 'Medium'
      });

      await event.save();

      res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// =======================
// GET ALL EVENTS (Public)
// =======================
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

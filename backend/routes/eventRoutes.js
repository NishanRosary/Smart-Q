const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const Queue = require("../models/queue");
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
      const { title, organizationType, organizationName, date, time, location, serviceTypes, totalTokens } = req.body;
      const parsedTotalTokens = Number(totalTokens);

      // Validate required fields
      if (!title || !organizationType || !organizationName || !date || !time || !location || !Number.isInteger(parsedTotalTokens)) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (parsedTotalTokens < 1 || parsedTotalTokens > 9999) {
        return res.status(400).json({ message: "Total tokens must be between 1 and 9999" });
      }

      const event = new Event({
        title,
        organizationType,
        organizationName,
        date,
        time,
        location,
        totalTokens: parsedTotalTokens,
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
    const eventsWithAvailability = await Promise.all(
      events.map(async (event) => {
        const eventId = String(event._id);
        const joinedTokens = await Queue.countDocuments({
          eventId,
          status: { $ne: "cancelled" }
        });
        const inProgressTokens = await Queue.countDocuments({
          eventId,
          status: "serving"
        });

        const totalTokens = Number(event.totalTokens) || 0;
        const availableTokens = Math.max(totalTokens - joinedTokens, 0);
        const isFull = availableTokens <= 0;

        let computedStatus = "Upcoming";
        if (inProgressTokens > 0) {
          computedStatus = "Ongoing";
        } else if (isFull) {
          computedStatus = "Full";
        }

        return {
          ...event.toObject(),
          id: String(event._id),
          status: computedStatus,
          joinedTokens,
          availableTokens,
          isFull
        };
      })
    );

    res.json(eventsWithAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

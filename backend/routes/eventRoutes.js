const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const Queue = require("../models/queue");
const EventHistory = require("../models/eventHistory");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const { purgeExpiredEvents } = require("../services/eventCleanupService");

// =======================
// CREATE EVENT (Admin)
// =======================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const {
        title,
        organizationType,
        organizationName,
        startDate,
        endDate,
        time,
        location,
        serviceTypes,
        totalTokens
      } = req.body;

      const parsedTotalTokens = Number(totalTokens);

      if (
        !title ||
        !organizationType ||
        !organizationName ||
        !startDate ||
        !endDate ||
        !time ||
        !location ||
        !Number.isInteger(parsedTotalTokens)
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const parsedStartDate = new Date(`${startDate}T00:00:00`);
      const parsedEndDate = new Date(`${endDate}T00:00:00`);
      if (
        Number.isNaN(parsedStartDate.getTime()) ||
        Number.isNaN(parsedEndDate.getTime())
      ) {
        return res.status(400).json({ message: "Invalid start or end date" });
      }

      if (parsedEndDate < parsedStartDate) {
        return res.status(400).json({
          message: "End date must be the same as or later than start date"
        });
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      if (parsedEndDate < todayStart) {
        return res.status(400).json({
          message: "End date cannot be in the past"
        });
      }

      if (parsedTotalTokens < 1 || parsedTotalTokens > 9999) {
        return res.status(400).json({
          message: "Total tokens must be between 1 and 9999"
        });
      }

      const event = new Event({
        title,
        organizationType,
        organizationName,
        startDate,
        endDate,
        date: startDate,
        time,
        location,
        totalTokens: parsedTotalTokens,
        serviceTypes: serviceTypes || [],
        status: "Upcoming",
        crowdLevel: "Medium",
        branchId: req.user.branchId // branch isolation
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
    try {
      await purgeExpiredEvents();
    } catch (cleanupError) {
      console.error("Expired events cleanup error:", cleanupError.message);
    }

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

// =======================
// COMPLETE EVENT (Admin)
// =======================
router.post(
  "/:id/complete",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Capture queue stats before completion
      const eventIdStr = String(id);
      const usersJoined = await Queue.countDocuments({
        eventId: eventIdStr,
        status: { $ne: "cancelled" }
      });
      const usersCompleted = await Queue.countDocuments({
        eventId: eventIdStr,
        status: "completed"
      });
      const usersCancelled = await Queue.countDocuments({
        eventId: eventIdStr,
        status: "cancelled"
      });
      const usersServing = await Queue.countDocuments({
        eventId: eventIdStr,
        status: "serving"
      });

      // Archive the event to history as completed
      const historyRecord = new EventHistory({
        originalEventId: eventIdStr,
        title: event.title,
        organizationType: event.organizationType,
        organizationName: event.organizationName,
        startDate: event.startDate,
        endDate: event.endDate,
        date: event.date,
        time: event.time,
        location: event.location,
        totalTokens: event.totalTokens,
        serviceTypes: event.serviceTypes || [],
        status: "Completed",
        crowdLevel: event.crowdLevel || "Medium",
        deletionReason: "completed",
        deletedAt: new Date(),
        usersJoined,
        usersCompleted,
        usersCancelled,
        usersServing,
        eventCreatedAt: event.createdAt
      });

      await historyRecord.save();

      // Remove queue entries and the event
      await Queue.deleteMany({ eventId: eventIdStr });
      await Event.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Event marked as completed and archived to history"
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// =======================
// DELETE EVENT (Admin)
// =======================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Capture queue stats before deletion
      const eventIdStr = String(id);
      const usersJoined = await Queue.countDocuments({
        eventId: eventIdStr,
        status: { $ne: "cancelled" }
      });
      const usersCompleted = await Queue.countDocuments({
        eventId: eventIdStr,
        status: "completed"
      });
      const usersCancelled = await Queue.countDocuments({
        eventId: eventIdStr,
        status: "cancelled"
      });
      const usersServing = await Queue.countDocuments({
        eventId: eventIdStr,
        status: "serving"
      });

      // Archive the event to history before deleting
      const historyRecord = new EventHistory({
        originalEventId: eventIdStr,
        title: event.title,
        organizationType: event.organizationType,
        organizationName: event.organizationName,
        startDate: event.startDate,
        endDate: event.endDate,
        date: event.date,
        time: event.time,
        location: event.location,
        totalTokens: event.totalTokens,
        serviceTypes: event.serviceTypes || [],
        status: event.status || "Completed",
        crowdLevel: event.crowdLevel || "Medium",
        deletionReason: "manual",
        deletedAt: new Date(),
        usersJoined,
        usersCompleted,
        usersCancelled,
        usersServing,
        eventCreatedAt: event.createdAt
      });

      await historyRecord.save();

      // Delete related queue entries for this event to avoid orphaned records.
      await Queue.deleteMany({ eventId: eventIdStr });
      await Event.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Event deleted and archived to history successfully"
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;

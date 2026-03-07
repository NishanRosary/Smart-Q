const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const Queue = require("../models/queue");
const EventHistory = require("../models/eventHistory");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const { isEventExpired } = require("../services/eventCleanupService");

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
        doctorName,
        profession,
        hrOrPocName,
        startDate,
        endDate,
        startTime,
        endTime,
        time,
        location,
        serviceTypes,
        totalTokens
      } = req.body;
      const normalizedStartTime = startTime || time;
      const normalizedEndTime = endTime || startTime || time;

      const parsedTotalTokens = Number(totalTokens);

      if (
        !title ||
        !organizationType ||
        !organizationName ||
        !startDate ||
        !endDate ||
        !normalizedStartTime ||
        !normalizedEndTime ||
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

      const isValidTime = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ""));
      if (!isValidTime(normalizedStartTime) || !isValidTime(normalizedEndTime)) {
        return res.status(400).json({
          message: "Invalid start or end time format"
        });
      }

      if (startDate === endDate && normalizedEndTime <= normalizedStartTime) {
        return res.status(400).json({
          message: "End time must be later than start time for single-day events"
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

      const normalizedDoctorName = String(doctorName || "").trim();
      const normalizedProfession = String(profession || "").trim();
      const normalizedHrOrPocName = String(hrOrPocName || "").trim();

      if (organizationType === "Hospital") {
        if (!normalizedDoctorName || !normalizedProfession) {
          return res.status(400).json({
            message: "Doctor name and profession are required for Hospital events"
          });
        }
      }

      if (organizationType === "Interview") {
        if (!normalizedHrOrPocName) {
          return res.status(400).json({
            message: "HR name / POC name is required for Interview events"
          });
        }
      }

      const timeRange =
        normalizedStartTime === normalizedEndTime
          ? normalizedStartTime
          : `${normalizedStartTime} - ${normalizedEndTime}`;

      const event = new Event({
        title,
        organizationType,
        organizationName,
        doctorName: normalizedDoctorName || undefined,
        profession: normalizedProfession || undefined,
        hrOrPocName: normalizedHrOrPocName || undefined,
        startDate,
        endDate,
        date: startDate,
        time: timeRange,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
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
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    const activeEvents = events.filter((event) => !isEventExpired(event));
    const eventIds = activeEvents.map((event) => String(event._id));

    let queueStatsByEventId = new Map();
    if (eventIds.length > 0) {
      const queueStats = await Queue.aggregate([
        { $match: { eventId: { $in: eventIds } } },
        {
          $group: {
            _id: "$eventId",
            joinedTokens: {
              $sum: {
                $cond: [{ $ne: ["$status", "cancelled"] }, 1, 0]
              }
            },
            inProgressTokens: {
              $sum: {
                $cond: [{ $eq: ["$status", "serving"] }, 1, 0]
              }
            },
            activeQueueCount: {
              $sum: {
                $cond: [{ $in: ["$status", ["waiting", "serving"]] }, 1, 0]
              }
            }
          }
        }
      ]);

      queueStatsByEventId = new Map(
        queueStats.map((stat) => [String(stat._id), stat])
      );
    }

    const eventsWithAvailability = activeEvents.map((event) => {
      const eventId = String(event._id);
      const stats = queueStatsByEventId.get(eventId) || {};
      const joinedTokens = Number(stats.joinedTokens) || 0;
      const inProgressTokens = Number(stats.inProgressTokens) || 0;
      const activeQueueCount = Number(stats.activeQueueCount) || 0;
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
        ...event,
        id: eventId,
        status: computedStatus,
        joinedTokens,
        availableTokens,
        isFull,
        activeQueueCount
      };
    });

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

      const eventIdStr = String(id);

      // Validate: all tokens must be used
      const usersJoined = await Queue.countDocuments({
        eventId: eventIdStr,
        status: { $ne: "cancelled" }
      });
      const totalTokens = Number(event.totalTokens) || 0;
      const availableTokens = Math.max(totalTokens - usersJoined, 0);

      if (availableTokens > 0) {
        return res.status(400).json({
          message: "Cannot complete event: tokens are still available. All tokens must be used first."
        });
      }

      // Validate: no active (waiting/serving) queue entries
      const activeQueueCount = await Queue.countDocuments({
        eventId: eventIdStr,
        status: { $in: ["waiting", "serving"] }
      });

      if (activeQueueCount > 0) {
        return res.status(400).json({
          message: "Cannot complete event: there are still active queue entries (waiting or being served). All must be completed or cancelled first."
        });
      }

      // Capture queue stats before completion
      const usersCompleted = await Queue.countDocuments({
        eventId: eventIdStr,
        status: "completed"
      });
      const usersCancelled = await Queue.countDocuments({
        eventId: eventIdStr,
        status: "cancelled"
      });
      const usersServing = 0; // Already verified no serving entries

      // Archive the event to history as completed
      const historyRecord = new EventHistory({
        originalEventId: eventIdStr,
        title: event.title,
        organizationType: event.organizationType,
        organizationName: event.organizationName,
        doctorName: event.doctorName,
        profession: event.profession,
        hrOrPocName: event.hrOrPocName,
        startDate: event.startDate,
        endDate: event.endDate,
        date: event.date,
        time: event.time,
        startTime: event.startTime,
        endTime: event.endTime,
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
        doctorName: event.doctorName,
        profession: event.profession,
        hrOrPocName: event.hrOrPocName,
        startDate: event.startDate,
        endDate: event.endDate,
        date: event.date,
        time: event.time,
        startTime: event.startTime,
        endTime: event.endTime,
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

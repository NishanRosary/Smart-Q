const Event = require("../models/event");
const Queue = require("../models/queue");
const EventHistory = require("../models/eventHistory");

const parseDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const parseTimeValue = (value, fallback = { hours: 23, minutes: 59 }) => {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  const hhmmMatch = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (hhmmMatch) {
    return {
      hours: Number(hhmmMatch[1]),
      minutes: Number(hhmmMatch[2])
    };
  }

  // Legacy range support: "09:00 - 17:00"
  if (trimmed.includes("-")) {
    const parts = trimmed.split("-").map((p) => p.trim());
    return parseTimeValue(parts[parts.length - 1], fallback);
  }

  return fallback;
};

const getEventExpiryDate = (event) => {
  const endDateValue = event.endDate || event.date;
  if (!endDateValue) return null;

  const parsedDate = parseDateValue(endDateValue);
  if (!parsedDate) return null;

  const endTimeValue = event.endTime || event.time;
  const { hours, minutes } = parseTimeValue(endTimeValue);

  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
    hours,
    minutes,
    59,
    999
  );
};

const isEventExpired = (event, now = new Date()) => {
  const expiryDate = getEventExpiryDate(event);
  return Boolean(expiryDate && expiryDate < now);
};

const purgeExpiredEvents = async () => {
  const now = new Date();

  const events = await Event.find();
  const expiredEvents = events.filter((event) => {
    return isEventExpired(event, now);
  });

  if (expiredEvents.length === 0) {
    return { deletedEvents: 0, deletedQueues: 0 };
  }

  // Archive each expired event to history before deleting
  for (const event of expiredEvents) {
    const eventIdStr = String(event._id);

    // Check if already archived (avoid duplicates)
    const alreadyArchived = await EventHistory.findOne({ originalEventId: eventIdStr });
    if (!alreadyArchived) {
      // Capture queue stats
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

      const historyRecord = new EventHistory({
        originalEventId: eventIdStr,
        title: event.title,
        organizationType: event.organizationType,
        organizationName: event.organizationName,
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
        deletionReason: "expired",
        deletedAt: new Date(),
        usersJoined,
        usersCompleted,
        usersCancelled,
        usersServing,
        eventCreatedAt: event.createdAt
      });

      await historyRecord.save();
    }
  }

  const expiredEventIds = expiredEvents.map((event) => String(event._id));

  const queueResult = await Queue.deleteMany({ eventId: { $in: expiredEventIds } });
  const eventResult = await Event.deleteMany({ _id: { $in: expiredEventIds } });

  return {
    deletedEvents: eventResult.deletedCount || 0,
    deletedQueues: queueResult.deletedCount || 0
  };
};

module.exports = {
  purgeExpiredEvents,
  getEventExpiryDate,
  isEventExpired
};

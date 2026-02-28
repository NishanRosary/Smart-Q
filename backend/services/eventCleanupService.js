const Event = require("../models/event");
const Queue = require("../models/queue");

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

const getEventExpiryDate = (event) => {
  const endDateValue = event.endDate || event.date;
  if (!endDateValue) return null;

  const parsedDate = parseDateValue(endDateValue);
  if (!parsedDate) return null;

  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
    23,
    59,
    59,
    999
  );
};

const purgeExpiredEvents = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const events = await Event.find({}, { _id: 1, endDate: 1, date: 1 });
  const expiredEventIds = events
    .filter((event) => {
      const expiryDate = getEventExpiryDate(event);
      return expiryDate && expiryDate < todayStart;
    })
    .map((event) => String(event._id));

  if (expiredEventIds.length === 0) {
    return { deletedEvents: 0, deletedQueues: 0 };
  }

  const queueResult = await Queue.deleteMany({ eventId: { $in: expiredEventIds } });
  const eventResult = await Event.deleteMany({ _id: { $in: expiredEventIds } });

  return {
    deletedEvents: eventResult.deletedCount || 0,
    deletedQueues: queueResult.deletedCount || 0
  };
};

module.exports = {
  purgeExpiredEvents
};

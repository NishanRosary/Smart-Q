const Event = require("../models/event");
const Queue = require("../models/queue");

const getEventExpiryDate = (event) => {
  const endDateValue = event.endDate || event.date;
  if (!endDateValue) return null;

  const endOfDay = new Date(`${endDateValue}T23:59:59.999`);
  if (Number.isNaN(endOfDay.getTime())) return null;
  return endOfDay;
};

const purgeExpiredEvents = async () => {
  const now = new Date();
  const events = await Event.find({}, { _id: 1, endDate: 1, date: 1 });
  const expiredEventIds = events
    .filter((event) => {
      const expiryDate = getEventExpiryDate(event);
      return expiryDate && expiryDate < now;
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

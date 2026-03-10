export const getUserInitials = (name) => {
  if (!name || !String(name).trim()) {
    return "U";
  }

  return String(name)
    .trim()
    .split(/\s+/)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatTimeLabel = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") {
    return "-";
  }

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return timeStr;
  }

  const hours = Number(match[1]);
  const minutes = match[2];

  if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
    return timeStr;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
};

export const formatEventSchedule = ({
  startDate,
  endDate,
  startTime,
  endTime,
  formatDate = (value) => value
}) => {
  const startDateLabel = startDate ? formatDate(startDate) : "-";
  const endDateLabel = endDate ? formatDate(endDate) : startDateLabel;

  return {
    dateLabel: `${startDateLabel} to ${endDateLabel}`,
    timeLabel: `${formatTimeLabel(startTime)} to ${formatTimeLabel(endTime)}`
  };
};

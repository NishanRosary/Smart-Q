const normalizeText = (value) => String(value || "").trim().toLowerCase();

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getEventContactName = (event) =>
  event?.doctorName || event?.hrOrPocName || "";

export const getEventContactLabel = (event) => {
  if (event?.doctorName) {
    return event?.profession
      ? `Doctor: ${event.doctorName} (${event.profession})`
      : `Doctor: ${event.doctorName}`;
  }

  if (event?.hrOrPocName) {
    return `HR / POC: ${event.hrOrPocName}`;
  }

  return "Coordinator details available at venue";
};

export const getEventDateRange = (event) => {
  const start = safeDate(event?.startDate || event?.date);
  const end = safeDate(event?.endDate || event?.startDate || event?.date);

  return {
    start,
    end: end || start
  };
};

export const formatEventDateRange = (event, locale = "en-US") => {
  const { start, end } = getEventDateRange(event);

  if (!start) return "Date to be announced";

  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const startLabel = formatter.format(start);
  const endLabel = end ? formatter.format(end) : startLabel;

  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
};

export const getEventSearchTokens = (event) => {
  const serviceTokens = Array.isArray(event?.serviceTypes)
    ? event.serviceTypes.join(" ")
    : "";

  return [
    serviceTokens,
    event?.organizationName,
    getEventContactName(event)
  ]
    .filter(Boolean)
    .join(" ");
};

const matchesSearch = (event, searchTerm) => {
  const query = normalizeText(searchTerm);
  if (!query) return true;

  return normalizeText(getEventSearchTokens(event)).includes(query);
};

const matchesOrganizationType = (event, organizationType) => {
  const query = normalizeText(organizationType);
  if (!query) return true;
  return normalizeText(event?.organizationType) === query;
};

const matchesEventTitle = (event, title) => {
  const query = normalizeText(title);
  if (!query) return true;
  return normalizeText(event?.title) === query;
};

const matchesDateRange = (event, fromDate, toDate) => {
  if (!fromDate && !toDate) return true;

  const { start, end } = getEventDateRange(event);
  if (!start) return false;

  const rangeStart = fromDate ? safeDate(fromDate) : null;
  const rangeEnd = toDate ? safeDate(toDate) : null;

  if (rangeStart && rangeEnd) {
    return start <= rangeEnd && (end || start) >= rangeStart;
  }

  if (rangeStart) {
    return (end || start) >= rangeStart;
  }

  return start <= rangeEnd;
};

const matchesDistanceRange = (event, distanceRangeKm) => {
  const maxDistance = Number(distanceRangeKm);

  if (!Number.isFinite(maxDistance) || maxDistance <= 0) {
    return true;
  }

  return Number.isFinite(event?.distanceKm) && event.distanceKm <= maxDistance;
};

export const filterEvents = (events, filters) =>
  (events || []).filter((event) => {
    return (
      matchesSearch(event, filters?.searchTerm) &&
      matchesOrganizationType(event, filters?.organizationType) &&
      matchesEventTitle(event, filters?.eventTitle) &&
      matchesDateRange(event, filters?.fromDate, filters?.toDate) &&
      matchesDistanceRange(event, filters?.distanceRangeKm)
    );
  });

export const getOrganizationTypeOptions = (events) =>
  [...new Set((events || []).map((event) => event?.organizationType).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

export const getEventTitleOptions = (events) =>
  [...new Set((events || []).map((event) => event?.title).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

const NUMBER_FIELDS = [
  "dayOfWeek",
  "hourOfDay",
  "month",
  "dayOfMonth",
  "positionInQueue",
  "queueLength",
  "waitingTime",
  "queueDensity"
];

const sanitizeText = (value, fallback = "General") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 80) : fallback;
};

const sanitizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeInferenceInput = (payload = {}) => {
  if (!payload || typeof payload !== "object") return {};

  const clean = { ...payload };
  clean.service = sanitizeText(clean.service, "General");

  NUMBER_FIELDS.forEach((key) => {
    if (key in clean) {
      clean[key] = sanitizeNumber(clean[key], 0);
    }
  });

  if (Array.isArray(clean.suggestions)) {
    clean.suggestions = clean.suggestions.slice(0, 24);
  }

  return clean;
};

const endpointSchemas = {
  "/predict/waiting-time": {
    required: ["service", "dayOfWeek", "hourOfDay", "month", "dayOfMonth", "positionInQueue"],
    output: (data) =>
      Boolean(data && typeof data === "object" && Number.isFinite(Number(data.waitingTime)))
  },
  "/predict/queue-length": {
    required: ["service", "dayOfWeek", "hourOfDay", "month", "dayOfMonth"],
    output: (data) =>
      Boolean(data && typeof data === "object" && Number.isFinite(Number(data.queueLength)))
  },
  "/predict/no-show": {
    required: ["service", "dayOfWeek", "hourOfDay", "month", "dayOfMonth", "positionInQueue"],
    output: (data) =>
      Boolean(data && typeof data === "object" && Number.isFinite(Number(data.noShowProbability)))
  },
  "/predict/peak-hours": {
    required: ["service", "dayOfWeek", "hourOfDay", "month", "dayOfMonth"],
    output: (data) =>
      Boolean(data && typeof data === "object" && Number.isFinite(Number(data.queueDensity)))
  },
  "/suggest/best-time": {
    required: ["service", "dayOfWeek"],
    output: (data) => Boolean(data && typeof data === "object" && Array.isArray(data.suggestions))
  },
  "/health": {
    required: [],
    output: (data) => Boolean(data && typeof data === "object" && "trained" in data)
  }
};

const validateInputPayload = (endpoint, payload = {}) => {
  const schema = endpointSchemas[endpoint];
  if (!schema) return true;
  return schema.required.every((field) => payload[field] !== null && payload[field] !== undefined);
};

const validateOutputPayload = (endpoint, payload) => {
  const schema = endpointSchemas[endpoint];
  if (!schema) return Boolean(payload && typeof payload === "object");
  return schema.output(payload);
};

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const isPredictionBundle = (payload) =>
  isObject(payload) &&
  Array.isArray(payload.peakTimes) &&
  Array.isArray(payload.waitTimePredictions) &&
  Array.isArray(payload.optimalVisitTimes) &&
  isObject(payload.mlModelStats);

module.exports = {
  sanitizeInferenceInput,
  validateInputPayload,
  validateOutputPayload,
  isObject,
  isPredictionBundle
};

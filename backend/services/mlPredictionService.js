const { callMLInference, getMLHealth } = require("../../src/services/mlSafeWrapper");
const { isPredictionBundle } = require("../../src/utils/mlValidation");
const logger = require("../../src/utils/mlLogger");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "https://smartq-ml.onrender.com";
const ML_HEALTH_TIMEOUT_MS = Number(process.env.ML_HEALTH_TIMEOUT_MS || 800);
const ML_HEALTH_CACHE_TTL_MS = Number(process.env.ML_HEALTH_CACHE_TTL_MS || 15000);

const PEAK_HIGH_THRESHOLD = 25;
const PEAK_MEDIUM_THRESHOLD = 12;

const toPeakLevel = (queueDensity) => {
  if (queueDensity > PEAK_HIGH_THRESHOLD) return "High";
  if (queueDensity > PEAK_MEDIUM_THRESHOLD) return "Medium";
  return "Low";
};

const mapBestTimeScore = (queueLength, waitingTime) => {
  // Lower queue length and wait time should produce better scores.
  const penalty = Number(queueLength || 0) * 2 + Number(waitingTime || 0);
  return Math.max(0, Math.min(100, 100 - penalty));
};

let cachedHealth = null;
let cachedHealthAt = 0;

const getHealth = async () => {
  const now = Date.now();
  if (cachedHealth && now - cachedHealthAt < ML_HEALTH_CACHE_TTL_MS) {
    return cachedHealth;
  }

  const health = await getMLHealth({
    mlServiceUrl: ML_SERVICE_URL,
    timeoutMs: ML_HEALTH_TIMEOUT_MS
  });

  cachedHealth = health && typeof health === "object" ? health : null;
  cachedHealthAt = now;

  return cachedHealth;
};

const clearHealthCache = () => {
  cachedHealth = null;
  cachedHealthAt = 0;
};

const buildFallbackPredictionBundle = ({
  service = "General",
  positionInQueue = 1,
  totalWaiting = 0,
  reason = "ml-unavailable"
} = {}) => {
  const safePosition = Math.max(1, Number(positionInQueue || 1));
  const safeWaiting = Math.max(0, Number(totalWaiting || 0));
  const now = new Date();

  const peakTimes = Array.from({ length: 6 }).map((_, offset) => {
    const d = new Date(now.getTime() + offset * 60 * 60 * 1000);
    const load = Math.max(0, safeWaiting + (offset % 3) - 1);
    return {
      hour: `${String(d.getHours()).padStart(2, "0")}:00`,
      prediction: toPeakLevel(load),
      customers: load
    };
  });

  const waitTimePredictions = Array.from({ length: 4 }).map((_, offset) => {
    const predictedWait = Math.max(0, Math.round((safePosition + Math.max(0, safeWaiting - offset)) * 2));
    return {
      time: offset === 0 ? "Now" : `+${offset} hour${offset > 1 ? "s" : ""}`,
      predictedWait
    };
  });

  const optimalVisitTimes = [1, 2, 3].map((offset) => {
    const hour = (now.getHours() + offset + 1) % 24;
    const nextHour = (hour + 1) % 24;
    const queueLength = Math.max(0, safeWaiting - offset);
    const waitTime = Math.max(1, queueLength * 2);
    return {
      time: `${String(hour).padStart(2, "0")}:00-${String(nextHour).padStart(2, "0")}:00`,
      score: mapBestTimeScore(queueLength, waitTime),
      waitTime,
      crowdLevel: toPeakLevel(queueLength)
    };
  });

  return {
    peakTimes,
    waitTimePredictions,
    optimalVisitTimes,
    totalWaiting: safeWaiting,
    serviceWaiting: null,
    crowdLevel: toPeakLevel(safeWaiting),
    mlModelStats: {
      isSimulated: true,
      trained: false,
      modelAccuracy: null,
      predictionsToday: null,
      avgAccuracy: null,
      lastUpdated: now.toISOString(),
      reason,
      service
    }
  };
};

const getPredictionsIfTrained = async ({ service = "General", positionInQueue = 1, totalWaiting = 0 } = {}) => {
  const health = await getHealth();
  if (!health || !health.trained) {
    return buildFallbackPredictionBundle({
      service,
      positionInQueue,
      totalWaiting,
      reason: "ml-not-trained"
    });
  }

  const now = new Date();
  const call = async (endpoint, payload) =>
    callMLInference({
      endpoint,
      payload,
      mlServiceUrl: ML_SERVICE_URL,
      timeoutMs: 5000
    });

  try {
    const peakTimes = await Promise.all(
      Array.from({ length: 6 }).map(async (_, offset) => {
        const d = new Date(now.getTime() + offset * 60 * 60 * 1000);
        const current = await call("/predict/peak-hours", {
          service,
          dayOfWeek: d.getDay(),
          hourOfDay: d.getHours(),
          month: d.getMonth() + 1,
          dayOfMonth: d.getDate()
        });
        const density = Number(current.queueDensity ?? current.current?.queueDensity ?? 0);
        return {
          hour: `${String(d.getHours()).padStart(2, "0")}:00`,
          prediction: toPeakLevel(density),
          customers: Math.max(0, Math.round(density))
        };
      })
    );

    const waitTimePredictions = await Promise.all(
      Array.from({ length: 4 }).map(async (_, offset) => {
        const d = new Date(now.getTime() + offset * 60 * 60 * 1000);
        const adjustedPosition = Math.max(1, Number(positionInQueue || 1) - offset);
        const result = await call("/predict/waiting-time", {
          service,
          dayOfWeek: d.getDay(),
          hourOfDay: d.getHours(),
          month: d.getMonth() + 1,
          dayOfMonth: d.getDate(),
          positionInQueue: adjustedPosition
        });
        return {
          time: offset === 0 ? "Now" : `+${offset} hour${offset > 1 ? "s" : ""}`,
          predictedWait: Math.max(0, Math.round(Number(result.waitingTime || 0)))
        };
      })
    );

    const bestTimeRaw = await call("/suggest/best-time", {
      service,
      dayOfWeek: now.getDay()
    });
    const suggestions = Array.isArray(bestTimeRaw.suggestions) ? bestTimeRaw.suggestions : [];
    const optimalVisitTimes = suggestions.map((s) => {
      const hour = String(s.hour).padStart(2, "0");
      const nextHour = String((Number(s.hour) + 1) % 24).padStart(2, "0");
      const waitTime = Math.max(0, Math.round(Number(s.waitingTime || 0)));
      const queueLength = Math.max(0, Math.round(Number(s.queueLength || 0)));
      return {
        time: `${hour}:00-${nextHour}:00`,
        score: mapBestTimeScore(queueLength, waitTime),
        waitTime,
        crowdLevel: toPeakLevel(queueLength)
      };
    });

    const result = {
      peakTimes,
      waitTimePredictions,
      optimalVisitTimes,
      totalWaiting,
      serviceWaiting: null,
      crowdLevel: toPeakLevel(totalWaiting),
      mlModelStats: {
        isSimulated: false,
        trained: true,
        modelAccuracy: null,
        predictionsToday: null,
        avgAccuracy: null,
        lastUpdated: now.toISOString()
      }
    };

    if (!isPredictionBundle(result)) {
      logger.warn("Prediction bundle shape invalid; returning simulated fallback");
      return buildFallbackPredictionBundle({
        service,
        positionInQueue,
        totalWaiting,
        reason: "invalid-ml-shape"
      });
    }

    return result;
  } catch (error) {
    logger.error("ML prediction build failed", { message: error.message });
    clearHealthCache();
    return buildFallbackPredictionBundle({
      service,
      positionInQueue,
      totalWaiting,
      reason: "ml-call-failed"
    });
  }
};

module.exports = {
  getHealth,
  getPredictionsIfTrained
};

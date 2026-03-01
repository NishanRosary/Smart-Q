const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

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

const getHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3000 });
    return response.data || {};
  } catch {
    return null;
  }
};

const getPredictionsIfTrained = async ({ service = "General", positionInQueue = 1, totalWaiting = 0 } = {}) => {
  const health = await getHealth();
  if (!health || !health.trained) {
    return null;
  }

  const now = new Date();
  const call = async (endpoint, payload) => {
    const response = await axios.post(`${ML_SERVICE_URL}${endpoint}`, payload, { timeout: 5000 });
    return response.data || {};
  };

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

    return {
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
  } catch (error) {
    console.error("ML prediction build failed:", error.message);
    return null;
  }
};

module.exports = {
  getHealth,
  getPredictionsIfTrained
};

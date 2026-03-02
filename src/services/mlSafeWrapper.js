const mlConfig = require("../config/mlConfig");
const logger = require("../utils/mlLogger");
const {
  sanitizeInferenceInput,
  validateInputPayload,
  validateOutputPayload
} = require("../utils/mlValidation");

const fallbackByEndpoint = {
  "/health": { status: "fallback", trained: false },
  "/predict/waiting-time": { waitingTime: 0, unit: "minutes", _fallback: true },
  "/predict/queue-length": { queueLength: 0, _fallback: true },
  "/predict/no-show": { noShowProbability: 0, percentage: 0, _fallback: true },
  "/predict/peak-hours": { queueDensity: 0, isPeak: false, _fallback: true },
  "/suggest/best-time": { suggestions: [], _fallback: true },
  "/queue/joined": { accepted: false, _fallback: true }
};

const withTimeout = (promise, timeoutMs, endpoint, onTimeout) => {
  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      if (typeof onTimeout === "function") onTimeout();
      reject(new Error(`ML request timeout (${endpoint}) after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};

const fetchJson = async ({ method, url, payload, timeoutMs }) => {
  const controller = new AbortController();
  const fetchPromise = fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: payload ? JSON.stringify(payload) : undefined,
    signal: controller.signal
  }).then(async (response) => {
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const msg = (data && data.error) || (data && data.message) || response.statusText;
      throw new Error(`ML HTTP ${response.status}: ${msg}`);
    }
    return data;
  });

  return withTimeout(fetchPromise, timeoutMs, url, () => controller.abort());
};

const getFallback = (endpoint, fallback) => {
  const candidate = fallback || fallbackByEndpoint[endpoint] || { _fallback: true };
  return { ...candidate };
};

const callMLInference = async ({
  endpoint,
  payload,
  mlServiceUrl,
  timeoutMs = mlConfig.inferenceTimeoutMs,
  fallback
}) => {
  if (!mlConfig.enableML) {
    logger.info("ML disabled by feature flag", { endpoint });
    return getFallback(endpoint, fallback);
  }

  const input = sanitizeInferenceInput(payload);
  if (!validateInputPayload(endpoint, input)) {
    logger.warn("ML input validation failed; serving fallback", { endpoint });
    return getFallback(endpoint, fallback);
  }

  try {
    const data = await fetchJson({
      method: "POST",
      url: `${mlServiceUrl}${endpoint}`,
      payload: input,
      timeoutMs
    });

    if (!validateOutputPayload(endpoint, data)) {
      logger.warn("ML output validation failed; serving fallback", { endpoint });
      return getFallback(endpoint, fallback);
    }

    return data;
  } catch (error) {
    logger.warn("ML inference failed; serving fallback", {
      endpoint,
      message: error.message
    });
    return getFallback(endpoint, fallback);
  }
};

const getMLHealth = async ({ mlServiceUrl, timeoutMs = 3000 }) => {
  if (!mlConfig.enableML) {
    return { status: "disabled", trained: false };
  }

  try {
    const data = await fetchJson({
      method: "GET",
      url: `${mlServiceUrl}/health`,
      timeoutMs
    });
    if (!validateOutputPayload("/health", data)) {
      return getFallback("/health");
    }
    return data;
  } catch (error) {
    logger.warn("ML health check failed; assuming not trained", { message: error.message });
    return getFallback("/health");
  }
};

module.exports = {
  callMLInference,
  getMLHealth,
  getFallback
};

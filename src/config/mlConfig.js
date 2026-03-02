const mlConfig = Object.freeze({
  enableML: process.env.ENABLE_ML !== "false",
  inferenceTimeoutMs: Number(process.env.ML_INFERENCE_TIMEOUT_MS || 5000),
  fallbackStrategy: process.env.ML_FALLBACK_STRATEGY || "deterministic"
});

module.exports = mlConfig;

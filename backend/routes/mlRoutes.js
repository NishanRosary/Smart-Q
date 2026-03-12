const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const axios = require("axios");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const { mlPredictLimiter } = require("../middleware/rateLimiters");
const mlConfig = require("../../src/config/mlConfig");
const { callMLInference, getMLHealth } = require("../../src/services/mlSafeWrapper");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "https://smartq-ml.onrender.com";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const toPositiveIntOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const isValidDateString = (value) => {
  if (value === undefined || value === null || value === "") return true;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const isValidHour = (value) => {
  if (value === undefined || value === null || value === "") return true;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 23;
};

const isValidDayOfWeek = (value) => {
  if (value === undefined || value === null || value === "") return true;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6;
};

const validatePredictPayload = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid input data";
  }

  const { type } = body;
  if (!isNonEmptyString(type)) {
    return "Prediction type is required.";
  }

  switch (type) {
    case "waiting-time":
    case "no-show": {
      const hasToken = toPositiveIntOrNull(body.tokenNumber) !== null;
      const hasService = isNonEmptyString(body.service);
      const position =
        body.positionInQueue === undefined
          ? 1
          : toPositiveIntOrNull(body.positionInQueue);

      if (!hasToken && !hasService) {
        return "Token number or service is required";
      }
      if (body.tokenNumber !== undefined && !hasToken) {
        return "tokenNumber must be a positive integer";
      }
      if (position === null) {
        return "positionInQueue must be a positive integer";
      }
      return null;
    }

    case "queue-length":
    case "peak-hours":
      if (!isValidDateString(body.date)) return "date must be a valid date";
      if (!isValidHour(body.hour)) return "hour must be an integer between 0 and 23";
      return null;

    case "best-time":
      if (!isValidDayOfWeek(body.dayOfWeek)) {
        return "dayOfWeek must be an integer between 0 and 6";
      }
      return null;

    default:
      return "Invalid prediction type.";
  }
};

/* =======================
   Helper Functions
======================= */

const prepareFeatures = (queueItem, additionalData = {}) => {
  const now = new Date();
  const joinedAt = queueItem.joinedAt ? new Date(queueItem.joinedAt) : now;

  return {
    service: queueItem.service || "General",
    dayOfWeek: joinedAt.getDay(),
    hourOfDay: joinedAt.getHours(),
    month: joinedAt.getMonth() + 1,
    dayOfMonth: joinedAt.getDate(),
    positionInQueue:
      queueItem.positionInQueue || additionalData.positionInQueue || 1,
    ...additionalData
  };
};

const callMLService = async (endpoint, data) => {
  return callMLInference({
    endpoint,
    payload: data,
    mlServiceUrl: ML_SERVICE_URL,
    timeoutMs: mlConfig.inferenceTimeoutMs
  });
};

const ensureModelTrained = async () => {
  const health = await getMLHealth({
    mlServiceUrl: ML_SERVICE_URL,
    timeoutMs: 3000
  });
  return Boolean(health?.trained);
};

/* =======================
   UNIFIED PREDICT ROUTE
======================= */

router.post("/predict", mlPredictLimiter, async (req, res) => {
  try {
    const payloadError = validatePredictPayload(req.body);
    if (payloadError) {
      return res.status(400).json({ message: payloadError });
    }

    if (!(await ensureModelTrained())) {
      return res.status(409).json({ message: "ML model is not trained yet." });
    }

    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Prediction type is required." });
    }

    let endpoint = "";
    let features = {};

    switch (type) {
      case "waiting-time": {
        const { tokenNumber, service, positionInQueue } = req.body;
        const normalizedToken = toPositiveIntOrNull(tokenNumber);
        const normalizedPosition = toPositiveIntOrNull(positionInQueue) || 1;
        const normalizedService = isNonEmptyString(service) ? service.trim() : undefined;

        let queueItem = null;
        if (normalizedToken !== null) {
          queueItem = await Queue.findOne(
            normalizedService
              ? { tokenNumber: normalizedToken, service: normalizedService }
              : { tokenNumber: normalizedToken }
          );
        }

        if (!queueItem && !normalizedService) {
          return res
            .status(400)
            .json({ message: "Token number or service is required" });
        }

        features = prepareFeatures(
          queueItem || { service: normalizedService, joinedAt: new Date() },
          { positionInQueue: normalizedPosition }
        );

        endpoint = "/predict/waiting-time";
        break;
      }

      case "queue-length": {
        const { service, date, hour } = req.body;
        const targetDate = date ? new Date(date) : new Date();
        const targetHour =
          hour !== undefined ? Number(hour) : targetDate.getHours();

        features = {
          service: isNonEmptyString(service) ? service.trim() : "General",
          dayOfWeek: targetDate.getDay(),
          hourOfDay: targetHour,
          month: targetDate.getMonth() + 1,
          dayOfMonth: targetDate.getDate()
        };

        endpoint = "/predict/queue-length";
        break;
      }

      case "no-show": {
        const { tokenNumber, service, positionInQueue } = req.body;
        const normalizedToken = toPositiveIntOrNull(tokenNumber);
        const normalizedPosition = toPositiveIntOrNull(positionInQueue) || 1;
        const normalizedService = isNonEmptyString(service) ? service.trim() : undefined;

        let queueItem = null;
        if (normalizedToken !== null) {
          queueItem = await Queue.findOne(
            normalizedService
              ? { tokenNumber: normalizedToken, service: normalizedService }
              : { tokenNumber: normalizedToken }
          );
        }

        features = prepareFeatures(
          queueItem || { service: normalizedService, joinedAt: new Date() },
          { positionInQueue: normalizedPosition }
        );

        endpoint = "/predict/no-show";
        break;
      }

      case "peak-hours": {
        const { service, date, hour } = req.body;
        const targetDate = date ? new Date(date) : new Date();
        const targetHour =
          hour !== undefined ? Number(hour) : targetDate.getHours();

        features = {
          service: isNonEmptyString(service) ? service.trim() : "General",
          dayOfWeek: targetDate.getDay(),
          hourOfDay: targetHour,
          month: targetDate.getMonth() + 1,
          dayOfMonth: targetDate.getDate()
        };

        endpoint = "/predict/peak-hours";
        break;
      }

      case "best-time": {
        const { service, dayOfWeek } = req.body;

        features = {
          service: isNonEmptyString(service) ? service.trim() : "General",
          dayOfWeek:
            dayOfWeek !== undefined
              ? Number(dayOfWeek)
              : new Date().getDay()
        };

        endpoint = "/suggest/best-time";
        break;
      }

      default:
        return res.status(400).json({ message: "Invalid prediction type." });
    }

    const prediction = await callMLService(endpoint, features);

    res.json({
      type,
      prediction,
      features
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =======================
   ADMIN ROUTES
======================= */

router.post(
  "/train",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const queueData = await Queue.find({}).lean();

      if (queueData.length === 0) {
        return res
          .status(400)
          .json({ message: "No training data available." });
      }

      const totalInQueue = queueData.length;
      const normalizedTrainingData = queueData.map((item, index) => {
        const positionInQueue = Math.max(
          1,
          Number(item.positionInQueue || item.tokenNumber || index + 1)
        );

        return {
          service: item.service || "General",
          joinedAt: (item.createdAt || new Date()).toISOString(),
          positionInQueue,
          waitingTime: Math.max(1, positionInQueue * 4),
          totalInQueue,
          noShow: item.status === "cancelled",
          status: item.status || "waiting"
        };
      });

      const response = await axios.post(
        `${ML_SERVICE_URL}/train`,
        { data: normalizedTrainingData }
      );

      res.json({
        message: "Models trained successfully",
        dataPoints: normalizedTrainingData.length,
        results: response.data
      });

    } catch (error) {
      res.status(500).json({
        message: error.response?.data?.error || error.message,
        note: "Make sure ML service is running on port 5001"
      });
    }
  }
);

router.get(
  "/status",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const response = await axios.get(
        `${ML_SERVICE_URL}/health`
      );

      res.json({
        mlService: "connected",
        ...response.data
      });

    } catch (error) {
      res.json({
        mlService: "disconnected",
        error: error.message
      });
    }
  }
);

module.exports = router;

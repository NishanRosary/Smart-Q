const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const axios = require("axios");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const mlConfig = require("../../src/config/mlConfig");
const { callMLInference, getMLHealth } = require("../../src/services/mlSafeWrapper");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

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

router.post("/predict", async (req, res) => {
  try {
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

        let queueItem = null;
        if (tokenNumber) {
          queueItem = await Queue.findOne({ tokenNumber });
        }

        if (!queueItem && !service) {
          return res
            .status(400)
            .json({ message: "Token number or service is required" });
        }

        features = prepareFeatures(
          queueItem || { service, joinedAt: new Date() },
          { positionInQueue: positionInQueue || 1 }
        );

        endpoint = "/predict/waiting-time";
        break;
      }

      case "queue-length": {
        const { service, date, hour } = req.body;
        const targetDate = date ? new Date(date) : new Date();
        const targetHour =
          hour !== undefined ? hour : targetDate.getHours();

        features = {
          service: service || "General",
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

        let queueItem = null;
        if (tokenNumber) {
          queueItem = await Queue.findOne({ tokenNumber });
        }

        features = prepareFeatures(
          queueItem || { service, joinedAt: new Date() },
          { positionInQueue: positionInQueue || 1 }
        );

        endpoint = "/predict/no-show";
        break;
      }

      case "peak-hours": {
        const { service, date, hour } = req.body;
        const targetDate = date ? new Date(date) : new Date();
        const targetHour =
          hour !== undefined ? hour : targetDate.getHours();

        features = {
          service: service || "General",
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
          service: service || "General",
          dayOfWeek:
            dayOfWeek !== undefined
              ? dayOfWeek
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

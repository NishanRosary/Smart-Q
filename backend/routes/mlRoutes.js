const express = require("express");
const router = express.Router();
const Queue = require("../models/queue");
const axios = require("axios");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

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
  try {
    const response = await axios.post(`${ML_SERVICE_URL}${endpoint}`, data, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error(`ML Service Error (${endpoint}):`, error.message);
    return getFallbackPrediction(endpoint);
  }
};

const getFallbackPrediction = (endpoint) => {
  if (endpoint.includes("waiting-time")) {
    return { waitingTime: 15, unit: "minutes" };
  }
  if (endpoint.includes("queue-length")) {
    return { queueLength: 10 };
  }
  if (endpoint.includes("no-show")) {
    return { noShowProbability: 0.15, percentage: 15 };
  }
  if (endpoint.includes("peak-hours")) {
    return { queueDensity: 20, isPeak: false };
  }
  return {};
};

/* =======================
   PUBLIC ML ROUTES
======================= */

router.post("/predict/waiting-time", async (req, res) => {
  try {
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

    const features = prepareFeatures(
      queueItem || { service, joinedAt: new Date() },
      { positionInQueue: positionInQueue || 1 }
    );

    const prediction = await callMLService(
      "/predict/waiting-time",
      features
    );

    res.json({ ...prediction, features });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/predict/queue-length", async (req, res) => {
  try {
    const { service, date, hour } = req.body;

    const targetDate = date ? new Date(date) : new Date();
    const targetHour =
      hour !== undefined ? hour : targetDate.getHours();

    const features = {
      service: service || "General",
      dayOfWeek: targetDate.getDay(),
      hourOfDay: targetHour,
      month: targetDate.getMonth() + 1,
      dayOfMonth: targetDate.getDate()
    };

    const prediction = await callMLService(
      "/predict/queue-length",
      features
    );

    res.json({ ...prediction, features });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/predict/no-show", async (req, res) => {
  try {
    const { tokenNumber, service, positionInQueue } = req.body;

    let queueItem = null;
    if (tokenNumber) {
      queueItem = await Queue.findOne({ tokenNumber });
    }

    const features = prepareFeatures(
      queueItem || { service, joinedAt: new Date() },
      { positionInQueue: positionInQueue || 1 }
    );

    const prediction = await callMLService("/predict/no-show", features);

    res.json({ ...prediction, features });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/suggest/best-time", async (req, res) => {
  try {
    const { service, dayOfWeek } = req.body;

    const data = {
      service: service || "General",
      dayOfWeek:
        dayOfWeek !== undefined
          ? dayOfWeek
          : new Date().getDay()
    };

    const suggestions = await callMLService(
      "/suggest/best-time",
      data
    );

    res.json({ ...suggestions, ...data });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/predict/peak-hours", async (req, res) => {
  try {
    const { service, date, hour } = req.body;

    const targetDate = date ? new Date(date) : new Date();
    const targetHour =
      hour !== undefined ? hour : targetDate.getHours();

    const features = {
      service: service || "General",
      dayOfWeek: targetDate.getDay(),
      hourOfDay: targetHour,
      month: targetDate.getMonth() + 1,
      dayOfMonth: targetDate.getDate()
    };

    const prediction = await callMLService(
      "/predict/peak-hours",
      features
    );

    res.json({ current: prediction });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =======================
   ADMIN ROUTES (Protected)
======================= */

router.post(
  "/train",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const queueData = await Queue.find({});

      if (queueData.length === 0) {
        return res
          .status(400)
          .json({ message: "No training data available." });
      }

      const response = await axios.post(
        `${ML_SERVICE_URL}/train`,
        { data: queueData }
      );

      res.json({
        message: "Models trained successfully",
        dataPoints: queueData.length,
        results: response.data
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
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
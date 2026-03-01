const express = require("express");
const Queue = require("../models/queue");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { getPredictionsIfTrained } = require("../services/mlPredictionService");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalWaiting = await Queue.countDocuments({ status: "waiting" });
    const topService = await Queue.aggregate([
      { $match: { status: "waiting" } },
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const service = topService[0]?._id || "General";
    const predictions = await getPredictionsIfTrained({
      service,
      positionInQueue: 1,
      totalWaiting
    });

    if (!predictions) {
      return res.json({
        trained: false,
        peakTimes: [],
        waitTimePredictions: [],
        crowdForecast: [],
        mlModelStats: {
          trained: false,
          modelAccuracy: null,
          predictionsToday: null,
          avgAccuracy: null,
          lastUpdated: null
        }
      });
    }

    return res.json({
      trained: true,
      ...predictions,
      crowdForecast: []
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

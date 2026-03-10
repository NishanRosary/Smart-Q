const mongoose = require("mongoose");

const queueCounterSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    seq: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: false }
);

module.exports = mongoose.model("QueueCounter", queueCounterSchema);

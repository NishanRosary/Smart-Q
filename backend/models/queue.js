const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
      unique: true
    },
    service: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Waiting", "In Progress", "Completed"],
      default: "Waiting"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Queue", queueSchema);

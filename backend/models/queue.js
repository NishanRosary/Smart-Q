const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true,
    unique: true   // Prevent duplicate tokens
  },
  service: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    default: null
  },
  eventName: {
    type: String,
    default: null
  },
  organizationName: {
    type: String,
    default: null
  },
  organizationType: {
    type: String,
    default: null
  },
  guestName: {
    type: String,
    default: null
  },
  guestMobile: {
    type: String,
    default: null
  },
  guestEmail: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["waiting", "serving", "completed", "cancelled"],
    default: "waiting"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

/**
 * Indexes for performance
 */
QueueSchema.index({ status: 1 });
QueueSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Queue", QueueSchema);

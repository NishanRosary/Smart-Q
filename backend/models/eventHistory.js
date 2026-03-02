const mongoose = require("mongoose");

const eventHistorySchema = new mongoose.Schema(
    {
        // Original event fields
        originalEventId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        organizationType: {
            type: String,
            required: true
        },
        organizationName: {
            type: String,
            required: true
        },
        startDate: {
            type: String,
            required: true
        },
        endDate: {
            type: String,
            required: false
        },
        date: {
            type: String,
            required: false
        },
        time: {
            type: String,
            required: true
        },
        startTime: {
            type: String,
            required: false
        },
        endTime: {
            type: String,
            required: false
        },
        location: {
            type: String,
            required: true
        },
        totalTokens: {
            type: Number,
            required: true
        },
        serviceTypes: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            default: "Completed"
        },
        crowdLevel: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },

        // History-specific fields
        deletionReason: {
            type: String,
            enum: ["manual", "expired", "completed"],
            default: "manual"
        },
        deletedAt: {
            type: Date,
            default: Date.now
        },

        // Stats captured at time of deletion
        usersJoined: {
            type: Number,
            default: 0
        },
        usersCompleted: {
            type: Number,
            default: 0
        },
        usersCancelled: {
            type: Number,
            default: 0
        },
        usersServing: {
            type: Number,
            default: 0
        },

        // Original timestamps
        eventCreatedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

eventHistorySchema.index({ deletedAt: -1 });
eventHistorySchema.index({ originalEventId: 1 });

module.exports = mongoose.model("EventHistory", eventHistorySchema);

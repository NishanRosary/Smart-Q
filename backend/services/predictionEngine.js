const Queue = require("../models/queue");

const getPredictionData = async () => {
    try {
        const completedTokens = await Queue.find({ status: "Completed" });

        // Default average service time in minutes if no data exists
        let avgServiceTime = 5;

        if (completedTokens.length > 0) {
            const totalServiceTime = completedTokens.reduce((acc, token) => {
                const duration = (new Date(token.updatedAt) - new Date(token.createdAt)) / 60000;
                return acc + duration;
            }, 0);
            avgServiceTime = totalServiceTime / completedTokens.length;
        }

        const waitingTokens = await Queue.find({ status: "Waiting" }).sort({ createdAt: 1 });

        const predictions = waitingTokens.map((token, index) => {
            return {
                tokenNumber: token.tokenNumber,
                estimatedWaitTime: Math.round((index + 1) * avgServiceTime),
                position: index + 1
            };
        });

        return {
            avgServiceTime: Math.round(avgServiceTime),
            predictions,
            totalWaiting: waitingTokens.length
        };
    } catch (error) {
        console.error("Prediction error:", error);
        return null;
    }
};

module.exports = { getPredictionData };

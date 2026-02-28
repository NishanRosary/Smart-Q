const express = require("express");
const router = express.Router();
const EventHistory = require("../models/eventHistory");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

// =======================
// GET ALL EVENT HISTORY (Admin)
// =======================
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const history = await EventHistory.find().sort({ deletedAt: -1 });
            res.json(history);
        } catch (error) {
            console.error("Error fetching event history:", error);
            res.status(500).json({ message: error.message });
        }
    }
);

// =======================
// GET SINGLE EVENT HISTORY (Admin)
// =======================
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const record = await EventHistory.findById(req.params.id);
            if (!record) {
                return res.status(404).json({ message: "Event history record not found" });
            }
            res.json(record);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// =======================
// DELETE EVENT HISTORY RECORD (Admin) - permanent removal
// =======================
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    async (req, res) => {
        try {
            const record = await EventHistory.findByIdAndDelete(req.params.id);
            if (!record) {
                return res.status(404).json({ message: "Event history record not found" });
            }
            res.json({ success: true, message: "Event history record permanently deleted" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

module.exports = router;

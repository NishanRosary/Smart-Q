const express = require("express");
const { register, login } = require("../controllers/authControllers");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// Example protected route
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email || null,
      phone: req.user.phone || null,
      role: req.user.role,
      isActive: req.user.isActive
    }
  });
});

module.exports = router;

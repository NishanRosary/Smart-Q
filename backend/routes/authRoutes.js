const express = require("express");
const {
  register,
  login,
  adminLogin,
  adminRefresh,
  changePassword
} = require("../controllers/authControllers");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/admin/login
router.post("/admin/login", adminLogin);

// POST /api/auth/admin/refresh
router.post("/admin/refresh", adminRefresh);

// PUT /api/auth/admin/change-password
router.put(
  "/admin/change-password",
  authMiddleware,
  roleMiddleware("admin"),
  changePassword
);

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

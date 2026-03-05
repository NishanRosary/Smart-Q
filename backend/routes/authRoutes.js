const express = require("express");

const {
  register,
  login,
  adminLogin,
  adminRefresh,
  changePassword
} = require("../controllers/authControllers"); // ensure file name matches controller

const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const loginLimiter = require("../middleware/loginLimiter"); // brute-force protection

const router = express.Router();

/* ================= PUBLIC AUTH ROUTES ================= */

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", loginLimiter, login);


/* ================= ADMIN AUTH ROUTES ================= */

// POST /api/auth/admin/login
router.post("/admin/login", loginLimiter, adminLogin);

// POST /api/auth/admin/refresh
router.post("/admin/refresh", adminRefresh);


/* ================= PROTECTED ROUTES ================= */

// PUT /api/auth/admin/change-password
router.put(
  "/admin/change-password",
  authMiddleware,
  roleMiddleware("admin"),
  changePassword
);


/* ================= CURRENT USER ================= */

// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {

  res.json({
    success: true,
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
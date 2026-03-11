const express = require("express");
const router = express.Router();
const Otp = require("../models/otp");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendLoginOtpEmail } = require("../services/emailService");
const {
  otpSendLimiter,
  otpVerifyLimiter
} = require("../middleware/rateLimiters");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SEND OTP =================
router.post("/send-otp", otpSendLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.role !== "customer") {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: "Account inactive" });
    }

    const otp = generateOtp();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    const mailResult = await sendLoginOtpEmail({
      toEmail: normalizedEmail,
      userName: user.name,
      otp
    });
    if (!mailResult.sent) {
      return res.status(500).json({
        message: "Failed to send OTP",
        reason: mailResult.reason
      });
    }

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", otpVerifyLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.role !== "customer") {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: "Account inactive" });
    }

    const record = await Otp.findOne({ email: normalizedEmail });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email: normalizedEmail });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      token: accessToken,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        phone: user.phone || null,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

module.exports = router;

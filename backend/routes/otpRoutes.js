const express = require("express");
const router = express.Router();
const Otp = require("../models/otp");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SEND OTP =================
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = generateOtp();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Smart-Q Login OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteOne({ email });

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

module.exports = router;

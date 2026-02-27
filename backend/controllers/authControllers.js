const jwt = require("jsonwebtoken");
const User = require("../models/user");

const ACCESS_TOKEN_EXPIRES_IN = "15m";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

const findUserByIdentifier = async (identifierInput) => {
  const identifier = String(identifierInput).trim();
  return User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
  });
};

const sendLoginResponse = (res, user) => {
  const accessToken = generateAccessToken(user);

  return res.status(200).json({
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
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({
        message: "Name, password, and email or phone are required"
      });
    }

    const normalizedEmail = email ? String(email).trim().toLowerCase() : undefined;
    const normalizedPhone = phone ? String(phone).trim() : undefined;

    const duplicateChecks = [];
    if (normalizedEmail) duplicateChecks.push({ email: normalizedEmail });
    if (normalizedPhone) duplicateChecks.push({ phone: normalizedPhone });

    const existingUser = await User.findOne({ $or: duplicateChecks });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role: "customer"
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        phone: user.phone || null,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: "emailOrPhone and password are required" });
    }

    const user = await findUserByIdentifier(emailOrPhone);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account inactive" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return sendLoginResponse(res, user);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const emailOrPhone = req.body.emailOrPhone || req.body.email;
    const { password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await findUserByIdentifier(emailOrPhone);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account inactive" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return sendLoginResponse(res, user);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.adminRefresh = async (req, res) => {
  return res.status(501).json({ message: "Refresh token flow is not implemented" });
};

const jwt = require("jsonwebtoken");
const User = require("../models/user");
const RefreshToken = require("../models/refreshTokens");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRE || "7d";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

const getRefreshTokenExpiryDate = () => {
  const raw = String(REFRESH_TOKEN_EXPIRES_IN).trim();
  const match = raw.match(/^(\d+)([mhd])$/i);
  const now = Date.now();

  if (!match) {
    return new Date(now + 7 * 24 * 60 * 60 * 1000);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "m") return new Date(now + amount * 60 * 1000);
  if (unit === "h") return new Date(now + amount * 60 * 60 * 1000);
  return new Date(now + amount * 24 * 60 * 60 * 1000);
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
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      if (duplicateField === "email") {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (duplicateField === "phone") {
        return res.status(400).json({ message: "Mobile number already registered" });
      }
      return res.status(400).json({ message: "User already registered" });
    }

    if (error?.name === "ValidationError") {
      const firstError = Object.values(error.errors || {})[0];
      return res.status(400).json({
        message: firstError?.message || "Invalid registration data"
      });
    }

    console.error("Registration error:", error);
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.deleteMany({ userId: user._id });
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiryDate()
    });

    return res.status(200).json({
      token: accessToken,
      accessToken,
      refreshToken,
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
    return res.status(500).json({ message: "Server error" });
  }
};

exports.adminRefresh = async (req, res) => {
  try {
    const incomingRefreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);

    const storedToken = await RefreshToken.findOne({
      userId: decoded.id,
      token: incomingRefreshToken,
      expiresAt: { $gt: new Date() }
    });
    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account inactive" });
    }

    await RefreshToken.deleteOne({ _id: storedToken._id });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiryDate()
    });

    return res.status(200).json({
      token: accessToken,
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "currentPassword and newPassword are required"
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is invalid" });
    }

    user.password = String(newPassword);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const buildMessage = (message) => ({
  success: false,
  message
});

const normalizeIdentifier = (value) => String(value || "").trim().toLowerCase();

const getClientKey = (req) => ipKeyGenerator(req.ip || req.socket?.remoteAddress || "");

const buildKey = (req, parts) =>
  parts
    .map((part) => normalizeIdentifier(part))
    .filter(Boolean)
    .join(":") || getClientKey(req);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage("Too many login attempts. Try again later.")
});

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => buildKey(req, [getClientKey(req), req.body?.email]),
  message: buildMessage("Too many OTP requests. Please wait before requesting another OTP.")
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => buildKey(req, [getClientKey(req), req.body?.email]),
  message: buildMessage("Too many OTP verification attempts. Please try again later.")
});

const queueJoinLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    buildKey(req, [
      getClientKey(req),
      req.body?.eventId,
      req.body?.guestEmail,
      req.body?.email,
      req.body?.guestMobile
    ]),
  message: buildMessage("Too many queue join attempts. Please wait and try again.")
});

const mlPredictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildMessage("Too many ML prediction requests. Please try again later.")
});

const testEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => buildKey(req, [getClientKey(req), req.query?.toEmail]),
  message: buildMessage("Too many test email requests. Please try again later.")
});

module.exports = {
  loginLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  queueJoinLimiter,
  mlPredictLimiter,
  testEmailLimiter
};

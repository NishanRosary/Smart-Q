const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

require("dotenv").config();

const connectDB = require("./config/db");

const queueRoutes = require("./routes/queueRoutes");
const eventRoutes = require("./routes/eventRoutes");
const eventHistoryRoutes = require("./routes/eventHistoryRoutes");
const mlRoutes = require("./routes/mlRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const otpRoutes = require("./routes/otpRoutes");
const authRoutes = require("./routes/authRoutes");

const { sendQueueRegistrationEmail } = require("./services/emailService");
const { authMiddleware } = require("./middleware/auth");
const { purgeExpiredEvents } = require("./services/eventCleanupService");

const app = express();
const server = http.createServer(app);

/* ================= DATABASE ================= */

connectDB();

/* ================= TRUST PROXY ================= */

app.set("trust proxy", 1);

/* ================= SECURITY HEADERS ================= */

app.use(helmet());

/* ================= GLOBAL MIDDLEWARE ================= */

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json({
  limit: "10kb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "10kb"
}));

app.use(cookieParser());

/* ================= SANITIZATION ================= */

const expressVersion = require("express/package.json").version;
const expressMajor = parseInt(expressVersion.split(".")[0]);

if (expressMajor < 5) {

  app.use(mongoSanitize({
    replaceWith: "_"
  }));

  app.use(hpp());

} else {

  console.warn("Express 5 detected — skipping mongoSanitize/hpp middleware");

}

/* ================= RATE LIMIT ================= */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use("/api", apiLimiter);

/* ================= HTTPS ENFORCEMENT ================= */

if (process.env.NODE_ENV === "production") {

  app.use((req, res, next) => {

    const proto = req.headers["x-forwarded-proto"];

    if (proto && proto !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }

    next();

  });

}

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/event-history", eventHistoryRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/otp", otpRoutes);

/* ================= PROTECTED TEST ROUTE ================= */

app.get("/api/test-protected", authMiddleware, (req, res) => {

  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user
  });

});

/* ================= HEALTH CHECK ================= */

app.get("/api/health", (req, res) => {

  res.json({
    success: true,
    message: "Frontend and Backend connected"
  });

});

/* ================= TEST EMAIL ================= */

app.get("/api/test-email", async (req, res, next) => {

  try {

    const result = await sendQueueRegistrationEmail({
      toEmail: req.query.toEmail || "nishanrosary908@gmail.com",
      userName: req.query.userName || "Nishan",
      tokenNumber: req.query.tokenNumber || "A123",
      serviceName: req.query.serviceName || "General Service",
      estimatedWaitTime: Number(req.query.estimatedWaitTime || 15)
    });

    res.json({
      success: true,
      message: "Test email request processed",
      result
    });

  } catch (error) {
    next(error);
  }

});

/* ================= 404 HANDLER ================= */

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route not found"
  });

});

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err, req, res, next) => {

  console.error("Unhandled Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });

});

/* ================= SOCKET EVENTS ================= */

io.on("connection", (socket) => {

  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

});

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ================= EVENT CLEANUP JOB ================= */

const runExpiredEventCleanup = async () => {

  try {

    const result = await purgeExpiredEvents();

    if (result.deletedEvents > 0) {

      console.log(
        `Expired events cleanup: removed ${result.deletedEvents} event(s) and ${result.deletedQueues} queue item(s)`
      );

    }

  } catch (error) {

    console.error("Expired events cleanup failed:", error.message);

  }

};

runExpiredEventCleanup();

setInterval(runExpiredEventCleanup, 60 * 60 * 1000);

/* ================= PROCESS ERROR HANDLING ================= */

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const queueRoutes = require("./routes/queueRoutes");
const eventRoutes = require("./routes/eventRoutes");
const mlRoutes = require("./routes/mlRoutes");
const otpRoutes = require("./routes/otpRoutes");
const authRoutes = require("./routes/authRoutes");
const { sendQueueRegistrationEmail } = require("./services/emailService");
const { authMiddleware } = require("./middleware/auth");

const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

app.set("io", io);

// ================= MIDDLEWARE =================
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(require("cookie-parser")());

// ================= DATABASE =================
connectDB();

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/otp", otpRoutes);

app.get("/api/test-protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Frontend and Backend connected" });
});

// ================= TEST EMAIL =================
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
      ok: true,
      message: "Test email request processed",
      result
    });
  } catch (error) {
    next(error);
  }
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const queueRoutes = require("./routes/queueRoutes");
const eventRoutes = require("./routes/eventRoutes");
const mlRoutes = require("./routes/mlRoutes");
const authRoutes = require("./routes/authRoutes");
const { sendQueueRegistrationEmail } = require("./services/emailService");

const otpRoutes = require("./routes/otpRoutes");
app.use("/api/otp", otpRoutes);

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

app.set("io", io);

// Middleware (ORDER FIXED)
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json()); //  Must be before routes
app.use(require("cookie-parser")());

// DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ml", mlRoutes);


const { authMiddleware } = require("./middleware/auth");

app.get("/api/test-protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

// Health
app.get("/api/health", (req, res) => {
  res.json({ message: "Frontend and Backend connected" });
});

// Temporary SMTP test route
app.get("/api/test-email", async (req, res) => {
  try {
    const result = await sendQueueRegistrationEmail({
      toEmail: req.query.toEmail || "abhayganesh154@gmail.com",
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
    res.status(500).json({
      ok: false,
      message: "Failed to send test email",
      error: error.message
    });
  }
});

// Socket events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

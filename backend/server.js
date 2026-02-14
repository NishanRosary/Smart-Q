const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const queueRoutes = require("./routes/queueRoutes");
const eventRoutes = require("./routes/eventRoutes");
const mlRoutes = require("./routes/mlRoutes");

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

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Middleware
connectDB();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/queue", queueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ml", mlRoutes);

// Health
app.get("/api/health", (req, res) => {
  res.json({ message: "Frontend and Backend connected" });
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

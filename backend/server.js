const http = require("http");
const { Server } = require("socket.io");

const queueRoutes = require("./routes/queueRoutes");
const eventRoutes = require("./routes/eventRoutes");
const mlRoutes = require("./routes/mlRoutes");
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

connectDB();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());
app.use("/api/queue", queueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ml", mlRoutes);

app.get("/", (req, res) => {
  res.send("Smart'Q backend running successfully");
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Frontend and Backend connected ✅" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on server" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

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

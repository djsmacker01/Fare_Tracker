const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const db = require("./services/database");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Test route to verify Supabase connection
app.get("/api/test-db", async (req, res) => {
  try {
    // Try to insert a test record
    const testData = {
      service: "test",
      price: 25.5,
      fromLocation: "Test From",
      toLocation: "Test To",
      context: { test: true },
    };

    const result = await db.saveFareHistory(testData);
    res.json({
      status: "success",
      message: "Database connection successful",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle fare tracking
  socket.on("startTracking", (data) => {
    console.log("Started tracking:", data);
    // Here you would integrate with real ride-sharing APIs
  });

  socket.on("stopTracking", () => {
    console.log("Stopped tracking");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Simulated fare updates (replace with real API calls)
function simulateFareUpdates() {
  const services = ["uber", "bolt", "taxi"];
  const update = {
    timestamp: new Date().toISOString(),
    fares: {},
  };

  services.forEach((service) => {
    update.fares[service] = {
      price: Math.floor(Math.random() * 20) + 15,
      eta: Math.floor(Math.random() * 10) + 5,
    };
  });

  io.emit("fareUpdate", update);
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Simulate fare updates every 3 seconds
  setInterval(simulateFareUpdates, 3000);
});

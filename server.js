require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const protectionRoutes = require("./routes/protectionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Connect MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/protection", protectionRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);

// Create HTTP server
const server = http.createServer(app);

// Socket setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store active users
const users = {};

// Socket connection
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Send socket ID to frontend (for voice calls)
  socket.emit("me", socket.id);

  /* ---------------- REGISTER USER ---------------- */
  socket.on("registerUser", (userId) => {
    users[userId] = socket.id;

    console.log("Active Users:", users);
  });

  /* ---------------- PRIVATE CHAT ---------------- */
  socket.on("send_message", (data) => {
    const receiverSocketId =
      users[data.receiver];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "receive_message",
        data
      );
    }
  });

  /* ---------------- VOICE CALL ---------------- */

  // Call another user
  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
    });
  });

  // Answer call
  socket.on("answerCall", (data) => {
    io.to(data.to).emit(
      "callAccepted",
      data.signal
    );
  });

  /* ---------------- DISCONNECT ---------------- */
  socket.on("disconnect", () => {
    console.log(
      "User Disconnected:",
      socket.id
    );

    // Remove disconnected user
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
      }
    }

    console.log(
      "Updated Active Users:",
      users
    );
  });
});

// Start server
server.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});
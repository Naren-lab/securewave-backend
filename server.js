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

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/protection", protectionRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);

/* ---------------- CREATE SERVER ---------------- */
const server = http.createServer(app);

/* ---------------- SOCKET ---------------- */
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* Store active users */
let activeUsers = {};

io.on("connection", (socket) => {
  console.log(
    "User Connected:",
    socket.id
  );

  // Send socket ID to frontend
  socket.emit(
    "me",
    socket.id
  );

  /* ---------------- JOIN USER ---------------- */
  socket.on(
    "join_user",
    (userId) => {
      activeUsers[userId] =
        socket.id;

      socket.join(userId);

      console.log(
        `User ${userId} joined with socket ${socket.id}`
      );
    }
  );

  /* ---------------- CHAT ---------------- */
  socket.on(
    "send_message",
    (data) => {
      console.log(
        "Message Sent:",
        data
      );

      // sender devices
      io.to(
        data.senderId
      ).emit(
        "receive_message",
        data
      );

      // receiver devices
      io.to(
        data.receiverId
      ).emit(
        "receive_message",
        data
      );
    }
  );

  /* ---------------- VOICE CALL ---------------- */

  // Call user
  socket.on(
    "callUser",
    (data) => {
      console.log(
        "Calling user:",
        data.userToCall
      );

      io.to(
        data.userToCall
      ).emit(
        "callUser",
        {
          signal:
            data.signalData,
          from:
            data.from,
        }
      );
    }
  );

  // Answer call
  socket.on(
    "answerCall",
    (data) => {
      console.log(
        "Call answered"
      );

      io.to(
        data.to
      ).emit(
        "callAccepted",
        data.signal
      );
    }
  );

  /* ---------------- VIDEO CALL ---------------- */
  socket.on(
    "videoCallUser",
    (data) => {
      io.to(
        data.userToCall
      ).emit(
        "videoCallUser",
        {
          signal:
            data.signalData,
          from:
            data.from,
        }
      );
    }
  );

  socket.on(
    "answerVideoCall",
    (data) => {
      io.to(
        data.to
      ).emit(
        "videoCallAccepted",
        data.signal
      );
    }
  );

  /* ---------------- DISCONNECT ---------------- */
  socket.on(
    "disconnect",
    () => {
      console.log(
        "User Disconnected:",
        socket.id
      );

      for (let userId in activeUsers) {
        if (
          activeUsers[userId] ===
          socket.id
        ) {
          delete activeUsers[
            userId
          ];
        }
      }
    }
  );
});

/* ---------------- START SERVER ---------------- */
server.listen(
  5000,
  () => {
    console.log(
      "Server running on port 5000"
    );
  }
);
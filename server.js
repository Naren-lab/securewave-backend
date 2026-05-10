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

// Create server
const server =
  http.createServer(app);

/* ---------------- SOCKET.IO ---------------- */
const io = new Server(
  server,
  {
    cors: {
      origin: "*"
    }
  }
);

io.on(
  "connection",
  (socket) => {
    console.log(
      "User Connected:",
      socket.id
    );

    // Send socket ID for voice calls
    socket.emit(
      "me",
      socket.id
    );

    /* ---------------- JOIN USER ROOM ---------------- */
    socket.on(
      "join_user",
      (userId) => {
        socket.join(
          userId
        );

        console.log(
          `User ${userId} joined room`
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

        /*
          Send message to:
          1. Sender's all devices
          2. Receiver's all devices
        */

        io.to(
          data.senderId
        ).emit(
          "receive_message",
          data
        );

        io.to(
          data.receiverId
        ).emit(
          "receive_message",
          data
        );
      }
    );

    /* ---------------- VOICE CALL ---------------- */

    // Call another user
    socket.on(
      "callUser",
      (data) => {
        io.to(
          data.userToCall
        ).emit(
          "callUser",
          {
            signal:
              data.signalData,
            from:
              data.from
          }
        );
      }
    );

    // Answer call
    socket.on(
      "answerCall",
      (data) => {
        io.to(
          data.to
        ).emit(
          "callAccepted",
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
      }
    );
  }
);

/* ---------------- SERVER START ---------------- */
server.listen(
  5000,
  () => {
    console.log(
      "Server running on port 5000"
    );
  }
);
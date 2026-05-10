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

/* ---------------- CONNECT DB ---------------- */
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

/*
Store active users like:
{
  userId: {
    socketId: "...",
    username: "Narendra"
  }
}
*/
let activeUsers = {};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Send socket id to frontend
  socket.emit("me", socket.id);

  /* ---------------- JOIN USER ---------------- */
  socket.on("join_user", (data) => {
    const { userId, username } = data;

    activeUsers[userId] = {
      socketId: socket.id,
      username: username,
    };

    socket.join(userId);

    console.log(
      `${username} joined with socket ${socket.id}`
    );
  });

  /* ---------------- CHAT ---------------- */
  socket.on("send_message", (data) => {
    console.log("Message Sent:", data);

    // sender devices
    io.to(data.senderId).emit(
      "receive_message",
      data
    );

    // receiver devices
    io.to(data.receiverId).emit(
      "receive_message",
      data
    );
  });

  /* ---------------- VOICE CALL ---------------- */
  socket.on("callUser", (data) => {
    const {
      usernameToCall,
      signalData,
      from,
    } = data;

    let receiverSocket = null;

    for (let userId in activeUsers) {
      if (
        activeUsers[userId].username ===
        usernameToCall
      ) {
        receiverSocket =
          activeUsers[userId].socketId;
        break;
      }
    }

    if (receiverSocket) {
      io.to(receiverSocket).emit(
        "callUser",
        {
          signal: signalData,
          from,
        }
      );

      console.log(
        `Calling ${usernameToCall}`
      );
    } else {
      console.log(
        "User not online"
      );
    }
  });

  /* ---------------- ANSWER VOICE CALL ---------------- */
  socket.on("answerCall", (data) => {
    io.to(data.to).emit(
      "callAccepted",
      data.signal
    );

    console.log("Voice call answered");
  });

  /* ---------------- VIDEO CALL ---------------- */
  socket.on("videoCallUser", (data) => {
    const {
      usernameToCall,
      signalData,
      from,
    } = data;

    let receiverSocket = null;

    for (let userId in activeUsers) {
      if (
        activeUsers[userId].username ===
        usernameToCall
      ) {
        receiverSocket =
          activeUsers[userId].socketId;
        break;
      }
    }

    if (receiverSocket) {
      io.to(receiverSocket).emit(
        "videoCallUser",
        {
          signal: signalData,
          from,
        }
      );

      console.log(
        `Video calling ${usernameToCall}`
      );
    } else {
      console.log(
        "User not online for video call"
      );
    }
  });

  /* ---------------- ANSWER VIDEO CALL ---------------- */
  socket.on(
    "answerVideoCall",
    (data) => {
      io.to(data.to).emit(
        "videoCallAccepted",
        data.signal
      );

      console.log(
        "Video call answered"
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
          activeUsers[userId]
            .socketId === socket.id
        ) {
          delete activeUsers[userId];
        }
      }
    }
  );
});

/* ---------------- START SERVER ---------------- */
server.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});
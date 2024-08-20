import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIoServer } from "socket.io";

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new SocketIoServer(server, {
  cors: { origin: "https://video-call-usingwebrtc.vercel.app" },
});
// video-call-usingwebrtc.vercel.app
// http://video-call-usingwebrtc.vercel.app

const port = 5000;
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("createRoom", (roomId) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set([socket.id]));
      socket.join(roomId);
      console.log(`RoomID ${roomId} CreatedBy ${socket.id}`);
      socket.emit("roomCreated", roomId);
    } else {
      socket.emit("roomError", "Room alredy exist");
    }
  });

  socket.on("joinRoom", (roomId) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).add(socket.id);
      socket.join(roomId);
      console.log(`User ${socket.id} Joined ${roomId}`);
      socket.to(roomId).emit("userJoined", socket.id);
      socket.emit("roomJoined", roomId);
    } else {
      socket.emit("roomError", "Room dosent Exist");
    }
  });

  socket.on("message", (message) => {
    if (message.roomId) {
      socket.to(message.roomId).emit("message", message);
    }
  });

  socket.on("disconnect", () => {
    rooms.forEach((clients, roomId) => {
      if (clients.has(socket.id)) {
        clients.delete(socket.id);
        if (clients.size == 0) {
          rooms.delete(roomId);
        } else {
          socket.to(roomId).emit("userLeft", socket.id);
        }
      }
    });
    console.log("Client disconnected");
  });
});

function error(err, req, res, next) {
  if (!test) console.error(err.stack);

  res.status(500);
  res.send("Internal Server Error");
}
app.use(error);
server.listen(port);

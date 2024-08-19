import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIoServer } from "socket.io";

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new SocketIoServer(server, {
  cors: { origin: "http://localhost:5173" },
});

const port = 5000;

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
    // Notify other clients in the room
    socket.to(roomId).emit("message", { type: "ready", roomId });
  });

  socket.on("message", (message) => {
    socket.broadcast.emit("message", message);
    console.log(message, "fsfdssfsd");
  });

  socket.on("disconnect", () => {
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

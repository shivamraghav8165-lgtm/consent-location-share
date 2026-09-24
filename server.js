const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("join-room", (room) => {
    room = String(room || "").trim().slice(0, 50);
    if (!room) return;
    socket.join(room);
    socket.emit("joined", room);
  });

  // Location is accepted only after the sharer has explicitly
  // pressed the Share button and the browser grants geolocation permission.
  socket.on("share-location", ({ room, lat, lon, accuracy }) => {
    if (!room || !Number.isFinite(lat) || !Number.isFinite(lon)) return;

    socket.to(room).emit("location-update", {
      lat, lon,
      accuracy: Number.isFinite(accuracy) ? accuracy : null,
      time: new Date().toISOString()
    });
  });

  socket.on("stop-sharing", ({ room }) => {
    if (room) socket.to(room).emit("sharing-stopped");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Location Share running on port ${PORT}`);
});

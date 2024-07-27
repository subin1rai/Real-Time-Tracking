const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Set the view engine to EJS
app.set("view engine", "ejs");

io.on("connection", (socket) => {
  console.log("New connection");

  // Listen for send-location event
  socket.on("send-location", (data) => {
    const { latitude, longitude } = data;
    // Broadcast the location to all connected clients
    io.emit("receive-location", { id: socket.id, latitude, longitude });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    io.emit("user-disconnect", socket.id);
    console.log(`user-disconnect ${socket.id} `)
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

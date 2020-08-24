const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages.js");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users.js");

//Connecting node with express and socket.io
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

//Define paths for expess config
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

//Whenever a new client connects
io.on("connection", (socket) => {
  console.log("New Connection! A Client Has Connected!");
  //socket.emit - To send an event with data from server to current client
  //socket.broadcast.emit - To broadcast data to all the clients except the one that's broadcasting it
  //io.emit - To broadcast data to all the clients
  //io.to(roomName).emit - To broadcast data to all the clients in a room
  //socket.broadcast.to(roomName).emit - To broadcast data to all the clients in a room except the one that's broadcasting it

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  //When client sends an event to server + acknowledgement
  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id);
    if (user) {
      const filter = new Filter();
      if (filter.isProfane(msg)) {
        return callback("Profanity is not allowed");
      }
      io.to(user.room).emit("message", generateMessage(user.username, msg)); //Emits event to all connections
      callback();
    }
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  //Whenever the client connects
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} left the room!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

//Start the server - with port number and a callback
server.listen(port, () => {
  console.log("Server started on port " + port);
});

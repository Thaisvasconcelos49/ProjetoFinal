const { Server } = require("socket.io");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log(`Um usuário ${socket.id} se conectou`);

  socket.on("join room", (room) => {
    socket.join(room); 
    socket.room = room; 
    console.log(`Usuário ${socket.id} entrou na sala ${room}`);
  });

  socket.on("disconnect", () => {
    socket.leave(socket.room); // Remove o usuário da sala antes de desconectar
    console.log(`Usuário ${socket.id} desconectado`);
  });

  socket.on("private message", (data) => {
    const { recipient, message } = data;
    io.to(recipient).emit("private message", {
      sender: socket.id,
      recipient: recipient,
      message: message,
    });
  });

  socket.on("chat message", (msg) => {
    console.log(`Mensagem: ${msg} (Sala: ${socket.room}, Usuário: ${socket.id})`);
    io.to(socket.room).emit("chat message", {
      sender: socket.id,
      message: msg,
    });
  });
});

server.listen(3000, () => {
  console.log("Servidor escutando na porta 3000");
});

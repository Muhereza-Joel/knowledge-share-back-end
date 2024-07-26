const http = require("http");
const socketIo = require("socket.io");

// Create an HTTP server
const server = http.createServer();

// Initialize socket.io with the HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

// Listen for new connections
io.on("connection", (socket) => {

  // Listen for incoming messages
  socket.on("message", (message) => {
    console.log("received: %s", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // console.log("user disconnected");
  });
});

// Broadcast new question to all connected clients
function broadcastNewQuestion(question) {
  io.emit("newQuestion", question);
}

// Broadcast delete question to all connected clients
function broadcastDeleteQuestion(questionId) {
  io.emit("deleteQuestionWithId", questionId);
}

// Start the server on port 3002
server.listen(3002, () => {
  console.log("listening on *:3002");
});

module.exports = { io, broadcastNewQuestion, broadcastDeleteQuestion };
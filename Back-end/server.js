const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const websocketServer = require("./websocketServer"); // Import the custom WebSocket server module

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

// Sample users array with online status
let users = [
  { username: "John Doe", online: false },
  { username: "Jane Smith", online: true },
  // Add more users as needed
];

// Function to broadcast user list to all connected clients
function broadcastUserList() {
  const userList = users.map((user) => ({
    username: user.username,
    online: user.online,
  }));
  const data = JSON.stringify({ userList });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Start the WebSocket server
websocketServer.start(server);

// WebSocket connection handling
wss.on("connection", (ws) => {
  // Send the initial user list to the newly connected client
  broadcastUserList();

  // Event listener for incoming messages from clients
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      // Handle different types of messages here
      // For example, if you receive a new message from a client:
      // if (data.type === "newMessage") {
      //   // Process the new message and broadcast it to all connected clients
      //   // ...
      // }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  // Event listener for WebSocket connection closed
  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
    // For example, update the user's online status in the users array and broadcast the updated user list
    // ...
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

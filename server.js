// Import necessary modules
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// Create an Express app
const app = express();

// Set up any required middleware and configurations
app.use(express.json()); // Parse incoming JSON data

// Example: Serve static files from a "public" folder
app.use(express.static("public"));

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Create a WebSocket server instance and attach it to the HTTP server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on("connection", (ws) => {
  // Event listener for incoming messages from clients
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      // Broadcast the received message to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  // Event listener for WebSocket connection closed
  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Example: Define a route for handling API requests
app.get("/api/data", (req, res) => {
  // Process the request and send a response
  const responseData = { message: "This is an example API response" };
  res.json(responseData);
});

// Example: Define additional routes or middleware as needed

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const WebSocket = require("ws");

// Create a WebSocket server instance
const createWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  // Function to broadcast messages to all connected clients
  const broadcastMessage = (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  // Function to broadcast user typing status
  const broadcastTypingStatus = (username, isTyping) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ userTyping: { username, typing: isTyping } })
        );
      }
    });
  };

  // Event listener for WebSocket connection
  wss.on("connection", (ws) => {
    // Event listener for incoming messages from clients
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        // Broadcast the received message to all connected clients
        broadcastMessage(data);

        // Handle user typing status
        if (data.typing) {
          const { username, typing } = data.typing;
          broadcastTypingStatus(username, typing);
        }
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

  // Function to start the WebSocket server
  const start = () => {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      console.log(`WebSocket server running on port ${PORT}`);
    });
  };

  return {
    start,
  };
};

module.exports = createWebSocketServer;

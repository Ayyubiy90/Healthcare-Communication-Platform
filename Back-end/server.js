const express = require("express");
const http = require("http");
const websocketServer = require("./websocketServer");

const app = express();
const server = http.createServer(app);

// Sample users array with online status
let users = [
  {
    username: "JohnDoe",
    email: "john.doe@example.com",
    password: "password1",
    online: false,
  },
  {
    username: "JaneSmith",
    email: "jane.smith@example.com",
    password: "password2",
    online: false,
  },
  // Add more users as needed
];

// Function to find a user by their email
function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

// Function to find a user by their username
function findUserByUsername(username) {
  return users.find((user) => user.username === username);
}

// Function to register a new user
function registerUser(username, email, password) {
  // Check if a user with the same email already exists
  if (findUserByEmail(email)) {
    return {
      success: false,
      message: "Email is already registered. Please use a different email.",
    };
  }

  // Check if a user with the same username already exists
  if (findUserByUsername(username)) {
    return {
      success: false,
      message: "Username is already taken. Please choose a different username.",
    };
  }

  // Add the new user to the users array
  users.push({ username, email, password, online: false });
  return { success: true, message: "User registered successfully." };
}

// Function to handle user login
function loginUser(email, password) {
  // Find the user with the given email
  const user = findUserByEmail(email);

  // Check if the user exists and the password matches
  if (user && user.password === password) {
    // Mark the user as online
    user.online = true;
    return { success: true, message: "User logged in successfully." };
  }

  return { success: false, message: "Invalid email or password." };
}

// Sample API endpoint for user registration
app.post("/api/register", (req, res) => {
  const { username, email, password } = req.body;

  // Perform user registration
  const result = registerUser(username, email, password);
  res.json(result);
});

// Sample API endpoint for user login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Perform user login
  const result = loginUser(email, password);
  res.json(result);
});

// Function to handle user logout
function logoutUser(username) {
  // Find the user with the given username
  const user = findUserByUsername(username);

  if (user) {
    // Mark the user as offline
    user.online = false;
    return { success: true, message: "User logged out successfully." };
  }

  return { success: false, message: "User not found." };
}

// Sample API endpoint for user logout
app.post("/api/logout", (req, res) => {
  const { username } = req.body;

  // Perform user logout
  const result = logoutUser(username);
  res.json(result);
});

// Sample API endpoint for fetching online users
app.get("/api/onlineUsers", (req, res) => {
  // Filter users to get online users only
  const onlineUsers = users.filter((user) => user.online);
  res.json({ success: true, onlineUsers });
});

// Start the WebSocket server
websocketServer.start(server);

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

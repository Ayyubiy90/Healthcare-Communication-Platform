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

// Function to update user profile
function updateUserProfile(username, newProfileData) {
  const user = findUserByUsername(username);
  if (user) {
    // Update the user's profile data (e.g., name, profile picture, etc.)
    // For simplicity, we'll just update the email in this example
    user.email = newProfileData.email;
    return { success: true, message: "Profile updated successfully." };
  } else {
    return { success: false, message: "User not found." };
  }
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

// Sample API endpoint for user authentication
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const user = findUserByUsername(username);

  if (user && user.password === password) {
    // If the username and password match, generate a JWT and send it as a response
    const token = generateToken(user.username);
    res.json({ success: true, token });
  } else {
    res.json({ success: false, message: "Invalid username or password." });
  }
});

// Function to generate a JSON Web Token (JWT)
function generateToken(username) {
  // In a real-world scenario, use a secure secret key to sign the token
  // For simplicity, we'll use a simple string as the secret key
  const secretKey = "your_secret_key_here";

  // Set the token payload (include any relevant user information)
  const payload = { username };

  // Set the token expiration time (e.g., 1 hour from now)
  const expiresIn = "1h";

  // Sign the token with the secret key and return it
  return jwt.sign(payload, secretKey, { expiresIn });
}

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

// Function to handle user profile updates
function updateUserProfile(username, updatedProfile) {
  // Find the user with the given username
  const user = findUserByUsername(username);

  if (user) {
    // Update the user's profile information
    user.username = updatedProfile.username || user.username;
    user.email = updatedProfile.email || user.email;
    // You can add more fields to update as needed (e.g., name, age, etc.)

    return { success: true, message: "User profile updated successfully." };
  }

  return { success: false, message: "User not found." };
}

// Sample API endpoint for updating user profile
app.put("/api/updateProfile", (req, res) => {
  const { username, updatedProfile } = req.body;

  // Perform user profile update
  const result = updateUserProfile(username, updatedProfile);
  res.json(result);
});

// Function to handle user password update
function updateUserPassword(username, newPassword) {
  // Find the user with the given username
  const user = findUserByUsername(username);

  if (user) {
    // Update the user's password
    user.password = newPassword;

    return { success: true, message: "Password updated successfully." };
  }

  return { success: false, message: "User not found." };
}

// Sample API endpoint for updating user password
app.put("/api/updatePassword", (req, res) => {
  const { username, newPassword } = req.body;

  // Perform user password update
  const result = updateUserPassword(username, newPassword);
  res.json(result);
});

// Function to handle friend requests
function sendFriendRequest(senderUsername, receiverUsername) {
  // Find the users with the given usernames
  const sender = findUserByUsername(senderUsername);
  const receiver = findUserByUsername(receiverUsername);

  if (sender && receiver) {
    // Check if the friend request already exists
    if (!sender.friends.includes(receiverUsername)) {
      // Add the receiver to the sender's pending friend requests
      sender.pendingFriendRequests.push(receiverUsername);

      return { success: true, message: "Friend request sent successfully." };
    } else {
      return { success: false, message: "Friend request already sent." };
    }
  }

  return { success: false, message: "User not found." };
}

// Sample API endpoint for sending friend requests
app.post("/api/sendFriendRequest", (req, res) => {
  const { senderUsername, receiverUsername } = req.body;

  // Send friend request
  const result = sendFriendRequest(senderUsername, receiverUsername);
  res.json(result);
});

// Function to handle notification settings update
function updateNotificationSettings(username, updatedSettings) {
  // Find the user with the given username
  const user = findUserByUsername(username);

  if (user) {
    // Update the user's notification settings
    user.notificationSettings = updatedSettings;

    return {
      success: true,
      message: "Notification settings updated successfully.",
    };
  }

  return { success: false, message: "User not found." };
}

// Sample API endpoint for updating notification settings
app.put("/api/updateNotificationSettings", (req, res) => {
  const { username, updatedSettings } = req.body;

  // Perform notification settings update
  const result = updateNotificationSettings(username, updatedSettings);
  res.json(result);
});

// Function to handle accepting or rejecting friend requests
function handleFriendRequest(receiverUsername, senderUsername, accept) {
  // Find the users with the given usernames
  const receiver = findUserByUsername(receiverUsername);
  const sender = findUserByUsername(senderUsername);

  if (receiver && sender) {
    // Check if the friend request exists
    if (receiver.pendingFriendRequests.includes(senderUsername)) {
      // Remove the sender from the receiver's pending friend requests
      receiver.pendingFriendRequests = receiver.pendingFriendRequests.filter(
        (username) => username !== senderUsername
      );

      // Update the sender's friend list if the request is accepted
      if (accept) {
        sender.friends.push(receiverUsername);
      }

      return { success: true, message: "Friend request handled successfully." };
    } else {
      return { success: false, message: "Friend request not found." };
    }
  }

  return { success: false, message: "User not found." };
}

// Sample API endpoint for handling friend requests
app.put("/api/handleFriendRequest", (req, res) => {
  const { receiverUsername, senderUsername, accept } = req.body;

  // Handle friend request
  const result = handleFriendRequest(receiverUsername, senderUsername, accept);
  res.json(result);
});

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

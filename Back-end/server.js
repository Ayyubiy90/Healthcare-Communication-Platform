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

// Sample messages array (replace this with your actual message data storage, e.g., a database)
let messages = [];

// Function to add a new message to the messages array
function addMessage(sender, recipients, message) {
  // Add the new message to the messages array
  messages.push({ sender, recipients, message, timestamp: new Date() });
}

// Function to update the content of a message
function updateMessage(messageId, newContent) {
  const message = messages.find((msg) => msg.messageId === messageId);
  if (message) {
    // Update the message content
    message.message = newContent;
  }
}

// Sample WebSocket event listener for handling deleted messages
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.deleteMessage) {
        // If the received data contains a 'deleteMessage' property, it means a message was deleted.
        // Extract the 'messageId' from the 'deleteMessage' object.
        const messageId = data.deleteMessage;

        // Delete the message from the messages array
        deleteMessage(messageId);

        // Broadcast the deleted message ID to all connected clients
        websocketServer.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ deleteMessage: messageId }));
          }
        });
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Create a WebSocket server using the HTTP server
const wss = new WebSocket.Server({ server });

// Sample WebSocket event listener for receiving real-time updates
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.message) {
        // If the received data contains a 'message' property, it means a new message is received.
        // Extract the 'message', 'sender', and 'recipients' from the 'data' object.
        const { message, sender, recipients } = data;

        // Add the new message to the messages array
        addMessage(sender, recipients, message);

        // Broadcast the received message to all connected clients
        websocketServer.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                newMessage: {
                  message,
                  sender,
                  recipients,
                  timestamp: new Date(),
                },
              })
            );
          }
        });
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Function to update the status of a message
function updateMessageStatus(messageId, isRead) {
  const message = messages.find((msg) => msg.messageId === messageId);
  if (message) {
    // Update the message status
    message.isRead = isRead;
  }
}

// Sample WebSocket event listener for handling message status updates
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.messageStatus) {
        // If the received data contains a 'messageStatus' property, it means a message status update.
        // Extract the 'messageId' and 'isRead' from the 'messageStatus' object.
        const { messageId, isRead } = data.messageStatus;

        // Update the message status in the messages array
        updateMessageStatus(messageId, isRead);

        // Broadcast the updated message status to all connected clients
        websocketServer.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ messageStatus: { messageId, isRead } })
            );
          }
        });
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Function to handle user typing indicator
function handleTyping(username, typing) {
  // Broadcast the typing status to all connected clients
  websocketServer.wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ userTyping: { username, typing } }));
    }
  });
}

// Sample WebSocket event listener for handling user typing indicators
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.userTyping) {
        // If the received data contains a 'userTyping' property, it means a user's typing status update.
        // Extract the 'username' and 'typing' from the 'userTyping' object.
        const { username, typing } = data.userTyping;

        // Broadcast the typing status to all connected clients
        handleTyping(username, typing);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Function to handle message deletion
function handleDelete(messageId) {
  // Find the index of the message in the messages array
  const messageIndex = messages.findIndex((msg) => msg.messageId === messageId);
  if (messageIndex !== -1) {
    // Remove the message from the messages array
    messages.splice(messageIndex, 1);

    // Broadcast the deleted message ID to all connected clients
    websocketServer.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ deleteMessage: messageId }));
      }
    });
  }
}

// Sample WebSocket event listener for handling message deletion
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.deleteMessage) {
        // If the received data contains a 'deleteMessage' property, it means a message was deleted.
        const messageId = data.deleteMessage;

        // Handle the message deletion
        handleDelete(messageId);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Function to handle image messages
function handleImageMessage(sender, image) {
  // Generate a unique ID for the message
  const messageId = generateMessageId();

  // Create a new image message object
  const newImageMessage = {
    messageId,
    sender,
    timestamp: new Date().toISOString(),
    image,
  };

  // Add the new image message to the messages array
  messages.push(newImageMessage);

  // Broadcast the new image message to all connected clients
  websocketServer.wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ newImageMessage }));
    }
  });
}

// Sample WebSocket event listener for handling image messages
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.image) {
        // If the received data contains an 'image' property, it means an image message was sent.
        const { sender, image } = data;

        // Handle the image message
        handleImageMessage(sender, image);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Function to handle user typing status
function handleUserTyping(sender, typing) {
  // Broadcast the user's typing status to all connected clients
  websocketServer.wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ userTyping: { sender, typing } }));
    }
  });
}

// Sample WebSocket event listener for handling user typing status
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.typing !== undefined) {
        // If the received data contains a 'typing' property, it means the user's typing status changed.
        const { sender, typing } = data;

        // Handle the user's typing status
        handleUserTyping(sender, typing);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Function to handle message editing
function handleEditMessage(messageId, content) {
  // Find the index of the message in the messages array
  const messageIndex = messages.findIndex((msg) => msg.messageId === messageId);
  if (messageIndex !== -1) {
    // Update the content of the message
    messages[messageIndex].message = content;

    // Broadcast the edited message to all connected clients
    websocketServer.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            editMessage: { messageId, content },
          })
        );
      }
    });
  }
}

// Sample WebSocket event listener for handling message editing
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Handle incoming private messages
      if (data.privateMessage) {
        const { sender, recipient, message } = data.privateMessage;
        // Find the recipient WebSocket
        const recipientWs = getWebSocketByUsername(recipient);
        if (recipientWs) {
          // Send the private message to the recipient
          recipientWs.send(
            JSON.stringify({ privateMessage: { sender, message } })
          );
          // Also, notify the sender that the message was sent successfully
          ws.send(
            JSON.stringify({ privateMessageStatus: { recipient, sent: true } })
          );
        } else {
          // If the recipient is not online or not found, notify the sender about the delivery failure
          ws.send(
            JSON.stringify({ privateMessageStatus: { recipient, sent: false } })
          );
        }
        return;
      }

      // Handle message status update
      if (data.messageStatus) {
        const { messageId, isRead } = data.messageStatus;
        // Update the message status in the server's database or data store
        // ... (code to update the message status)

        // Broadcast the message status update to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ messageStatus: { messageId, isRead } })
            );
          }
        });
        return;
      }

      if (data.editMessage) {
        // If the received data contains an 'editMessage' property, it means a message was edited.
        const { messageId, content } = data.editMessage;

        // Handle the message editing
        handleEditMessage(messageId, content);
      }
      if (data.typing) {
        // If the received data contains a 'typing' property, it means the user is typing.
        const { username, typing } = data.typing;
        broadcastTypingStatus(username, typing);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects
  });
});

// Function to find WebSocket connection by username
function getWebSocketByUsername(username) {
  for (const client of wss.clients) {
    if (client.username === username && client.readyState === WebSocket.OPEN) {
      return client;
    }
  }
  return null;
}

// Sample API endpoint to get all messages for a specific user
app.get("/api/messages/:username", (req, res) => {
  const { username } = req.params;

  // Filter messages to find messages for the specified user (either as a sender or recipient)
  const userMessages = messages.filter(
    (message) =>
      message.sender === username || message.recipients.includes(username)
  );

  res.json(userMessages);
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

// Function to handle message deletion
function handleDeleteMessage(messageId) {
  // Filter out the deleted message from the messages array
  messages = messages.filter((msg) => msg.messageId !== messageId);

  // Broadcast the deleted message ID to all connected clients
  websocketServer.wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ deleteMessage: messageId }));
    }
  });
}

// Sample WebSocket event listener for handling message deletion
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.deleteMessage) {
        // If the received data contains a 'deleteMessage' property, it means a message was deleted.
        const messageId = data.deleteMessage;

        // Handle the message deletion
        handleDeleteMessage(messageId);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Perform any cleanup or handling when a client disconnects

    // Handle user disconnection here (e.g., remove user from active users list)
  });
});

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

// Sample active users list (You can use a database for a more robust implementation)
let activeUsers = [];

// Function to handle user disconnection
function handleUserDisconnection(userId) {
  // Remove the user from the list of active users
  activeUsers = activeUsers.filter((user) => user.userId !== userId);
}

// Sample WebSocket event listener for handling user disconnection
websocketServer.wss.on("connection", (ws) => {
  // Get the user ID from the WebSocket connection (You can set this when a user logs in)
  const userId = getUserIdFromWebSocket(ws);

  // Add the user to the list of active users
  activeUsers.push({ userId });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // ... (previous message handling code)
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Handle user disconnection
    handleUserDisconnection(userId);
  });
});

// Function to handle message editing
function handleEditMessage(messageId, newContent) {
  // Find the message with the given messageId in the messages array
  const messageToUpdate = messages.find((msg) => msg.messageId === messageId);

  if (messageToUpdate) {
    // Update the message content with the new content
    messageToUpdate.message = newContent;

    // Broadcast the edited message to all connected clients
    websocketServer.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ editMessage: { messageId, content: newContent } })
        );
      }
    });
  }
}

// Sample WebSocket event listener for handling message editing
websocketServer.wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.editMessage) {
        // If the received data contains an 'editMessage' property, it means a message was edited.
        const { messageId, content } = data.editMessage;

        // Handle the message editing
        handleEditMessage(messageId, content);
      }

      // ... (previous message handling code)
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  // ... (previous code)
});

// Sample WebSocket event listener for handling user typing status
websocketServer.wss.on("connection", (ws) => {
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

        // Handle user typing status
        if (data.typing) {
          // If the received data contains a 'typing' property, it means the user is typing.
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

  // Function to broadcast user typing status
  function broadcastTypingStatus(username, isTyping) {
    websocketServer.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ userTyping: { username, typing: isTyping } })
        );
      }
    });
  }

  // Sample WebSocket event listener for detecting typing
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // ... (previous message handling code)

      // Handle user typing status
      if (data.typing) {
        // If the received data contains a 'typing' property, it means the user is typing.
        const { username, typing } = data.typing;
        broadcastTypingStatus(username, typing);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  // ... (previous code)
});

// Start the WebSocket server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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

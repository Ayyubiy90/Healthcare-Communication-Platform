// Function to update user online status
function updateUserOnlineStatus(username, online) {
    const userIndex = users.findIndex((user) => user.username === username);
    if (userIndex !== -1) {
      users[userIndex].online = online;
      broadcastUserList();
    }
  }
  
  // Function to handle user login
  function handleUserLogin(username) {
    // Check if the user is already in the users array
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      // Update the user's online status to true (user is logged in)
      updateUserOnlineStatus(username, true);
    } else {
      // Add the new user to the users array with online status true
      users.push({ username, online: true });
      broadcastUserList();
    }
  }
  
  // Function to handle user logout
  function handleUserLogout(username) {
    // Update the user's online status to false (user is logged out)
    updateUserOnlineStatus(username, false);
  }
  
  // WebSocket connection handling
  wss.on("connection", (ws) => {
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
  
        // Handle user login
        if (data.type === "login") {
          const { username } = data;
          handleUserLogin(username);
        }
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

// Sample users array with online status
let users = [
  { username: "JohnDoe", online: false },
  { username: "JaneSmith", online: false },
  // Add more users as needed
];

// Function to find a user by their username
function findUserByUsername(username) {
  return users.find((user) => user.username === username);
}

// Function to handle user login
function handleUserLogin(username, ws) {
  const existingUser = findUserByUsername(username);
  if (existingUser) {
    // Update the user's online status to true (user is logged in)
    existingUser.online = true;
    // Broadcast the updated user list to all connected clients
    broadcastUserList();
  } else {
    // User not found, send an error message to the client
    ws.send(JSON.stringify({ type: "loginError", message: "User not found" }));
  }
}

// Function to handle user logout
function handleUserLogout(username) {
  const user = findUserByUsername(username);
  if (user) {
    // Update the user's online status to false (user is logged out)
    user.online = false;
    // Broadcast the updated user list to all connected clients
    broadcastUserList();
  }
}

// Function to broadcast the user list to all connected clients
function broadcastUserList() {
  const userList = users.map((user) => ({
    username: user.username,
    online: user.online,
  }));
  const message = JSON.stringify({ type: "userList", users: userList });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  // Event listener for incoming messages from clients
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      // Handle different types of messages here
      if (data.type === "login") {
        const { username } = data;
        handleUserLogin(username, ws);
      } else if (data.type === "logout") {
        const { username } = data;
        handleUserLogout(username);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  // Event listener for WebSocket connection closed
  ws.on("close", () => {
    // Handle user logout when the WebSocket connection is closed
    // Get the username associated with this connection and call handleUserLogout
    // ...
  });
});
// script.js (combined code)
const registrationForm = document.getElementById("registration-form");
const loginForm = document.getElementById("login-form");
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const userList = document.getElementById("user-list");

// Function to handle user registration
registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // Get form data
  const formData = new FormData(registrationForm);
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  // Perform user registration API call (to be implemented in the backend)
  axios
    .post("/api/register", { username, email, password })
    .then((response) => {
      // Handle successful registration
      alert("Registration successful! You can now log in.");
      // Optionally, redirect the user to the login page
      window.location.href = "/login.html";
    })
    .catch((error) => {
      // Handle registration error
      displayError("Error: Registration failed. Please try again.");
    });
});

// Function to handle user login
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // Get form data
  const formData = new FormData(loginForm);
  const email = formData.get("login-email");
  const password = formData.get("login-password");

  // Perform user login API call (to be implemented in the backend)
  axios
    .post("/api/login", { email, password })
    .then((response) => {
      // Handle successful login
      alert("Login successful! You are now logged in.");
      // Optionally, redirect the user to the chat page or dashboard
      window.location.href = "/chat.html";
    })
    .catch((error) => {
      // Handle login error
      displayError("Error: Incorrect email or password. Please try again.");
    });
});

// Function to handle user logout (to be called when the user clicks on the logout button)
function logout() {
  // Perform user logout API call (to be implemented in the backend)
  axios
    .post("/api/logout")
    .then((response) => {
      // Handle successful logout
      alert("You have been logged out.");
      // Optionally, redirect the user to the login page
      window.location.href = "/login.html";
    })
    .catch((error) => {
      // Handle logout error
      displayError("Error: Logout failed. Please try again.");
    });
}

// Event listener for the logout button (assuming there is a logout button in the HTML)
document.getElementById("logout-button").addEventListener("click", logout);

// Function to display incoming and outgoing messages in the chat box
function displayMessage(
  message,
  sender,
  timestamp,
  isRead,
  isImage = false,
  messageId
) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.setAttribute("data-message-id", messageId);

  // Show the sender's name
  const senderSpan = document.createElement("span");
  senderSpan.classList.add("message-sender");
  senderSpan.textContent = sender;
  div.appendChild(senderSpan);

  // Show the timestamp
  const timestampSpan = document.createElement("span");
  timestampSpan.classList.add("message-timestamp");
  timestampSpan.textContent = formatTimestamp(timestamp);
  div.appendChild(timestampSpan);

  // Show the message content or image
  if (isImage) {
    const imageElement = document.createElement("img");
    imageElement.classList.add("message-image");
    imageElement.src = message;
    imageElement.alt = "Sent Image";
    div.appendChild(imageElement);
  } else {
    const contentParagraph = document.createElement("p");
    contentParagraph.classList.add("message-content");
    contentParagraph.textContent = message;
    div.appendChild(contentParagraph);
  }

  // Show the recipients' names (comma-separated if multiple recipients)
  if (recipients.length > 0) {
    const recipientsSpan = document.createElement("span");
    recipientsSpan.classList.add("message-recipients");
    recipientsSpan.textContent = `To: ${recipients.join(", ")}`;
    div.appendChild(recipientsSpan);
  }

  // Show message status indicator(s)
  const statusIndicatorSpan = document.createElement("span");
  statusIndicatorSpan.classList.add("message-status-indicator");

  // Show one checkmark if the message has been delivered
  const deliveredIndicator = document.createElement("span");
  deliveredIndicator.textContent = isRead ? "✔️✔️" : "✔️";
  statusIndicatorSpan.appendChild(deliveredIndicator);

  div.appendChild(statusIndicatorSpan);

  // Set the unique data attribute "data-message-id" on the message container
  div.setAttribute("data-message-id", messageId);
  div.innerHTML = `
        <span class="message-sender">${sender}</span>
        <span class="message-timestamp">${timestamp}</span>
        <p class="message-content">${message}</p>
    `;
  const readIndicator = isRead ? "✔️" : "✓";
  div.innerHTML = `
        <span class="message-sender">${sender}</span>
        <span class="message-timestamp">${formatTimestamp(timestamp)}</span>
        <p class="message-content">${message}</p>
        <span class="message-read-indicator">${readIndicator}</span>
    `;
  // Check if the message is an image
  if (isImage) {
    div.innerHTML = `
            <span class="message-sender">${sender}</span>
            <span class="message-timestamp">${formatTimestamp(timestamp)}</span>
            <img class="message-image" src="${message}" alt="Sent Image">
            <span class="message-read-indicator">${readIndicator}</span>
        `;
  } else {
    div.innerHTML = `
            <span class="message-sender">${sender}</span>
            <span class="message-timestamp">${formatTimestamp(timestamp)}</span>
            <p class="message-content">${message}</p>
            <span class="message-read-indicator">${readIndicator}</span>
        `;
  }
  // Add delete button for the message (only for messages sent by the current user)
  if (sender === currentUser) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    div.appendChild(deleteButton);

    deleteButton.addEventListener("click", () => {
      deleteMessage(messageId);
    });
  }

  // Add edit button for the message (only for messages sent by the current user)
  if (sender === currentUser) {
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");
    div.appendChild(editButton);

    editButton.addEventListener("click", () => {
      const originalMessage = isImage ? "Sent Image" : message;
      const newMessage = prompt("Edit your message:", originalMessage);
      if (newMessage !== null && newMessage !== originalMessage) {
        // Emit the edited message to the WebSocket server
        socket.send(
          JSON.stringify({ editMessage: { messageId, content: newMessage } })
        );
        // Update the displayed message with the edited content
        messageContent.textContent = newMessage;
      }
    });
  }

  // Function to handle message deletion
  function deleteMessage(messageId) {
    // Emit the message ID to the WebSocket server for deletion
    socket.send(JSON.stringify({ deleteMessage: messageId }));
  }

  // Check if the user is already viewing the latest messages (scrolled to the bottom)
  const isAtBottom =
    chatMessages.scrollHeight - chatMessages.clientHeight <=
    chatMessages.scrollTop + 1;
  chatMessages.appendChild(div);
  // Only auto-scroll if the user is already viewing the latest messages
  if (isAtBottom) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  scrollToBottom();
  // Scroll to the bottom to show the latest messages
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to scroll the chat messages container to the bottom
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// const isTypingIndicator = document.getElementById("is-typing-indicator");

// // Function to handle typing indicator
// function showTypingIndicator(sender) {
//   isTypingIndicator.textContent = `${sender} is typing...`;
// }

// function hideTypingIndicator() {
//   isTypingIndicator.textContent = "";
// }

// // Event listener for detecting typing
// let typingTimeout;

// messageInput.addEventListener("input", () => {
//   const message = messageInput.value;
//   if (message) {
//     clearTimeout(typingTimeout);
//     emitTypingStatus(true); // User is typing, send WebSocket message
//     typingTimeout = setTimeout(() => {
//       emitTypingStatus(false); // User stopped typing, send WebSocket message
//     }, TYPING_INTERVAL);
//   } else {
//     emitTypingStatus(false); // User stopped typing (input field is empty), send WebSocket message
//   }
// });

function deleteMessage(messageId) {
  // Send a WebSocket message to the server to delete the message
  const data = {
    deleteMessage: messageId,
  };
  socket.send(JSON.stringify(data));
}

// Function to update message status
function updateMessageStatus(messageId, isRead) {
  const messageContainer = chatMessages.querySelector(
    `[data-message-id="${messageId}"]`
  );
  if (messageContainer) {
    const statusIndicator = messageContainer.querySelector(
      ".message-status-indicator"
    );
    if (statusIndicator) {
      // Update the message status indicator
      statusIndicator.textContent = isRead ? "✔️✔️" : "✔️";
    }
  }
}

// WebSocket event listener for receiving real-time updates
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.editMessage) {
    // If the received data contains an 'editMessage' property, it means a message was edited.
    // Extract the 'messageId' and 'content' from the 'editMessage' object.
    const { messageId, content } = data.editMessage;
    // Call the 'handleEdit' function with the extracted 'messageId' and 'content' as arguments.
    handleEdit(messageId, content);
  } else if (data.deleteMessage) {
    // If the received data contains a 'deleteMessage' property, it means a message was deleted.
    // Extract the 'messageId' from the 'deleteMessage' object.
    const messageId = data.deleteMessage;
    // Call the 'handleDelete' function with the extracted 'messageId' as an argument.
    handleDelete(messageId);
  } else if (data.messageStatus) {
    // If the received data contains a 'messageStatus' property, it means a message status update.
    // Extract the 'messageId' and 'isRead' from the 'messageStatus' object.
    const { messageId, isRead } = data.messageStatus;
    // Call the 'updateMessageStatus' function with the extracted 'messageId' and 'isRead' as arguments.
    updateMessageStatus(messageId, isRead);
  } else if (data.userTyping) {
    // If the received data contains a 'userTyping' property, it means a user's typing status update.
    // Extract the 'username' and 'typing' from the 'userTyping' object.
    const { username, typing } = data.userTyping;
    // Call the 'handleTyping' function with the extracted 'username' and 'typing' as arguments.
    handleTyping(username, typing);
  } else if (data.newMessage) {
    // If the received data contains a 'newMessage' property, it means a new message is received.
    // Extract the 'message', 'sender', 'timestamp', and 'isImage' from the 'newMessage' object.
    const { message, sender, timestamp, isImage, messageId } = data.newMessage;
    // Call the 'displayMessage' function with the extracted data as arguments to show the new message.
    displayMessage(message, sender, timestamp, false, isImage, messageId);
  } else if (data.newImageMessage) {
    // If the received data contains a 'newImageMessage' property, it means a new image message is received.
    // Extract the 'message', 'sender', 'timestamp', and 'isRead' from the 'newImageMessage' object.
    const { message, sender, timestamp, isImage, messageId } =
      data.newImageMessage;
    // Call the 'displayMessage' function with the extracted data as arguments to show the new image message.
    displayMessage(message, sender, timestamp, false, isImage, messageId);
  }
});

// Event listener for message deletion
chatMessages.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-button")) {
    handleDelete(event);
  }
});

// Function to handle errors and display error messages
function displayError(message) {
  const div = document.createElement("div");
  div.classList.add("error-message");
  div.textContent = message;
  chatMessages.appendChild(div);
}

// // WebSocket event listener for receiving edited messages
// socket.addEventListener("message", (event) => {
//   const data = JSON.parse(event.data);
//   if (data.editMessage) {
//     const { messageId, content } = data.editMessage;
//     handleEdit(messageId, content);
//   }
// });

// WebSocket connection (to be implemented in the backend)
const socket = new WebSocket("ws://localhost:8080");

// Event listener when the WebSocket connection is established
socket.addEventListener("open", () => {
  console.log("WebSocket connection established.");
});

// Event listener for WebSocket connection errors
socket.addEventListener("error", (event) => {
  console.error("WebSocket connection error:", event);
  displayError("Error: Failed to establish WebSocket connection.");
});

// Event listener for WebSocket connection closed
socket.addEventListener("close", (event) => {
  console.warn("WebSocket connection closed:", event);
  displayError(
    "WebSocket connection closed. Please refresh the page to reconnect."
  );
});

// Listen for incoming messages
// socket.on("message", (data) => {
//   const { message, sender } = data;
//   displayMessage(message, sender);
// });

// Function to send a new message
function sendMessage(message) {
  // Emit the message to the WebSocket server
  socket.send(JSON.stringify({ newMessage: { message } }));
}

// Event listener for sending a message
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message === "") {
    displayError("Error: Message cannot be empty.");
    return;
  }

  // Call the sendMessage function to send the message
  sendMessage(message);

  // Clear the message input field after sending
  messageInput.value = "";
});

// Function to format timestamp for messages
function formatTimestamp() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Event listener for typing detection
chatForm.addEventListener("input", handleTyping);

// Function to handle image selection and sending
sendImageButton.addEventListener("click", () => {
  imageInput.click(); // Trigger the hidden file input
});

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    // Read the image file as a data URL
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Display the selected image as a preview
      const imagePreview = document.createElement("img");
      imagePreview.src = reader.result;
      imagePreview.alt = "Selected Image";
      chatMessages.appendChild(imagePreview);

      // Scroll to the bottom to show the latest messages and the image preview
      scrollToBottom();

      // Emit the image data to the WebSocket server
      socket.send(JSON.stringify({ image: reader.result }));

      // Clear the file input to allow selecting the same image again
      event.target.value = "";
    };
    reader.onerror = () => {
      displayError("Error: Failed to read the selected image.");
    };
  }
});

// Event listener for message deletion
chatMessages.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-button");
  if (deleteButton) {
    const messageContainer = deleteButton.closest(".message");
    const messageId = messageContainer.dataset.messageId;
    // Emit the message ID to the WebSocket server for deletion
    socket.send(JSON.stringify({ deleteMessage: messageId }));
    // Remove the deleted message from the display
    messageContainer.remove();
  }
});

// Function to handle user typing status
let typingTimer;
const TYPING_INTERVAL = 1000; // Time in milliseconds
const isTypingIndicator = document.getElementById("is-typing-indicator");

function handleTyping() {
  // Show "typing" indicator
  isTypingIndicator.textContent = "Typing...";
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    // Hide "typing" indicator after a certain interval
    isTypingIndicator.textContent = "";
  }, TYPING_INTERVAL);
}

function showTypingIndicator(sender) {
  isTypingIndicator.textContent = `${sender} is typing...`;
}

function hideTypingIndicator() {
  isTypingIndicator.textContent = "";
}

// Function to emit typing status to the server
function emitTypingStatus(typing) {
  // Send a WebSocket message to the server to inform about typing status
  const data = {
    userTyping: {
      username: currentUser, // Replace 'currentUser' with the username of the current user
      typing,
    },
  };
  socket.send(JSON.stringify(data));
}

// Event listener for typing detection
chatForm.addEventListener("input", handleTyping);

// Add an "online" property to the users array to track online status
const users = [
  { username: "John Doe", online: false },
  { username: "Jane Smith", online: true },
  // Add more users as needed
];

// Function to display the list of users with their online status
function displayUsers() {
  // Clear the user list
  userList.innerHTML = "";

  // Create and append user list items with online status indicator
  users.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.textContent = user.username;

    // Create and append the online status indicator
    const statusIndicator = document.createElement("span");
    statusIndicator.classList.add("user-status-indicator");
    statusIndicator.textContent = user.online ? "Online" : "Offline";
    userItem.appendChild(statusIndicator);

    // Append the user item to the user list
    userList.appendChild(userItem);
  });
}

// Call the displayUsers function to initially display the users
displayUsers();

// Sample function to simulate user login
function simulateUserLogin(username) {
  // Check if the user is already in the users array
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    // Update the online status to true (user is logged in)
    existingUser.online = true;
  } else {
    // Add the new user to the users array with online status true
    users.push({ username, online: true });
  }

  // Update the user list display
  displayUsers();
}

// Sample function to simulate user logout
function simulateUserLogout(username) {
  // Find the user in the users array
  const user = users.find((user) => user.username === username);
  if (user) {
    // Update the online status to false (user is logged out)
    user.online = false;
  }

  // Update the user list display
  displayUsers();
}

// Function to handle message editing
chatMessages.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-button")) {
    const messageContainer = event.target.closest(".message");
    const messageContent = messageContainer.querySelector(".message-content");
    const originalMessage = messageContent.textContent.trim();
    const newMessage = prompt("Edit your message:", originalMessage);
    if (newMessage !== null && newMessage !== originalMessage) {
      // Emit the edited message to the WebSocket server
      const messageId = messageContainer.dataset.messageId;
      socket.send(
        JSON.stringify({ editMessage: { messageId, content: newMessage } })
      );
      // Update the displayed message with the edited content
      messageContent.textContent = newMessage;
    }
  }
});

// Event listener for message editing
chatMessages.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-button")) {
    const messageContainer = event.target.closest(".message");
    const messageContent = messageContainer.querySelector(".message-content");
    const originalMessage = messageContent.textContent.trim();
    const newMessage = prompt("Edit your message:", originalMessage);
    if (newMessage !== null && newMessage !== originalMessage) {
      // Emit the edited message to the WebSocket server
      const messageId = messageContainer.dataset.messageId;
      socket.send(
        JSON.stringify({ editMessage: { messageId, content: newMessage } })
      );
      // Update the displayed message with the edited content
      messageContent.textContent = newMessage;
    }
  }
});

// Function to handle message deletion
function handleDelete(event) {
  const messageContainer = event.target.closest(".message");
  const messageId = messageContainer.dataset.messageId;

  // Emit the message ID to the WebSocket server for deletion
  socket.send(JSON.stringify({ deleteMessage: messageId }));

  // Remove the message container from the DOM
  messageContainer.remove();
}

// Event listener for message deletion
chatMessages.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-button")) {
    handleDelete(event);
  }
});

// Example usage of simulateUserLogin and simulateUserLogout (you can call these functions based on your login/logout logic):
simulateUserLogin("John Doe"); // Simulate John Doe logging in
simulateUserLogout("John Doe"); // Simulate John Doe logging out

// Function to handle user typing status
function handleTyping(username, typing) {
  if (typing) {
    // If the user is typing, show the typing indicator with the username
    showTypingIndicator(username);
  } else {
    // If the user is not typing, hide the typing indicator
    hideTypingIndicator();
  }
}

// Event listener for detecting typing
let typingTimeout;

messageInput.addEventListener("input", () => {
  const message = messageInput.value;
  if (message) {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      // After a certain interval of inactivity, consider the user has stopped typing
      hideTypingIndicator();
    }, TYPING_INTERVAL);
    // Notify other users that the current user is typing
    notifyTyping(true);
  } else {
    // If the message input is empty, the user is not typing
    hideTypingIndicator();
    // Notify other users that the current user has stopped typing
    notifyTyping(false);
  }
});

// Function to notify other users that the current user is typing or has stopped typing
function notifyTyping(typing) {
  const data = {
    userTyping: {
      username: currentUser, // Replace 'currentUser' with the actual username of the current user
      typing,
    },
  };
  socket.send(JSON.stringify(data));
}

// Add this code to the end of the script.js file
const imageInput = document.getElementById("image-input");
const sendImageButton = document.getElementById("send-image-button");

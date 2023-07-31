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

// Get the dark mode toggle button element
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Function to handle dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Event listener for dark mode toggle button click
darkModeToggle.addEventListener("click", toggleDarkMode);

// Function to handle user mentions
function handleMentions(message, sender) {
  // Extract mentioned usernames from the message
  const mentionedUsernames = message.match(/@\w+/g);

  if (mentionedUsernames) {
    // Send a notification to mentioned users (to be implemented in the backend)
    // Example: socket.send(JSON.stringify({ mentionedUsernames, sender }));

    // Highlight the message for mentioned users
    mentionedUsernames.forEach((username) => {
      const mentionedMessage = `@${username}`;
      const regex = new RegExp(mentionedMessage, "g");
      message = message.replace(
        regex,
        `<span class="mentioned">@${username}</span>`
      );
    });
  }

  // Return the updated message
  return message;
}

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

  // Function to handle message reactions
  function handleReactions(messageId, reaction) {
    const messageContainer = chatMessages.querySelector(
      `[data-message-id="${messageId}"]`
    );
    if (messageContainer) {
      const reactionsContainer = messageContainer.querySelector(
        ".reactions-container"
      );
      if (reactionsContainer) {
        // Check if the reaction already exists
        const existingReaction = reactionsContainer.querySelector(
          `[data-reaction="${reaction}"]`
        );
        if (existingReaction) {
          // If the reaction already exists, remove it
          existingReaction.remove();
        } else {
          // If the reaction doesn't exist, add it to the reactions container
          const reactionElement = document.createElement("span");
          reactionElement.classList.add("message-reaction");
          reactionElement.textContent = reaction;
          reactionElement.setAttribute("data-reaction", reaction);
          reactionsContainer.appendChild(reactionElement);
        }
      }
    }
  }

  // Event listener for message reactions
  chatMessages.addEventListener("click", (event) => {
    const target = event.target;
    if (target.classList.contains("message-reaction")) {
      const messageId = target.closest(".message").dataset.messageId;
      const reaction = target.textContent;
      handleReactions(messageId, reaction);
    }
  });

  // Get the notification badge element
  const notificationBadge = document.getElementById("notification-badge");

  // Function to update the notification badge count
  function updateNotificationBadge(count) {
    notificationBadge.textContent = count;
    notificationBadge.style.display = count > 0 ? "block" : "none";
  }

  // Example: Increment the notification badge count when a new message arrives
  let unreadMessageCount = 0;

  function onNewMessage() {
    // Increment the unread message count
    unreadMessageCount++;
    // Update the notification badge
    updateNotificationBadge(unreadMessageCount);
  }

  // Example: Reset the notification badge count when the user reads the messages
  function markAllMessagesAsRead() {
    // Reset the unread message count
    unreadMessageCount = 0;
    // Update the notification badge
    updateNotificationBadge(unreadMessageCount);
  }

  // Get the reply input container and input elements
  const replyInputContainer = document.getElementById("reply-input-container");
  const replyInput = document.getElementById("reply-input");
  const cancelReplyButton = document.getElementById("cancel-reply-button");

  // Function to show the reply input field when the "Reply" button is clicked
  function showReplyInput(messageId, sender) {
    // Display the reply input container
    replyInputContainer.style.display = "block";
    // Set the input placeholder to include the sender's name
    replyInput.placeholder = `Reply to ${sender}...`;
    // Clear any previous reply
    replyInput.value = "";

    // Event listener for canceling the reply
    cancelReplyButton.addEventListener("click", () => {
      hideReplyInput();
    });

    // Event listener for submitting the reply
    replyInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        const replyMessage = replyInput.value.trim();
        if (replyMessage !== "") {
          // Send the reply message to the server (to be implemented in the backend)
          // Example: socket.send(JSON.stringify({ replyMessage, originalMessageId: messageId }));

          // Clear the reply input field
          replyInput.value = "";
          // Hide the reply input field
          hideReplyInput();
        }
      }
    });
  }

  // Function to hide the reply input field
  function hideReplyInput() {
    // Hide the reply input container
    replyInputContainer.style.display = "none";
    // Remove the event listeners for the cancel button
    cancelReplyButton.removeEventListener("click", hideReplyInput);
    // Remove the event listener for submitting the reply
    replyInput.removeEventListener("keypress", () => {});
  }

  // Get the search input and button elements
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  // Function to handle message search
  function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === "") {
      // If the search term is empty, reset the display to show all messages
      chatMessages.querySelectorAll(".message").forEach((message) => {
        message.style.display = "block";
      });
    } else {
      // Otherwise, filter and display only the messages that match the search term
      chatMessages.querySelectorAll(".message").forEach((message) => {
        const content = message
          .querySelector(".message-content")
          .textContent.toLowerCase();
        if (content.includes(searchTerm)) {
          message.style.display = "block";
        } else {
          message.style.display = "none";
        }
      });
    }
  }

  // Event listener for search button click
  searchButton.addEventListener("click", handleSearch);

  // Event listener for search input keypress (to trigger search on Enter)
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  // Function to format timestamp for messages
  function formatTimestamp(timestamp) {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(timestamp).toLocaleString(undefined, options);
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

// Get the message search input element
const messageSearchInput = document.getElementById("message-search");

// Event listener for the message search input
messageSearchInput.addEventListener("input", () => {
  const keyword = messageSearchInput.value.trim().toLowerCase();

  // Filter chat messages based on the search keyword
  chatMessages.querySelectorAll(".message").forEach((messageContainer) => {
    const messageContent = messageContainer
      .querySelector(".message-content")
      .textContent.toLowerCase();
    messageContainer.style.display = messageContent.includes(keyword)
      ? "block"
      : "none";
  });
});

// Get the clear chat button element
const clearChatButton = document.getElementById("clear-chat-button");

// Event listener for the clear chat button
clearChatButton.addEventListener("click", () => {
  // Remove all messages from the chat container
  chatMessages.innerHTML = "";
});

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

// Function to update user profile information in the DOM
function updateUserProfile(username, email) {
  const userProfile = document.querySelector(".user-profile");
  const usernameParagraph = userProfile.querySelector(".username");
  const emailParagraph = userProfile.querySelector(".email");

  // Update the displayed username and email
  usernameParagraph.textContent = `Username: ${username}`;
  emailParagraph.textContent = `Email: ${email}`;
}

// Function to handle user profile edit
function handleProfileEdit() {
  // Get the current user profile information
  const userProfile = document.querySelector(".user-profile");
  const usernameParagraph = userProfile.querySelector(".username");
  const emailParagraph = userProfile.querySelector(".email");

  // Get the current username and email
  const currentUsername = usernameParagraph.textContent.split(": ")[1];
  const currentEmail = emailParagraph.textContent.split(": ")[1];

  // Prompt the user to enter new username and email
  const newUsername = prompt("Enter new username:", currentUsername);
  const newEmail = prompt("Enter new email:", currentEmail);

  // Check if the user provided new username and email and they are not the same as the current values
  if (
    newUsername !== null &&
    newEmail !== null &&
    (newUsername !== currentUsername || newEmail !== currentEmail)
  ) {
    // Emit the updated user profile information to the WebSocket server
    const data = {
      userProfileUpdate: {
        username: newUsername,
        email: newEmail,
      },
    };
    socket.send(JSON.stringify(data));

    // Update the displayed user profile with the new information
    updateUserProfile(newUsername, newEmail);
  }
}

// Event listener for user profile edit button
const editProfileButton = document.querySelector(".edit-profile-button");
// Event listener for the edit profile button
editProfileButton.addEventListener("click", () => {
  const newUsername = prompt("Enter your new username:");
  const newEmail = prompt("Enter your new email:");

  // Update the displayed username and email
  const usernameElement = document.querySelector(".username");
  const emailElement = document.querySelector(".email");
  if (newUsername) {
    usernameElement.textContent = newUsername;
  }
  if (newEmail) {
    emailElement.textContent = newEmail;
  }
});

// Function to handle password change
function handleChangePassword() {
  // Prompt the user to enter the current password and new password
  const currentPassword = prompt("Enter current password:");
  const newPassword = prompt("Enter new password:");

  // Check if the user provided both the current password and new password
  if (currentPassword !== null && newPassword !== null) {
    // You can add additional logic here to validate the password and perform the password change API call
    // For example: axios.post('/api/change-password', { currentPassword, newPassword })
    // .then((response) => {
    //   // Handle successful password change
    // })
    // .catch((error) => {
    //   // Handle password change error
    // });
  }
}

// Event listener for password change button
const changePasswordButton = document.querySelector(".change-password-button");
changePasswordButton.addEventListener("click", handleChangePassword);

// Function to handle notification settings change
function handleNotificationSettingsChange() {
  // You can add logic here to handle the notification settings change
  // For example, you can use checkboxes or dropdowns to allow users to customize their notification preferences
  // After the user updates the settings, you can emit the changes to the WebSocket server and handle them on the backend
}

// Event listener for notification settings change
const notificationSettingsButton = document.querySelector(
  ".notification-settings-button"
);
notificationSettingsButton.addEventListener(
  "click",
  handleNotificationSettingsChange
);

// Function to handle user profile update event from WebSocket
function handleUserProfileUpdate(username, email) {
  updateUserProfile(username, email);
  // You can also add any additional logic here when the user profile is updated
}

// WebSocket event listener for receiving real-time updates
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.userProfileUpdate) {
    // If the received data contains a 'userProfileUpdate' property, it means the user profile is updated.
    // Extract the 'username' and 'email' from the 'userProfileUpdate' object.
    const { username, email } = data.userProfileUpdate;
    // Call the 'handleUserProfileUpdate' function with the extracted 'username' and 'email'.
    handleUserProfileUpdate(username, email);
  }
  if (data.userLogin) {
    // If the received data contains a 'userLogin' property, it means a user logged in.
    // Extract the 'username' from the 'userLogin' object.
    const { username } = data.userLogin;
    // Call the 'handleUserLogin' function with the extracted 'username'.
    handleUserLogin(username);
  } else if (data.userLogout) {
    // If the received data contains a 'userLogout' property, it means a user logged out.
    // Extract the 'username' from the 'userLogout' object.
    const { username } = data.userLogout;
    // Call the 'handleUserLogout' function with the extracted 'username'.
    handleUserLogout(username);
  }
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

// Get the image preview container element
const imagePreviewContainer = document.getElementById(
  "image-preview-container"
);

// Function to display image preview
function displayImagePreview(imageUrl) {
  const imagePreview = document.createElement("img");
  imagePreview.classList.add("image-preview");
  imagePreview.src = imageUrl;
  imagePreview.alt = "Selected Image Preview";
  imagePreviewContainer.innerHTML = ""; // Clear previous preview (if any)
  imagePreviewContainer.appendChild(imagePreview);
}

// Event listener for the image input change
imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Display the selected image as a preview
      displayImagePreview(reader.result);
      // Emit the image data to the WebSocket server
      socket.send(JSON.stringify({ image: reader.result }));
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

// Function to update the online status of a user
function updateOnlineStatus(username, online) {
  // Find the user in the users array
  const user = users.find((user) => user.username === username);
  if (user) {
    // Update the online status
    user.online = online;

    // Update the user list display
    displayUsers();
  }
}

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

// Sample usage of simulateUserLogin and simulateUserLogout (you can call these functions based on your login/logout logic):
simulateUserLogin("John Doe"); // Simulate John Doe logging in
simulateUserLogout("John Doe"); // Simulate John Doe logging out

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

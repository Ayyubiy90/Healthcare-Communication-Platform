// script.js (combined code)
const registrationForm = document.getElementById("registration-form");
const loginForm = document.getElementById("login-form");
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");

registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // Get form data
  const formData = new FormData(registrationForm);
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  // Perform user registration API call (to be implemented in the backend)
  // Example: axios.post('/api/register', { username, email, password })
  // .then((response) => {
  //     // Handle successful registration
  // })
  // .catch((error) => {
  //     // Handle registration error
  // });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // Get form data
  const formData = new FormData(loginForm);
  const email = formData.get("login-email");
  const password = formData.get("login-password");

  // Perform user login API call (to be implemented in the backend)
  // Example: axios.post('/api/login', { email, password })
  // .then((response) => {
  //     // Handle successful login
  // })
  // .catch((error) => {
  //     // Handle login error
  // });
});

// Function to display incoming and outgoing messages in the chat box
function displayMessage(message, sender, timestamp) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
        <span class="message-sender">${sender}</span>
        <span class="message-timestamp">${timestamp}</span>
        <p class="message-content">${message}</p>
    `;
  chatMessages.appendChild(div);
  // Scroll to the bottom to show the latest messages
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to handle errors and display error messages
function displayError(message) {
  const div = document.createElement("div");
  div.classList.add("error-message");
  div.textContent = message;
  chatMessages.appendChild(div);
}

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

// Send message when the form is submitted
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message === "") {
    displayError("Error: Message cannot be empty.");
    return;
  }

  // Emit the message to the WebSocket server
  socket.send(JSON.stringify({ message }));
  messageInput.value = ""; // Clear the input field after sending the message
});

// Function to format timestamp for messages
function formatTimestamp() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

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

// Event listener for typing detection
chatForm.addEventListener("input", handleTyping);

// Add this code to the end of the script.js file
const imageInput = document.getElementById("image-input");
const sendImageButton = document.getElementById("send-image-button");

// Function to handle image selection and sending
sendImageButton.addEventListener("click", () => {
  imageInput.click(); // Trigger the hidden file input
});

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    // Read the image file as data URL
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Emit the image data to the WebSocket server
      socket.send(JSON.stringify({ image: reader.result }));
    };
    reader.onerror = () => {
      displayError("Error: Failed to read the selected image.");
    };
  }
});

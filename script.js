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

// WebSocket connection (to be implemented in the backend)
const socket = io(); // Replace 'io()' with the actual WebSocket connection URL

// Listen for incoming messages
socket.on("message", (data) => {
  const { message, sender } = data;
  displayMessage(message, sender);
});

// Send message when the form is submitted
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value;

  // Emit the message to the WebSocket server (to be implemented in the backend)
  socket.emit("sendMessage", { message });
  messageInput.value = ""; // Clear the input field after sending the message
});

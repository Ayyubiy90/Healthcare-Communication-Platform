# Real-Time Chat Application

This is a simple real-time chat application built using JavaScript, Node.js, Express, and WebSocket. The application allows users to exchange messages in real-time with other connected users.

## Features

- Real-time messaging: Users can send and receive messages in real-time.
- User typing status: When a user starts typing a message, other users will see a typing indicator.
- Online status: Users are notified when other users join or leave the chat.

## Technologies Used

- HTML, CSS, and JavaScript for the frontend user interface.
- Node.js and Express for the backend server.
- WebSocket for enabling real-time communication between clients and the server.

## How to Run the Application

1. Clone the repository to your local machine using the following command:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd real-time-chat-app
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

4. Start the backend server:
   ```
   node server.js
   ```

5. Access the application in your web browser by visiting `http://localhost:8080`.

## Usage

1. Upon opening the application, you will see the chat interface.
2. Enter your desired username in the registration form and click "Register" to join the chat.
3. Type a message in the message input field and click "Send" to send the message to other users in real-time.
4. When you start typing a message, other users will see a typing indicator next to your username.
5. If any other user joins or leaves the chat, you will be notified with an online status message.

## Additional Notes

- The chat application uses WebSocket for real-time communication, enabling fast and efficient messaging between users.
- Messages are displayed with timestamps to show when they were sent.
- The application supports multiple users simultaneously, and messages are broadcasted to all connected users.
- User login and authentication are not implemented in this basic version. You can add user authentication to enhance security and privacy.

## Future Improvements

- User authentication: Implement user login and authentication to ensure the privacy and security of chat messages.
- Message history: Add a feature to retrieve and display previous chat messages when a user joins the chat.
- Image sharing: Allow users to share images in the chat by implementing image uploading and displaying capabilities.
- Emojis and formatting: Enable support for emojis and text formatting (e.g., bold, italic) in chat messages.

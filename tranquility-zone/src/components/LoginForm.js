import React from 'react';

const LoginForm = ({ onLogin }) => {
  // Function to handle form submission (login logic)
  const handleSubmit = (event) => {
    event.preventDefault();
    // Add logic here to handle user login (e.g., API call to the backend)
    // For this example, we'll simulate a successful login without actual backend integration
    onLogin();
  };

  return (
    <div className="login-form">
      <h2>Login to TranquilityZone</h2>
      <form onSubmit={handleSubmit}>
        {/* Add form fields for username, password, etc. */}
        <button type="submit" className="submit-button">Login</button>
      </form>
    </div>
  );
};
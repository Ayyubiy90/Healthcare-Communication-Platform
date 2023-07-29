import React, { useState } from 'react';
import Navbar from './components/Navbar';
import WritingSession from './components/WritingSession';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to handle user login
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Function to handle user logout
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="app">
      <Navbar />
      {!isLoggedIn ? (
        <>
          <RegistrationForm />
          <LoginForm onLogin={handleLogin} />
        </>
      ) : (
        <>
          <WritingSession />
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </>
      )}
    </div>
  );
};

export default App;

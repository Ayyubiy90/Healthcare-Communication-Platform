import React, { useState } from 'react';
import './WritingSession.css';

const WritingSession = () => {
  const [writingText, setWritingText] = useState('');

  const handleInputChange = (event) => {
    setWritingText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // You can add logic here to process the user's writingText
  };

  return (
    <div className="writing-session">
      <h2>Start Your Stress-Relief Writing Session</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="writing-textarea"
          value={writingText}
          onChange={handleInputChange}
          placeholder="Write your thoughts here..."
          rows="10"
        />
        <button type="submit" className="submit-button">Save</button>
      </form>
    </div>
  );
};

export default WritingSession;

import React, { useState } from 'react';
import './chat.css'; 

const ChatRoom = ({ topic = 'Resume Development' }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    setMessages([...messages, { text: newMsg, isSent: true }]);
    setNewMsg('');
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>{topic}</h3>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#aaa' }}>
            No messages yet.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.isSent ? 'me' : ''}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;

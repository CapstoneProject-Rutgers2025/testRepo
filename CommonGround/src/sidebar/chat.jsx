import React, { useState } from 'react';
import ChatBubble from './chatbubble';
import './chat.css'; 

const ChatRoom = ({ topic = 'Resume Development', messages, setMessages }) => {
  const [newMsg, setNewMsg] = useState('');

  
  const sendMessage = () => {
    if (!newMsg.trim()) return;
  
    
    const newMessage = {
      text: newMsg,
      isSent: true,
      name: 'User',
      avatarUrl: 'https://i.pravatar.cc/36?u=you', 
    };
  
    setMessages([...messages, newMessage]);
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
            <ChatBubble
              key={i}
              text={msg.text}
              isSent={msg.isSent}
              name={msg.name}
              avatarUrl={msg.avatarUrl}
            />
          ))}
      </div>

      <div className="chat-input-bar">
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

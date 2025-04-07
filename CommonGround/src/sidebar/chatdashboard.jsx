import React, { useState } from 'react';
import ChatRoom from './chat'; 
import './chat.css';

const ChatDashboard = ({ isSidebarOpen }) => {
    const [activeChat, setActiveChat] = useState('Resume Development');

  const chats = [
    { id: 1, name: 'Design my living room with me' },
    { id: 2, name: 'Resume Development' },
  ];

  const members = ['User', 'User2', 'User3', 'User4'];

  return (
<div className={`chat-dashboard ${isSidebarOpen ? 'shift' : ''}`}>
      {/* Left Sidebar: List of Chats */}
      <div className="chat-list">
        <h3>Chats</h3>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat === chat.name ? 'active' : ''}`}
            onClick={() => setActiveChat(chat.name)}
          >
            {chat.name}
          </div>
        ))}
      </div>

      {/* Middle Section: ChatRoom */}
      <div className="chat-room-wrapper">
        <ChatRoom topic={activeChat} />
      </div>

      {/* Right Panel: Members Info */}
      <div className="chat-info">
        <h3>{activeChat}</h3>
        <p>Group members: {members.length}</p>
        <div className="chat-members">
          {members.map((name, idx) => (
            <div key={idx} className="chat-member">
              <div className="avatar-circle" />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;

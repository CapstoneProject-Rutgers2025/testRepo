import React, { useState } from 'react';
import ChatRoom from './chat'; 
import { Link } from 'react-router-dom';


import './chat.css';

const ChatDashboard = ({ isSidebarOpen }) => {
    const [activeChat, setActiveChat] = useState('Resume Development');

  const chats = [
    { id: 1, name: 'Design my living room with me' },
    { id: 2, name: 'Resume Development' },
  ];

  const members = [
    { id: 'user1', name: 'User' },
    { id: 'user2', name: 'User2' },
    { id: 'user3', name: 'User3' },
    { id: 'user4', name: 'User4' }
  ];

  const [chatMessages, setChatMessages] = useState({
    'Design my living room with me': [
      {
        text: "Let's move the couch to the right.",
        isSent: false,
        name: "User2",
        avatarUrl: "https://i.pravatar.cc/150?img=8"
      }
    ],
    'Resume Development': [
      {
        text: "Hey, can you help me with my resume?",
        isSent: false,
        name: "User2",
        avatarUrl: "https://i.pravatar.cc/150?img=8"
      },
      {
        text: "Of course! What role are you applying for?",
        isSent: false,
        name: "User3",
        avatarUrl: "https://i.pravatar.cc/150?img=1"
      }
    ]
  });

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
      <ChatRoom
          topic={activeChat}
          messages={chatMessages[activeChat]} 
          setMessages={(newMessages) =>
            setChatMessages((prev) => ({ ...prev, [activeChat]: newMessages }))
  }
/>
      </div>

      {/* Right Panel: Members Info */}
      <div className="chat-info">
        <h3>{activeChat}</h3>
        <p>Group members: {members.length}</p>
        <div className="chat-members">
        {members.map((member, idx) => (
        <div key={idx} className="chat-member">
          <div className="avatar-circle" />
          <Link to={`/profile/${member.id}`} className="member-name-link">
            {member.name}
          </Link>
        </div>
      ))}

        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;

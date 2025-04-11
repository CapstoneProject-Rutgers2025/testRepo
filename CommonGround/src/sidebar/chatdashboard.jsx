import React, { useState, useEffect } from 'react';
import ChatRoom from './chat';
import './chat.css';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

const ChatDashboard = ({ isSidebarOpen }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const { id: user_id } = jwtDecode(token);

    fetch(`https://testrepo-hkzu.onrender.com/user-chats/${user_id}`)
      .then((res) => res.json())
      .then((data) => {
        const formattedChats = data.map(chat => ({
          id: chat.id,
          name: chat.title || `Chat ${chat.id}`,
        }));

        setChats(formattedChats);
        if (formattedChats.length > 0) {
          setActiveChat(formattedChats[0]);
        }
      })
      .catch((err) => console.error('Failed to load chats', err));
  }, []);

  useEffect(() => {
    if (!activeChat) return;

    fetch(`https://testrepo-hkzu.onrender.com/chat-users/${activeChat.id}`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error('Failed to fetch chat members', err));
  }, [activeChat]);

  return (
    <div className={`chat-dashboard ${isSidebarOpen ? 'shift' : ''}`}>
      {/* ✅ LEFT SIDEBAR — Chat Groups */}
      <div className="chat-list">
        <h3>Chats</h3>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => setActiveChat(chat)}
          >
            {chat.name}
          </div>
        ))}
      </div>

      {/* ✅ CENTER — Chat UI */}
      <div className="chat-room-wrapper">
        {activeChat ? (
          <ChatRoom
            topic={activeChat.name}
            chatId={activeChat.id}
          />
        ) : (
          <div style={{ padding: '2rem', color: '#aaa' }}>Select a chat to begin</div>
        )}
      </div>

      {/* ✅ RIGHT SIDEBAR — Members */}
      <div className="chat-info">
        {activeChat && (
          <>
            <h3>{activeChat.name}</h3>
            <p>Group members: {members.length}</p>
            <div className="chat-members">
              {members.map((user) => (
                <div key={user.id} className="chat-member">
                  <img
                    src={user.profile_picture || '/default-avatar.png'}
                    alt="pfp"
                    className="avatar-circle"
                  />
                  <Link to={`/profile/${user.id}`} className="member-name-link">
                    {user.username}
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;

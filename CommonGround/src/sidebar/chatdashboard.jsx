import React, { useState, useEffect } from 'react';
import ChatRoom from './chat';
import './chat.css';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

const ChatDashboard = ({ isSidebarOpen }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); // ✅ New state

  // Load user chats and current user ID on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { id: user_id } = jwtDecode(token);
      setCurrentUserId(user_id); // ✅ Save current user ID

      fetch(`https://testrepo-hkzu.onrender.com/user-chats/${user_id}`)
        .then(res => res.json())
        .then(data => {
          const formattedChats = data.map(chat => ({
            id: chat.id,
            name: chat.title || `Chat ${chat.id}`,
          }));
          setChats(formattedChats);
          if (formattedChats.length > 0) {
            setActiveChat(formattedChats[0]);
          }
        })
        .catch(err => console.error('Failed to load chats', err));
    } catch (err) {
      console.error('Invalid token', err);
    }
  }, []);

  // Load members when activeChat changes
  useEffect(() => {
    if (!activeChat) return;

    fetch(`https://testrepo-hkzu.onrender.com/chat-users/${activeChat.id}`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error('Failed to fetch chat members', err));
  }, [activeChat]);

  // ✅ Leave group handler
  const handleLeaveGroup = async () => {
    if (!currentUserId || !activeChat) return;
  
    try {
      const res = await fetch(
        `https://testrepo-hkzu.onrender.com/chat-users/leave/${activeChat.id}/${currentUserId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (!res.ok) {
        const error = await res.text();
        throw new Error("Failed to leave group: " + error);
      }
  
      // Remove the chat from sidebar and clear selection
      setChats((prev) => prev.filter((chat) => chat.id !== activeChat.id));
      setActiveChat(null);
    } catch (err) {
      console.error("Failed to leave group:", err.message);
      alert("Error: " + err.message);
    }
  };
  
  

  return (
    <div className={`chat-dashboard ${isSidebarOpen ? 'shift' : ''}`}>
      
      {/* LEFT SIDEBAR — Chat List */}
      <div className="chat-list">
        <h3>Chats</h3>
        {chats.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#999' }}>No chats yet</p>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat)}
            >
              {chat.name}
            </div>
          ))
        )}
      </div>

      {/* CENTER — Chat Room */}
      <div className="chat-room-wrapper">
        {activeChat ? (
          <ChatRoom topic={activeChat.name} chatId={activeChat.id} />
        ) : (
          <div style={{ padding: '2rem', color: '#888', fontSize: '16px' }}>
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR — Member List */}
      <div className="chat-info">
        {activeChat && (
          <>
            <h3>{activeChat.name}</h3>
            <p>Group members: {members.length}</p>
            <div className="chat-members">
              {members.length === 0 ? (
                <p style={{ color: '#888' }}>No members in this chat</p>
              ) : (
                members.map(user => (
                  <div key={user.id} className="chat-member">
                    <img
                      src={user.profile_picture || '/default-avatar.png'}
                      alt="Profile"
                      className="avatar-circle"
                    />
                    <Link to={`/profile/${user.id}`} className="member-name-link">
                      {user.username}
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* ✅ Leave Group Button */}
            {currentUserId && (
              <button
                onClick={handleLeaveGroup}
                style={{
                  marginTop: "20px",
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Leave Group
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;

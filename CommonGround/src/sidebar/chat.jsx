import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode'; 
import './chat.css';
import ChatBubble from './chatbubble';

const BASE_URL = 'https://testrepo-hkzu.onrender.com';

const socket = io(BASE_URL);

const ChatRoom = ({ topic = 'Chat', chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]); // Initialize notifications state

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { id } = jwtDecode(token);
      setUserId(id);
    } catch (err) {
      console.error('Invalid token', err);
    }
  }, []);

  useEffect(() => {
    if (!chatId) {
      console.error('chatId is undefined');
      return;
    }

    // Fetch existing messages for the chat room
    fetch(`${BASE_URL}/messages/${chatId}`)
  .then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then((data) => setMessages(data))
  .catch((err) => console.error('Failed to fetch messages:', err));

    // Join the chat room via WebSocket
    socket.emit('joinRoom', chatId);

    // Listen for user joined and left events for notifications
    socket.on('userJoined', (data) => {
      setNotifications((prev) => [
        ...prev,
        `${data.name} has joined the chat.`,
      ]);
    });

    socket.on('userLeft', (data) => {
      setNotifications((prev) => [
        ...prev,
        `${data.name} has left the chat.`,
      ]);
    });

    // Listen for new messages from the server
    socket.on('receiveMessage', (message) => {
      if (message.sender_id !== userId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.emit('leaveRoom', chatId);
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('receiveMessage');
    };
  }, [chatId]);

  const sendMessage = () => {
    if (!newMsg.trim() || !userId || !chatId) return;

    const message = {
      chat_id: chatId,
      sender_id: userId,
      content: newMsg,
    };

    // Send the message to the server via WebSocket
    socket.emit('sendMessage', message);

    // Optimistically update the UI
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        sender: 'You',
        profile_picture:' ',
        sent_at: new Date().toISOString(), // Optional: replace with actual profile picture URL
      },
    ]);
    setNewMsg('');
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>{topic}</h3>
      </div>

      <div className="chat-notifications">
        {notifications.length > 0 &&
          notifications.map((notif, i) => (
            <p key={i} className="notification">{notif}</p>
          ))}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>No messages yet.</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-message ${msg.sender_id === userId ? 'me' : ''}`}
            >
              <div className="chat-meta">
                <img
                  src={msg.profile_picture || '/default-avatar.png'}
                  alt="pfp"
                  className="avatar-circle"
                />
                <span className="sender-name">{msg.sender}</span>
                <span className="sent-time">
                </span>
              </div>
              <div className="chat-bubble">{msg.content}</div>
            </div>
          ))
        )}
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
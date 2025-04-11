import React, { useEffect, useState } from 'react';
import './chat.css';
import ChatBubble from './chatbubble';
import { jwtDecode } from 'jwt-decode';

const ChatRoom = ({ topic = 'Chat', chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [userId, setUserId] = useState(null);

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
    if (!chatId) return;

    fetch(`https://testrepo-hkzu.onrender.com/messages/${chatId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error('Failed to fetch messages', err));
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !userId || !chatId) return;

    try {
      const res = await fetch('https://testrepo-hkzu.onrender.com/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          content: newMsg,
        }),
      });

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            content: newMsg,
            sender: 'You',
            profile_picture: '', // Optional: replace with actual profile picture URL if known
            sender_id: userId,
          },
        ]);
        setNewMsg('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>{topic}</h3>
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

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import './chat.css'; // Make sure the path is correct

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketConnection = io("http://localhost:5173");

    setSocket(socketConnection);

    socketConnection.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, { text: msg, isSent: false }]);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage && socket) {
      socket.emit("chat message", newMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, isSent: true }
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="content-container">
      <h2>Chat</h2>
      <p>Start a conversation...</p>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.isSent ? 'sent' : 'received'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Chat;

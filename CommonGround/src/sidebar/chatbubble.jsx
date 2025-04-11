import React from 'react';
import './ChatBubble.css';

const ChatBubble = ({ text, isSent, name, avatarUrl }) => {
  return (
    <div className={`chat-bubble-wrapper ${isSent ? 'sent' : 'received'}`}>
      {!isSent && (
        <img className="chat-avatar" src={avatarUrl} alt={`${name}'s avatar`} />
      )}

      <div className="chat-bubble-content">
        {!isSent && <div className="chat-name">{name}</div>}
        <div className="chat-bubble">
          <span>{text}</span>
        </div>
      </div>

      {isSent && (
        <img className="chat-avatar" src={avatarUrl} alt={`${name}'s avatar`} />
      )}
    </div>
  );
};

export default ChatBubble;

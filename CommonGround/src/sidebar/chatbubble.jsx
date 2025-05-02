import React from 'react';
import './chatbubble.css';

const ChatBubble = ({ text, isSent, name, avatarUrl }) => {
  return (
    <div
      className={`chat-bubble-wrapper ${isSent ? 'sent' : 'received'}`}
      style={{
        alignSelf: isSent ? 'flex-end' : 'flex-start',
        marginLeft: isSent ? 'auto' : 0,
        marginRight: isSent ? '0' : 'auto',
        maxWidth: '75%' // optional to keep spacing clean
      }}
    >
      <img className="chat-avatar" src={avatarUrl} alt={`${name}'s avatar`} />

      <div className="chat-bubble-content">
        {!isSent && <div className="chat-name">{name}</div>}
        <div className={`chat-bubble ${isSent ? 'sent' : 'received'}`}>
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;

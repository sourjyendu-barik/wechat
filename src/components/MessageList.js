import React from "react";

const MessageList = ({ messages, user }) => {
  const formatdate = (fulldate) => {
    if (!fulldate) return "";

    const date = new Date(fulldate);
    if (isNaN(date)) return ""; // prevents Invalid Date

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getTicks = (status) => {
    if (!status) return "";
    if (status === "sent") return "✓";
    if (status === "delivered") return "✓✓";
  };
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.sender === user ? "sent" : "received"}`}
        >
          <strong>{msg.sender}: </strong>
          {msg.message}
          <span className="msg-time">
            {formatdate(msg.createdAt)}
            {msg.sender === user && <span>{getTicks(msg.status)}</span>}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;

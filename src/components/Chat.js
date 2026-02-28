import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import MessageList from "./MessageList";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import useAxios from "../hooks/useAxios";
import { getAllUsers } from "../api/api.user";
import { getAllMessages } from "../api/api.messages";
import { useAuthContext } from "../context/AuthContext";
const socket = io("http://localhost:5001");
export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [pickEmoji, setPickEmoji] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { logout } = useAuthContext();
  const { data } = useAxios(() => getAllUsers(user));
  useEffect(() => {
    if (data?.users) {
      setUsers((prev) => data?.users);
    }
  }, [data]);
  useEffect(() => {
    socket.emit("user_logged_in", user);
  }, [user]);

  useEffect(() => {
    // Fetch all users excluding the current user

    // Listen for incoming messages

    socket.on("receive_message", (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessages((prev) => [...prev, data]);

        if (data.receiver === user) {
          socket.emit("message_delivered", {
            messageId: data._id,
          });
        }
      }
    });
    socket.on("user-typing", ({ sender }) => {
      if (sender === currentChat) {
        setTypingUser(sender);
      }
    });

    socket.on("user-typing-ended", ({ sender }) => {
      if (sender === currentChat) {
        setTypingUser(null);
      }
    });
    socket.on("message_status_update", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, status: data.status } : msg,
        ),
      );
    });
    return () => {
      socket.off("receive_message");
      socket.off("user-typing");
      socket.off("user-typing-ended");
      socket.off("message_status_update");
    };
  }, [currentChat]);

  const fetchMessages = async (receiver) => {
    try {
      setCurrentChat(receiver.trim());

      const res = await getAllMessages(user.trim(), receiver.trim());

      if (res?.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (!currentChat || !currentMessage.trim()) return;

    const messageData = {
      sender: user,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.emit("send_message", messageData);
    // setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  const onChangeHandler = (e) => {
    const { value } = e.target;
    setCurrentMessage(value);
    if (!currentChat) return;

    socket.emit("typing", {
      sender: user,
      receiver: currentChat,
    });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-ended", {
        sender: user,
        receiver: currentChat,
      });
    }, 1000);
  };
  const onEmojiClick = (emojiData) => {
    setCurrentMessage((prev) => prev + emojiData.emoji);
    setPickEmoji(false);
  };
  return (
    <div className="chat-container">
      <h2>Welcome, {user}</h2>
      <div className="chat-list">
        <h3>Chats</h3>
        {users.map((u) => (
          <div
            key={u._id}
            className={`chat-user ${
              currentChat === u.username ? "active" : ""
            }`}
            onClick={() => fetchMessages(u.username)}
          >
            {u.username}
          </div>
        ))}
        <button onClick={logout} className="btn btn-danger">
          Logout
        </button>
      </div>

      {currentChat && (
        <div className="chat-window">
          <h5>You are chatting with {currentChat}</h5>
          {typingUser === currentChat && (
            <div className="typing-indicator">{currentChat} is typing...</div>
          )}
          <MessageList messages={messages} user={user} />
          <div className="message-field">
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              style={{ minWidth: "400px" }}
              onChange={onChangeHandler}
            />
            <button className="btn-prime" onClick={sendMessage}>
              Send
            </button>
            <button
              onClick={() => {
                setPickEmoji((prev) => !prev);
              }}
            >
              +
            </button>
            {pickEmoji && (
              <div
                style={{
                  position: "absolute",
                  bottom: "200px",
                  right: "10px",
                  zIndex: 1000,
                }}
              >
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

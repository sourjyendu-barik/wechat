import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import MessageList from "./MessageList";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import useAxios from "../hooks/useAxios";
import { getAllUsers } from "../api/api.user";
import { getAllMessages } from "../api/api.messages";
import { useAuthContext } from "../context/AuthContext";

export const Chat = ({ user }) => {
  const socket = useRef(null);

  useEffect(() => {
    // socket.current = io("https://wechat-middlewire.vercel.app", {
    //   transports: ["websocket"],
    // });
    // socket.current = io("http://localhost:5001", {
    //   transports: ["websocket"], // Forces websocket to avoid CORS polling issues
    // });
    //https://wechat-middlewire.onrender.com/api/
    socket.current = io("https://wechat-middlewire.onrender.com", {
      transports: ["websocket"], // Forces websocket to avoid CORS polling issues
    });
    return () => {
      socket.current.disconnect();
    };
  }, []);
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
    if (socket.current) {
      socket.current.emit("user_logged_in", user);
    }
  }, [user]);

  useEffect(() => {
    // Fetch all users excluding the current user
    if (!socket.current) return;

    // Listen for incoming messages

    socket.current.on("receive_message", (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessages((prev) => [...prev, data]);

        if (data.receiver === user) {
          socket.current.emit("message_delivered", {
            messageId: data._id,
            sender: data.sender,
            receiver: data.receiver,
          });
        }
      }
    });
    // socket.current.on("user-typing", ({ sender }) => {
    //   if (sender === currentChat) {
    //     setTypingUser(sender);
    //   }
    // });

    // socket.current.on("user-typing-ended", ({ sender }) => {
    //   if (sender === currentChat) {
    //     setTypingUser(null);
    //   }
    // });
    socket.current.on("user-typing", ({ sender, receiver }) => {
      if (sender === currentChat && receiver === user) {
        setTypingUser(sender);
      }
    });
    socket.current.on("user-typing-ended", ({ sender, receiver }) => {
      if (sender === currentChat && receiver === user) {
        setTypingUser(null);
      }
    });
    socket.current.on("message_status_update", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, status: data.status } : msg,
        ),
      );
    });
    return () => {
      socket.current.off("receive_message");
      socket.current.off("user-typing");
      socket.current.off("user-typing-ended");
      socket.current.off("message_status_update");
    };
  }, [currentChat, user]);

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
    if (!socket.current || !currentChat || !currentMessage.trim()) return;

    const messageData = {
      sender: user,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.current.emit("send_message", messageData);
    // setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  const onChangeHandler = (e) => {
    const { value } = e.target;
    setCurrentMessage(value);
    if (!currentChat) return;

    // socket.current.emit("typing", {
    //   sender: user,
    //   receiver: currentChat,
    // });
    if (socket.current) {
      socket.current.emit("typing", {
        sender: user,
        receiver: currentChat,
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // typingTimeoutRef.current = setTimeout(() => {
    //   socket.current.emit("typing-ended", {
    //     sender: user,
    //     receiver: currentChat,
    //   });
    // }, 1000);
    typingTimeoutRef.current = setTimeout(() => {
      if (socket.current) {
        socket.current.emit("typing-ended", {
          sender: user,
          receiver: currentChat,
        });
      }
    }, 1500);
  };
  const onEmojiClick = (emojiData) => {
    setCurrentMessage((prev) => prev + emojiData.emoji);
    setPickEmoji(false);
  };
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
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

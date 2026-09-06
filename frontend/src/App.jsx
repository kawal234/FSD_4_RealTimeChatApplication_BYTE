import React, { useState, useEffect, useRef } from "react";
import './index.css';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem("chat_user") || "");
  const [room, setRoom] = useState(localStorage.getItem("chat_room") || "agent-dev");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const joinChat = async (e) => {
    if (e) e.preventDefault();
    if (!user.trim() || !room.trim()) return;

    localStorage.setItem("chat_user", user);
    localStorage.setItem("chat_room", room);

    try {
      const res = await fetch(`https://pulse-chat-backend-5vla.onrender.com/chat/history/${room}`);
      if (res.ok) {
        const history = await res.json();
        setMessages(history);
      }
    } catch (err) {
      console.error("Failed to fetch message history:", err);
    }

    const ws = new WebSocket(`wss://pulse-chat-backend-5vla.onrender.com/ws/chat/${room}`);

    ws.onmessage = (event) => {
      const incoming = JSON.parse(event.data);
      setMessages((prev) => [...prev, incoming]);
    };

    ws.onclose = () => console.log("WebSocket disconnected");
    socketRef.current = ws;
    setJoined(true);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current) return;

    const payload = {
      sender: user,
      content: inputMessage,
    };

    socketRef.current.send(JSON.stringify(payload));
    setInputMessage("");
  };

  const leaveChat = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setJoined(false);
    setMessages([]);
  };

  if (!joined) {
    return (
      <div className="join-modal-container">
        <form className="join-modal" onSubmit={joinChat}>
          <h2 style={{ textAlign: "center", fontWeight: "500" }}>Workspace Login</h2>
          <input
            placeholder="Engineer Name"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            placeholder="Workspace (e.g. agent-dev)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button type="submit">Initialize</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button className="new-chat-btn" onClick={leaveChat}>
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New chat
        </button>
        <div className="sidebar-nav">
          <div className="sidebar-room"># {room}</div>
        </div>
        <div className="sidebar-footer">
          <div style={{ width: '28px', height: '28px', background: '#10a37f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {user.charAt(0).toUpperCase()}
          </div>
          {user}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
        <div className="chat-header">
          Model: Pulse-RealTime-WebSocket
        </div>
        
        <div className="messages-pane">
          {messages.map((msg) => {
            const isSent = msg.sender === user;
            return (
              <div key={msg.id} className={`message-row ${isSent ? "sent" : "received"}`}>
                <div className="message-content-wrapper">
                  {!isSent && (
                    <div style={{ flexShrink: 0, width: '32px', height: '32px', background: '#ab68ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`message-bubble ${isSent ? "sent" : "received"}`}>
                    {!isSent && <div className="sender-name">{msg.sender}</div>}
                    <div>{msg.content}</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area-container">
          <form className="message-input-form" onSubmit={sendMessage}>
            <input
              placeholder={`Message #${room}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={!inputMessage.trim()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
          <div className="input-footer-text">
            Pulse Chat can make mistakes. Consider verifying important system data.
          </div>
        </div>
      </div>
    </div>
  );
}

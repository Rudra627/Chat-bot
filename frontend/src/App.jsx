import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import { io } from "socket.io-client";

import "./App.css";

const socket = io("http://localhost:4000");

export default function App() {
  const mockThreads = [];

  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [activeThreadId, setActiveThread] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ⭐⭐⭐ NEW: activate New Chat & Clear Chat
  const handleNewChat = () => {
    setMessages([]);
  };

  const handleClearChat = () => {
    setMessages([]);
  };
  // ⭐⭐⭐ END NEW CODE

  useEffect(() => {
    socket.on("bot_message", (msg) => {
      setMessages((prev) => [...prev, { role: "bot", text: msg }]);
    });

    socket.on("bot_typing", () => setTyping(true));
    socket.on("bot_stop_typing", () => setTyping(false));

    return () => {
      socket.off("bot_message");
      socket.off("bot_typing");
      socket.off("bot_stop_typing");
    };
  }, []);

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <MessageSquare size={18} /> Chat Bot
          </span>

          <button
            className="btn btn-sm btn-outline-light d-md-none"
            onClick={() => setSidebarOpen(false)}
          >
            {/* <X size={16} /> */}
          </button>
        </div>

        {/* NEW CHAT BUTTON (ACTIVATED) */}
        <div className="p-3">
          <button
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleNewChat}     // <-- ACTIVATED
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className="thread-list px-3">
          {mockThreads.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setActiveThread(t.id);
                setSidebarOpen(false);
              }}
              className={`thread-item ${
                t.id === activeThreadId ? "thread-active" : ""
              }`}
            >
              <strong className="text-truncate">{t.title}</strong>
              <span className="thread-date">{t.date}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer mt-auto p-3">
          <button className="btn btn-dark w-100 d-flex align-items-center gap-2">
            <Settings size={16} /> Settings
          </button>

          {/* CLEAR CHAT BUTTON (ACTIVATED) */}
          <button
            className="btn btn-danger w-100 d-flex align-items-center gap-2 mt-2"
            onClick={handleClearChat}     // <-- ACTIVATED
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="overlay d-md-none" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN CHAT WINDOW */}
      <div className="chat-window">

        {/* Header */}
        <header className="chat-header">
          <button
            className="btn btn-outline-light d-md-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <h5 className="m-0 flex-grow-1 text-truncate ms-3">
            Chat
          </h5>

          {/* DELETE BUTTON IN HEADER (ACTIVATED) */}
          <button
            className="btn btn-outline-danger"
            onClick={handleClearChat}     // <-- ACTIVATED
          >
            <Trash2 size={18} />
          </button>
        </header>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {typing && <p className="text-light opacity-75">Bot is typing…</p>}
        </div>

        <ChatInput addUserMessage={addUserMessage} />
      </div>
    </div>
  );
}


/* ---- Message Bubbles ---- */
function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "right-msg" : "left-msg"}`}>
      {!isUser && <div className="avatar bot-avatar">B</div>}
      <div className={`message-bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
        {message.text}
      </div>
      {isUser && <div className="avatar user-avatar">U</div>}
    </div>
  );
}

/* ---- Input ---- */
function ChatInput({ addUserMessage }) {
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;

    addUserMessage(input);
    socket.emit("user_message", input);
    setInput("");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-input-container d-flex align-items-end">
      <textarea
        className="chat-input form-control"
        placeholder="Type a message…"
        value={input}
        rows={1}
        onKeyDown={handleEnter}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={send}
        className="btn btn-primary send-btn"
        disabled={!input.trim()}
      >
        <Send size={18} />
      </button>
    </div>
  );
}

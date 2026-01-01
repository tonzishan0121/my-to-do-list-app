import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendIcon } from 'lucide-react';
import '../App.less';

const AIChatGate = ({ onAddMessage, onPasswordSuccess }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: '你好！我是你的智能助手小缇宝。', isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 正确的密钥
  const CORRECT_PASSWORD = '恭喜答对！芝麻开门~';

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const messageCallback = useCallback(msg => {
    addMessage(msg, false);
    if (msg.includes(CORRECT_PASSWORD)) {
      onPasswordSuccess();
    }
  }, []);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text, isUser) => {
    const newMessage = {
      id: Date.now(),
      text,
      isUser
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isChecking) return;
    setIsChecking(true);
    const userMessage = inputValue.trim();
    addMessage(userMessage, true);
    onAddMessage(userMessage, messageCallback);
    setInputValue('');
    setIsChecking(false);
  };

  return (
    <div className="ai-chat-gate">
      <div className="ai-chat-gate-content">
        <div className="ai-chat-gate-header">
          <h2>AI 智能助手</h2>
          <p onClick={onPasswordSuccess}>与AI对暗号以解锁待办事项列表</p>
        </div>

        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-chat-message ${message.isUser ? 'user' : 'ai'}`}
            >
              <div className="ai-chat-message-content">
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="ai-chat-input-form">
          <div className="ai-chat-input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入消息..."
              className="ai-chat-input"
              disabled={isChecking}
            />
            <button
              type="submit"
              className="ai-chat-send-button"
              disabled={isChecking || !inputValue.trim()}
              aria-label="发送消息"
            >
              <SendIcon size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChatGate;
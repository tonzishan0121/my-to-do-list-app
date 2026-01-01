import React, { useState, useRef, useEffect } from 'react';
import { Cross2Icon, PaperPlaneIcon, MagicWandIcon } from '@radix-ui/react-icons';
import './AIChat.less';

const AIChat = ({ onAddMessage, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '你好！我是你的智能任务助手，可以帮助你管理待办事项。你可以让我帮你添加、完成或删除任务，或者询问任务相关的问题。',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text, isUser) => {
    const newMessage = {
      id: messages.length + 1,
      text,
      sender: isUser ? 'user' : 'ai',
      timestamp: new Date()
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    addMessage(inputValue, true);
    onAddMessage(inputValue, (message) => {
      addMessage(message, false);
      setIsLoading(false);
    });
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="header-content">
            <MagicWandIcon className="header-icon" />
            <h2>智能任务助手</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="关闭聊天">
            <Cross2Icon width={20} height={20}/>
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender}`}
            >
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-chat-input">
          <div className="input-container">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入指令，例如：添加购买牛奶任务、完成报告..."
              className="message-input"
              rows="1"
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              aria-label="发送消息"
            >
              <PaperPlaneIcon />
            </button>
          </div>
          <div className="input-hint">
            提示：可以让我帮你添加、完成或删除任务
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
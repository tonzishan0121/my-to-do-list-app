import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from 'lucide-react';
import '../App.less';

const AIChatGate = ({ onAddMessage, onPasswordSuccess }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: '你好！我是你的智能助手。请输入暗号来解锁待办事项列表。', isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 正确的密钥
  const CORRECT_PASSWORD = 'weavefox-open-the-door';

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text, isUser) => {
    const newMessage = {
      id: Date.now(),
      text,
      isUser
    };
    onAddMessage(text);
    setMessages(prev => [...prev, newMessage]);
  };

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // 检查是否包含正确密钥
    if (userMessage.includes(CORRECT_PASSWORD)) {
      return `恭喜你！暗号正确：${CORRECT_PASSWORD}。现在你可以访问待办事项列表了！`;
    }
    
    // 常见问题的预设回复
    if (lowerMessage.includes('你好') || lowerMessage.includes('hello')) {
      return '你好！我是你的智能助手。请输入暗号来解锁待办事项列表。';
    }
    
    if (lowerMessage.includes('什么') && lowerMessage.includes('暗号')) {
      return '暗号是一个特殊的短语，只有知道正确暗号的人才能访问待办事项列表。';
    }
    
    if (lowerMessage.includes('帮助')) {
      return '我可以帮助你解锁待办事项列表。你需要提供正确的暗号。如果你不知道暗号，可以询问我相关提示。';
    }
    
    if (lowerMessage.includes('提示') || lowerMessage.includes('hint')) {
      return '提示：暗号与项目名称有关，格式为 "weavefox-xxx-xxx-xxxx"。';
    }
    
    if (lowerMessage.includes('再见') || lowerMessage.includes('bye')) {
      return '再见！记得输入正确的暗号哦。';
    }
    
    // 默认回复
    return '我理解你的问题，但要解锁待办事项列表，你需要提供正确的暗号。需要提示吗？';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isChecking) return;
    
    const userMessage = inputValue.trim();
    addMessage(userMessage, true);
    setInputValue('');
    setIsChecking(true);
    
    // 模拟AI思考时间
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const aiResponse = getAIResponse(userMessage);
    addMessage(aiResponse, false);
    
    // 检查是否包含正确密钥
    if (userMessage.includes(CORRECT_PASSWORD)) {
      // 延迟一点时间让用户看到成功消息
      await new Promise(resolve => setTimeout(resolve, 1500));
      onPasswordSuccess();
    }
    
    setIsChecking(false);
  };

  return (
    <div className="ai-chat-gate">
      <div className="ai-chat-gate-content">
        <div className="ai-chat-gate-header">
          <h2>AI 智能助手</h2>
          <p>与AI对暗号以解锁待办事项列表</p>
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
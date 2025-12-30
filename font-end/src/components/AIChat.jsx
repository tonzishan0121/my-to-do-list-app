import React, { useState, useRef, useEffect } from 'react';
import { Cross2Icon, PaperPlaneIcon, MagicWandIcon } from '@radix-ui/react-icons';
import './AIChat.less';

const AIChat = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onClose }) => {
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 模拟AI处理逻辑
  const processUserMessage = (message) => {
    const lowerMsg = message.toLowerCase();
    
    // 添加任务的指令
    if (lowerMsg.includes('添加') || lowerMsg.includes('创建')) {
      const titleMatch = message.match(/添加(.+?)(?:任务|事项)/);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        onAddTask(title, '', '个人');
        return `好的，我已经为你添加了任务："${title}"`;
      }
    }
    
    // 完成任务的指令
    if (lowerMsg.includes('完成') || lowerMsg.includes('已完成')) {
      const taskMatch = message.match(/完成(.+)/);
      if (taskMatch && taskMatch[1]) {
        const taskTitle = taskMatch[1].trim();
        const task = tasks.find(t => t.title.includes(taskTitle) && !t.completed);
        if (task) {
          onToggleTask(task.id);
          return `好的，我已经将任务"${task.title}"标记为已完成！`;
        }
      }
    }
    
    // 删除任务的指令
    if (lowerMsg.includes('删除') || lowerMsg.includes('移除')) {
      const taskMatch = message.match(/删除(.+)/);
      if (taskMatch && taskMatch[1]) {
        const taskTitle = taskMatch[1].trim();
        const task = tasks.find(t => t.title.includes(taskTitle));
        if (task) {
          onDeleteTask(task.id);
          return `好的，我已经删除了任务"${task.title}"`;
        }
      }
    }
    
    // 查询任务
    if (lowerMsg.includes('查看') || lowerMsg.includes('查询') || lowerMsg.includes('我的任务')) {
      if (tasks.length === 0) {
        return '你目前没有待办任务。';
      }
      
      const completedTasks = tasks.filter(t => t.completed);
      const pendingTasks = tasks.filter(t => !t.completed);
      
      let response = `你目前有${tasks.length}个任务：\n`;
      if (pendingTasks.length > 0) {
        response += `\n待完成(${pendingTasks.length}个)：\n`;
        pendingTasks.forEach((task, index) => {
          response += `${index + 1}. ${task.title}\n`;
        });
      }
      
      if (completedTasks.length > 0) {
        response += `\n已完成(${completedTasks.length}个)：\n`;
        completedTasks.forEach((task, index) => {
          response += `${index + 1}. ${task.title}\n`;
        });
      }
      
      return response;
    }
    
    // 默认回复
    return '我理解了你的指令。你可以让我帮你添加、完成或删除任务，或者询问你的任务列表。';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // 模拟AI处理延迟
    setTimeout(() => {
      const aiResponse = processUserMessage(inputValue);
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
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
            <Cross2Icon />
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
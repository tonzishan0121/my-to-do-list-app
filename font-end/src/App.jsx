import React, { useState, useEffect, useRef } from 'react';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import TagFilter from './components/TagFilter';
import TagManager from './components/TagManager';
import StatsBar from './components/StatsBar';
import AIChat from './components/AIChat';
import AIChatGate from './components/AIChatGate';
import { PlusIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import './App.less';

const App = () => {
  // 从 localStorage 加载数据
  const loadFromLocalStorage = () => {
    const savedTasks = localStorage.getItem('tasks');
    const savedTags = localStorage.getItem('tags');
    return {
      tasks: savedTasks ? JSON.parse(savedTasks) : [],
      tags: savedTags ? JSON.parse(savedTags) : ['工作', '个人', '购物']
    }
  };

  const [data, setData] = useState(loadFromLocalStorage());
  const [filter, setFilter] = useState('全部');
  const [showTagManager, setShowTagManager] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const chatStreamRef = useRef(null);

  // 保存数据到 localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(data.tasks));
    localStorage.setItem('tags', JSON.stringify(data.tags));
  }, [data]);

  useEffect(() => {
    chatStreamRef.current = new WebSocket('ws://localhost:8080');
    const ws = chatStreamRef.current;
    ws.onopen = () => console.log(`WS: Connected`);
    ws.onClosed = () => console.log(`WS: Disconnected`);
    return () => {
      ws.close();
      chatStreamRef.current = null;
    };
  }, []);
  // 添加任务
  const addTask = (title, description, tag) => {
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title,
      description,
      tag,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  // 删除任务
  const deleteTask = (id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id)
    }));
  };

  // 切换任务完成状态
  const toggleTask = (id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  // 添加标签
  const addTag = (tag) => {
    if (!tag.trim() || data.tags.includes(tag)) return;
    setData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
  };

  // 删除标签
  const deleteTag = (tagToDelete) => {
    // 检查是否有任务使用该标签
    const tasksWithTag = data.tasks.some(task => task.tag === tagToDelete);

    if (tasksWithTag) {
      if (!window.confirm(`标签 "${tagToDelete}" 下还有任务，确定要删除吗？`)) {
        return;
      }

      // 同时删除使用该标签的任务
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.tag !== tagToDelete)
      }));
    }

    setData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  // 过滤任务
  const filteredTasks = filter === '全部'
    ? data.tasks
    : data.tasks.filter(task => task.tag === filter);

  // 统计信息
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(task => task.completed).length;

  // 处理密码验证成功
  const handlePasswordSuccess = () => {
    setIsUnlocked(true);
  };

  const onAddMessage =  async (message, callback) => {
    chatStreamRef.current.send(message);
    chatStreamRef.current.onmessage = (event) => callback(event.data);
  }; 
  // 如果未解锁，显示AI聊天门禁界面
  if (!isUnlocked) {
    return <AIChatGate onAddMessage={onAddMessage} onPasswordSuccess={handlePasswordSuccess} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>我的待办</h1>
        <div className="header-input-container">
          <TaskInput
            onAddTask={addTask}
            tags={data.tags}
          />
        </div>
      </header>

      <main className="app-main">
        <div className="filter-section">
          <TagFilter
            tags={data.tags}
            currentFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        <TaskList
          tasks={filteredTasks}
          onDeleteTask={deleteTask}
          onToggleTask={toggleTask}
        />
      </main>

      <footer className="app-footer">
        <StatsBar
          total={totalTasks}
          completed={completedTasks}
        />
        <div className="footer-actions">
          <button
            className="tag-manager-button"
            onClick={() => setShowTagManager(true)}
            aria-label="管理标签"
          >
            <PlusIcon className="icon" />
            管理标签
          </button>
          <button
            className="ai-chat-button"
            onClick={() => setShowAIChat(true)}
            aria-label="智能助手"
          >
            <ChatBubbleIcon className="icon" />
            智能助手
          </button>
        </div>
      </footer>

      {showTagManager && (
        <TagManager
          tags={data.tags}
          onAddTag={addTag}
          onDeleteTag={deleteTag}
          onClose={() => setShowTagManager(false)}
        />
      )}

      {showAIChat && (
        <AIChat
          tasks={data.tasks}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
};

export default App;
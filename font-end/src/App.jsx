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
  // 从 localStorage 加载标签数据
  const loadTagsFromLocalStorage = () => {
    const savedTags = localStorage.getItem('tags');
    return savedTags ? JSON.parse(savedTags) : ['工作', '个人', '购物'];
  };

  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState(loadTagsFromLocalStorage());
  const [filter, setFilter] = useState('全部');
  const [showTagManager, setShowTagManager] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const chatStreamRef = useRef(null);
  const shouldFetchTasksRef = useRef(true);
  
  const tasksFunc = () => {
    const apiHost = 'http://localhost:3000/api';
    return {
      getTasks: async () => {
        const response = await fetch(apiHost + '/tasks');
        const data = await response.json();
        return data.tasks || [];
      },
      addTask: async (title, description, tag) => {
        if (!title.trim()) return;

        const newTask = {
          id: Date.now(),
          content: title,
          description,
          category: tag,
          status: 'active',
          createdAt: Date.now(),
          deletedAt: null
        };
        const resp = await fetch(apiHost + '/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: newTask.content, description: newTask.description, category: tag })
        });
        if (!resp.ok) {
          return
        } 
        shouldFetchTasksRef.current = true;
      },
      deleteTask: async (taskId) => {
        const resp = await fetch(apiHost + '/tasks/' + taskId, {
          method: 'DELETE'
        });
        if (!resp.ok) return;
        shouldFetchTasksRef.current = true;
      },
      updateTask: async (taskId, updatedTask) => {
        const resp = await fetch(apiHost + '/tasks/' + taskId, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: updatedTask.content,
            description: updatedTask.description,
            category: updatedTask.category,
            status: updatedTask.status
          })
        });
        if (!resp.ok) return;
        shouldFetchTasksRef.current = true;
      },
    }
  }

  // 仅保存标签到 localStorage
  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (shouldFetchTasksRef.current) {
        const fetchedTasks = await tasksFunc().getTasks();
        setTasks(fetchedTasks);
        shouldFetchTasksRef.current = false;
      }
    };

    fetchTasks();

    chatStreamRef.current = new WebSocket('ws://localhost:8080');
    const ws = chatStreamRef.current;
    ws.onopen = () => console.log(`WS: Connected`);
    ws.onclose = () => console.log(`WS: Disconnected`);
    return () => {
      ws.close();
      chatStreamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (shouldFetchTasksRef.current) {
        const fetchedTasks = await tasksFunc().getTasks();
        setTasks(fetchedTasks);
        shouldFetchTasksRef.current = false;
      }
    };

    fetchTasks();
  });

  // 切换任务完成状态
  const toggleTask = async (id, task) => {
    if (task.status === 'completed') {
      await tasksFunc().updateTask(task.id, { ...task, status: 'active' });
    } else {
      await tasksFunc().updateTask(task.id, { ...task, status: 'completed' });
    }
  };

  // 添加标签
  const addTag = (tag) => {
    if (!tag.trim() || tags.includes(tag)) return;
    setTags(prev => [...prev, tag]);
  };

  // 删除标签
  const deleteTag = (tagToDelete) => {
    // 检查是否有任务使用该标签
    const tasksWithTag = tasks.some(task => task.category === tagToDelete);

    if (tasksWithTag) {
      if (!window.confirm(`标签 "${tagToDelete}" 下还有任务，确定要删除吗？`)) {
        return;
      }

      // 同时删除使用该标签的任务
      setTasks(prev => prev.filter(task => task.category !== tagToDelete));
    }

    setTags(prev => prev.filter(tag => tag !== tagToDelete));
  };

  // 过滤任务
  const filteredTasks = filter === '全部'
    ? tasks
    : tasks.filter(task => task.category === filter);

  // 统计信息
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  // 处理密码验证成功
  const handlePasswordSuccess = () => {
    setIsUnlocked(true);
  };

  /**
   * 发送消息，并用回调处理返回的消息
   * @param {string} message 
   * @param {(param:string)=>void} callback 
   */
  const onAddMessage = async (message, callback) => {
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
            onAddTask={tasksFunc().addTask}
            tags={tags}
          />
        </div>
      </header>

      <main className="app-main">
        <div className="filter-section">
          <TagFilter
            tags={tags}
            currentFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        <TaskList
          tasks={filteredTasks}
          onDeleteTask={tasksFunc().deleteTask}
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
          tags={tags}
          onAddTag={addTag}
          onDeleteTag={deleteTag}
          onClose={() => setShowTagManager(false)}
        />
      )}

      {showAIChat && (
        <AIChat
          onAddMessage={onAddMessage}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
};

export default App;
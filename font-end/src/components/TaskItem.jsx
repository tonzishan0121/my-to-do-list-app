import React, { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import './TaskItem.less';

const TaskItem = ({ task, isSelected, onSelect, onDeselect, onDelete, onToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  
  const handleDelete = () => {
    onDelete(task.id);
  };
  
  const handleToggle = () => {
    onToggle(task.id, task);
  };
  
  const handleSelect = () => {
    onSelect();
  };
  
  const handleDeselect = () => {
    onDeselect();
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  // 格式化时间显示
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // 如果是今天，只显示时间
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // 如果是今年，显示月日和时间
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // 其他情况显示完整日期和时间
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div 
      className={`task-item ${task.completed ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleSelect}
      onBlur={handleDeselect}
      tabIndex={0}
      aria-selected={isSelected}
    >
      <Checkbox.Root 
        className="task-checkbox" 
        checked={task.completed}
        onCheckedChange={handleToggle}
        aria-label={task.completed ? "标记为未完成" : "标记为完成"}
      >
        <Checkbox.Indicator className="task-checkbox-indicator">
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>
      
      <div className="task-content">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="edit-input"
            autoFocus
          />
        ) : (
          <div className="task-text" onDoubleClick={handleEdit}>
            <div className="task-title">{task.title}</div>
            {task.description && (
              <div className="task-description">{task.description}</div>
            )}
            <div className="task-meta">
              <div className="task-tag">{task.tag}</div>
              <div className="task-time">{formatTime(task.createdAt)}</div>
            </div>
          </div>
        )}
      </div>
      
      <button 
        className="delete-button" 
        onClick={handleDelete}
        aria-label="删除任务"
      >
        <Cross2Icon />
      </button>
    </div>
  );
};

export default TaskItem;
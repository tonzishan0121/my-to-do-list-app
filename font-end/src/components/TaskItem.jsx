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
    onToggle(task.id);
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
    // 在实际应用中，这里应该调用更新任务的函数
    // 为简化起见，我们只切换编辑状态
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
            <div className="task-tag">{task.tag}</div>
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
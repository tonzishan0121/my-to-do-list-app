import React, { useState, useRef } from 'react';
import { PlusIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import './TaskInput.less';

const TaskInput = ({ onAddTask, tags }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [selectedTag, setSelectedTag] = useState(tags[0] || '');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title, description, selectedTag);
      setTitle('');
      setDescription('');
      setShowDescription(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  // 根据标签名称返回对应的颜色类
  const getTagColorClass = (tag) => {
    const tagColors = {
      '购物': 'tag-shopping',
      '工作': 'tag-work',
      '个人': 'tag-personal',
      '学习': 'tag-study',
      '健康': 'tag-health',
      '家庭': 'tag-family'
    };
    return tagColors[tag] || 'tag-default';
  };

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加新任务..."
          className="title-input"
          aria-label="任务标题"
        />
        
        <Select.Root value={selectedTag} onValueChange={setSelectedTag}>
          <Select.Trigger className={`tag-select-trigger ${getTagColorClass(selectedTag)}`} aria-label="选择标签">
            <Select.Value />
            <Select.Icon>
              <ChevronDownIcon className="select-icon" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="tag-select-content" position="popper" sideOffset={5}>
              <Select.Viewport>
                {tags.map(tag => (
                  <Select.Item 
                    key={tag} 
                    value={tag} 
                    className={`tag-select-item ${getTagColorClass(tag)}`}
                  >
                    <Select.ItemText>{tag}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        
        <button type="submit" className="add-button" aria-label="添加任务">
          <PlusIcon />
        </button>
      </div>
      
      {showDescription && (
        <div className="description-section">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="添加描述..."
            className="description-input"
            rows="2"
            aria-label="任务描述"
          />
        </div>
      )}
      
      <button 
        type="button" 
        className="toggle-description"
        onClick={() => setShowDescription(!showDescription)}
        aria-expanded={showDescription}
      >
        {showDescription ? '收起描述' : '添加描述'}
      </button>
    </form>
  );
};

export default TaskInput;
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import './TagManager.less';

const TagManager = ({ tags, onAddTag, onDeleteTag, onClose }) => {
  const [newTag, setNewTag] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };
  
  const handleDeleteTag = (tag) => {
    onDeleteTag(tag);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };
  
  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">管理标签</Dialog.Title>
          
          <div className="add-tag-section">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入新标签名称"
              className="tag-input"
              aria-label="新标签名称"
            />
            <button 
              className="add-tag-button" 
              onClick={handleAddTag}
              aria-label="添加标签"
            >
              添加
            </button>
          </div>
          
          <div className="tags-list">
            <h3>现有标签</h3>
            {tags.length === 0 ? (
              <p className="no-tags">暂无标签</p>
            ) : (
              <div className="tags-grid">
                {tags.map(tag => (
                  <div key={tag} className="tag-item">
                    <span className="tag-name">{tag}</span>
                    <button 
                      className="delete-tag-button" 
                      onClick={() => handleDeleteTag(tag)}
                      aria-label={`删除标签 ${tag}`}
                    >
                      <Cross2Icon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Dialog.Close asChild>
            <button className="close-button" aria-label="关闭">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TagManager;
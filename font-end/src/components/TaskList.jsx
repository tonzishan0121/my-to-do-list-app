import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import './TaskList.less';

const TaskList = ({ tasks, onDeleteTask, onToggleTask }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedTaskId && e.key === 'Delete') {
        onDeleteTask(selectedTaskId);
        setSelectedTaskId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId, onDeleteTask]);

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>暂无任务</p>
        </div>
      ) : (
        tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={task.id === selectedTaskId}
            onSelect={() => setSelectedTaskId(task.id)}
            onDeselect={() => setSelectedTaskId(null)}
            onDelete={onDeleteTask}
            onToggle={onToggleTask}
          />
        ))
      )}
    </div>
  );
};

export default TaskList;
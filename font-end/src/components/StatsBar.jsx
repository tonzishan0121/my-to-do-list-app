import React from 'react';
import './StatsBar.less';

const StatsBar = ({ total, completed }) => {
  return (
    <div className="stats-bar">
      <span className="stats-text">
        共 {total} 项任务，{completed} 项已完成
      </span>
    </div>
  );
};

export default StatsBar;
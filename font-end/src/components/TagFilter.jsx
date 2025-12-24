import React from 'react';
import './TagFilter.less';

const TagFilter = ({ tags, currentFilter, onFilterChange }) => {
  return (
    <div className="tag-filter">
      <button
        className={`filter-button ${currentFilter === '全部' ? 'active' : ''}`}
        onClick={() => onFilterChange('全部')}
      >
        全部
      </button>
      
      {tags.map(tag => (
        <button
          key={tag}
          className={`filter-button ${currentFilter === tag ? 'active' : ''}`}
          onClick={() => onFilterChange(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
import React from 'react';
import PropTypes from 'prop-types';

const ViewModeSwitcher = ({ viewMode, onViewModeChange, options = [] }) => {
  const defaultOptions = [
    { value: 'grid', label: '그리드 뷰' },
    { value: 'list', label: '리스트 뷰' }
  ];

  const viewOptions = options.length > 0 ? options : defaultOptions;

  return (
    <div className="flex items-center gap-2 mb-4">
      {viewOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onViewModeChange(option.value)}
          className={`px-3 py-1 text-sm rounded ${
            viewMode === option.value 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

ViewModeSwitcher.propTypes = {
  viewMode: PropTypes.string.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  }))
};

export default ViewModeSwitcher;
import React from 'react';
import PropTypes from 'prop-types';

const TimeFilter = ({ 
  timeFilter, 
  onTimeFilterChange, 
  filters = null,
  className = '' 
}) => {
  // 기본 시간 필터 옵션
  const defaultFilters = [
    { key: '1D', label: '1일', days: 1 },
    { key: '1W', label: '1주', days: 7 },
    { key: '1M', label: '1개월', days: 30 },
    { key: '1Y', label: '1년', days: 365 },
    { key: 'ALL', label: '전체', days: null }
  ];

  const timeFilters = filters || defaultFilters;

  return (
    <div className={`flex bg-slate-700 rounded-lg p-1 ${className}`}>
      {timeFilters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onTimeFilterChange(filter.key)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
            timeFilter === filter.key
              ? 'bg-blue-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

TimeFilter.propTypes = {
  timeFilter: PropTypes.string.isRequired,
  onTimeFilterChange: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    days: PropTypes.number
  })),
  className: PropTypes.string
};

TimeFilter.defaultProps = {
  filters: null,
  className: ''
};

export default TimeFilter;
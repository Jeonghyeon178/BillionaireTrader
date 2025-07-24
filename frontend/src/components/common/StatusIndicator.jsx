import React from 'react';
import PropTypes from 'prop-types';

const StatusIndicator = ({ 
  status, 
  icon, 
  showPulse = false,
  size = 'sm' 
}) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'success':
      case 'enabled':
        return 'bg-green-400';
      case 'error':
      case 'disabled':
        return 'bg-red-400';
      case 'warning':
      case 'unknown':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center justify-between mb-2">
      {icon && <span className="text-2xl">{icon}</span>}
      <div className={`${sizeClasses[size]} rounded-full ${getStatusClasses()} ${showPulse ? 'animate-pulse' : ''}`}></div>
    </div>
  );
};

StatusIndicator.propTypes = {
  status: PropTypes.oneOf(['success', 'enabled', 'error', 'disabled', 'warning', 'unknown']).isRequired,
  icon: PropTypes.string,
  showPulse: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default StatusIndicator;
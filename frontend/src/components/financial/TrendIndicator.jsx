import React from 'react';
import PropTypes from 'prop-types';

const TrendIndicator = ({ value, showIcon = true, size = 'md' }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getColorClasses = () => {
    if (isPositive) return 'text-green-600 bg-green-50';
    if (isNegative) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getIcon = () => {
    if (isPositive) return '↗';
    if (isNegative) return '↘';
    return '→';
  };

  const formatValue = () => {
    const sign = isPositive ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium font-mono ${getSizeClasses()} ${getColorClasses()}`}>
      {showIcon && (
        <span className="text-xs">
          {getIcon()}
        </span>
      )}
      {formatValue()}
    </span>
  );
};

TrendIndicator.propTypes = {
  value: PropTypes.number.isRequired,
  showIcon: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default TrendIndicator;
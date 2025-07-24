import React from 'react';
import PropTypes from 'prop-types';

const CustomTooltip = ({ 
  active, 
  payload, 
  label, 
  baselineData = [],
  showVolume = true,
  formatValue = null,
  formatLabel = null,
  className = ''
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const basePrice = baselineData.length > 0 ? baselineData[0]?.price : 0;
  const isPositive = data.payload.price >= basePrice;

  const defaultFormatValue = (value) => {
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  const defaultFormatLabel = (label) => {
    return label;
  };

  const valueFormatter = formatValue || defaultFormatValue;
  const labelFormatter = formatLabel || defaultFormatLabel;

  return (
    <div className={`bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl ${className}`}>
      <p className="text-slate-300 text-sm mb-2">
        {labelFormatter(label)}
      </p>
      
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white font-bold">
          {valueFormatter(data.value)}
        </span>
        <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '▲' : '▼'}
        </span>
      </div>
      
      {showVolume && data.payload.volume && (
        <p className="text-slate-400 text-xs">
          거래량: {data.payload.volume.toLocaleString()}
        </p>
      )}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    payload: PropTypes.shape({
      price: PropTypes.number,
      volume: PropTypes.number
    })
  })),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  baselineData: PropTypes.arrayOf(PropTypes.shape({
    price: PropTypes.number
  })),
  showVolume: PropTypes.bool,
  formatValue: PropTypes.func,
  formatLabel: PropTypes.func,
  className: PropTypes.string
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  label: '',
  baselineData: [],
  showVolume: true,
  formatValue: null,
  formatLabel: null,
  className: ''
};

export default CustomTooltip;
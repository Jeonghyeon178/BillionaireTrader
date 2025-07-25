import React from 'react';
import PropTypes from 'prop-types';

const MetricDisplay = ({ 
  title,
  value,
  subtitle = '',
  valueColor = 'text-white',
  titleColor = 'text-slate-300',
  subtitleColor = 'text-slate-400',
  badge = null,
  icon = null
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex items-center gap-2">
          {badge}
        </div>
      </div>
      
      <h3 className={`text-sm font-medium mb-1 ${titleColor}`}>
        {title}
      </h3>
      
      <p className={`text-xl font-semibold font-mono ${valueColor}`}>
        {value}
      </p>
      
      {subtitle && (
        <p className={`text-xs mt-1 ${subtitleColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

MetricDisplay.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  valueColor: PropTypes.string,
  titleColor: PropTypes.string,
  subtitleColor: PropTypes.string,
  badge: PropTypes.node,
  icon: PropTypes.string
};

export default MetricDisplay;
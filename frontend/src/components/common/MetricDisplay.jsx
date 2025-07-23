import React from 'react';

const MetricDisplay = ({ 
  title,
  value,
  subtitle = '',
  valueColor = 'text-white',
  titleColor = 'text-slate-300',
  subtitleColor = 'text-slate-400',
  badge = null,
  icon = null,
  trend = null
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {trend === 'up' ? '↗️' : '↘️'}
            </span>
          )}
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

export default MetricDisplay;
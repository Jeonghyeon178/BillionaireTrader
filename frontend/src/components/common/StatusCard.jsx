import React from 'react';

const StatusCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  badge,
  variant = 'default',
  className = '',
  children
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'ring-1 ring-green-500';
      case 'error':
        return 'ring-1 ring-red-500';
      case 'warning':
        return 'ring-1 ring-yellow-500';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600 ${getVariantClasses()} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {badge && badge}
      </div>
      <h3 className="text-slate-300 text-sm font-medium mb-1">{title}</h3>
      <div className="text-xl font-semibold font-mono text-white mb-1">
        {value}
      </div>
      {subtitle && (
        <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
      )}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default StatusCard;
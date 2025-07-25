import React from 'react';
import PropTypes from 'prop-types';

const BaseCard = ({ 
  variant = 'default',
  theme = 'dark',
  className = '',
  onClick,
  children,
  
  index,
  rate,
  value,
    
  icon,
  title,
  subtitle,
  badge,
  
  ringColor = '',
  
  ...props 
}) => {
  const getBaseClasses = () => {
    switch (theme) {
      case 'light':
        return "bg-white shadow-xl rounded-2xl bg-clip-border";
      case 'dark':
      default:
        return "bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600";
    }
  };

  const getRingClasses = () => {
    if (ringColor) return `ring-1 ${ringColor}`;
    if (variant === 'success') return 'ring-1 ring-green-500';
    if (variant === 'error') return 'ring-1 ring-red-500';
    if (variant === 'warning') return 'ring-1 ring-yellow-500';
    return '';
  };

  const renderFinancialContent = () => (
    <div className="flex-auto p-4">
      <div className="flex flex-row -mx-3">
        <div className="flex-none w-2/3 max-w-full px-3">
          <div>
            <p className="mb-0 text-sm font-semibold leading-normal uppercase text-slate-300">
              {index}
            </p>
            <h5 className="mb-2 font-bold text-white">{value}</h5>
            <p className="mb-0">
              <span
                className={`mx-1 text-sm font-bold leading-normal ${
                  rate > 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {rate > 0 ? "+" : ""}
                {rate}%
              </span>
              <span className="text-slate-400 text-sm">since yesterday</span>
            </p>
          </div>
        </div>
        <div className="px-3 text-right basis-1/3">
          <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500">
            <i className="ni leading-none ni-money-coins text-lg relative top-3.5 text-white"></i>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatusContent = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {badge}
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

  const renderDefaultContent = () => (
    <div className="p-4">
      {children}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'financial':
        return renderFinancialContent();
      case 'status':
        return renderStatusContent();
      case 'metric':
      case 'default':
      default:
        return children ? renderDefaultContent() : null;
    }
  };

  const wrapperClasses = variant === 'financial' 
    ? "w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4"
    : "";

  const isInteractive = onClick !== undefined;

  const cardElement = isInteractive ? (
    <button
      className={`${getBaseClasses()} ${getRingClasses()} ${className} w-full text-left`}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </button>
  ) : (
    <div 
      className={`${getBaseClasses()} ${getRingClasses()} ${className}`}
      {...props}
    >
      {renderContent()}
    </div>
  );

  if (variant === 'financial') {
    return (
      <div className={wrapperClasses}>
        {cardElement}
      </div>
    );
  }

  return cardElement;
};

BaseCard.propTypes = {
  variant: PropTypes.oneOf(['default', 'financial', 'status', 'metric', 'success', 'error', 'warning']),
  theme: PropTypes.oneOf(['light', 'dark']),
  
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  
  index: PropTypes.string,
  rate: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    
  icon: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  badge: PropTypes.node,
  
  ringColor: PropTypes.string
};


export default BaseCard;
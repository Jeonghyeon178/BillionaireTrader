import React from 'react';

const ActionButton = ({
  children,
  onClick,
  variant = 'secondary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/50';
      case 'success':
        return 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/50';
      case 'danger':
        return 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/50';
      case 'secondary':
      default:
        return 'bg-slate-600/50 hover:bg-slate-600 text-slate-300 border-slate-500';
    }
  };

  const baseClasses = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border";
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${getVariantClasses()} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '⏳ 처리중...' : children}
    </button>
  );
};

export default ActionButton;
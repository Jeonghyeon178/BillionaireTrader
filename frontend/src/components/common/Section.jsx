import React from 'react';
import PropTypes from 'prop-types';

const Section = ({ 
  title, 
  subtitle, 
  icon, 
  children, 
  className = '', 
  headerClassName = '',
  contentClassName = '',
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'bg-slate-800 border border-slate-600 rounded-xl p-6';
      case 'transparent':
        return 'bg-transparent';
      default:
        return 'mb-6';
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      {title && (
        <div className={`mb-4 ${headerClassName}`}>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {title}
            {subtitle && (
              <span className="text-sm text-slate-400 font-normal">{subtitle}</span>
            )}
          </h2>
        </div>
      )}
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  );
};

Section.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'card', 'transparent'])
};

export default Section;
import React from 'react';
import PropTypes from 'prop-types';

const Container = ({ children, className = '', maxWidth = '1600px' }) => {
  const maxWidthClass = {
    '1200px': 'max-w-6xl',
    '1400px': 'max-w-7xl',
    '1600px': 'max-w-[1600px]',
    'full': 'max-w-full'
  };

  return (
    <div className={`${maxWidthClass[maxWidth] || 'max-w-[1600px]'} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  maxWidth: PropTypes.oneOf(['1200px', '1400px', '1600px', 'full'])
};


export default Container;
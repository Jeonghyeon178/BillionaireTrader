import React from 'react';

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

export default Container;
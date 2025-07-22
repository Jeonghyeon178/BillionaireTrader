import React from 'react';

const PriceDisplay = ({ 
  value, 
  currency = 'KRW', 
  size = 'md', 
  trend,
  showCurrency = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-lg';
      case 'lg': return 'text-3xl';
      case 'xl': return 'text-4xl';
      default: return 'text-2xl';
    }
  };

  const getTrendColorClasses = () => {
    if (trend > 0) return 'text-green-700';
    if (trend < 0) return 'text-red-700';
    return 'text-gray-800';
  };

  const formatPrice = () => {
    if (currency === 'KRW') {
      return new Intl.NumberFormat('ko-KR', {
        style: showCurrency ? 'currency' : 'decimal',
        currency: 'KRW',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: showCurrency ? 'currency' : 'decimal',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }

    // 기본적으로는 소수점 2자리까지 표시
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <span 
      className={`font-mono font-bold ${getSizeClasses()} ${trend !== undefined ? getTrendColorClasses() : 'text-gray-800'}`}
    >
      {formatPrice()}
    </span>
  );
};

export default PriceDisplay;
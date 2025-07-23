import React from 'react';
import CompactFinancialCard from './CompactFinancialCard';
import StandardFinancialCard from './StandardFinancialCard';

const FinancialCard = ({ 
  ticker,
  price,
  rate,
  chartData = [],
  onClick,
  isActive = false,
  size = 'md'
}) => {
  // size가 'compact'인 경우 CompactFinancialCard 사용
  if (size === 'compact') {
    return (
      <CompactFinancialCard
        ticker={ticker}
        price={price}
        rate={rate}
        chartData={chartData}
        onClick={onClick}
        isActive={isActive}
      />
    );
  }

  // 그 외의 경우 StandardFinancialCard 사용
  return (
    <StandardFinancialCard
      ticker={ticker}
      price={price}
      rate={rate}
      chartData={chartData}
      onClick={onClick}
      isActive={isActive}
      size={size}
    />
  );
};

export default FinancialCard;
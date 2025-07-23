// 포트폴리오 계산 유틸리티 함수들

export const calculatePortfolioMetrics = (portfolioData) => {
  const {
    totalValue = 0,
    availableCash = 0,
    totalReturn = 0,
    todayReturn = 0,
    yearlyGoal = 15 // 기본 연간 목표 수익률 15%
  } = portfolioData;

  return {
    totalValue,
    availableCash,
    totalReturn,
    totalGain: totalValue * (totalReturn / 100),
    todayChange: todayReturn,
    todayGain: totalValue * (todayReturn / 100),
    goalProgress: (totalReturn / yearlyGoal) * 100
  };
};

export const formatCurrency = (amount, unit = '원') => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억${unit}`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만${unit}`;
  } else {
    return `${amount.toLocaleString('ko-KR')}${unit}`;
  }
};

export const formatPercentage = (value, showSign = true) => {
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const getPerformanceColor = (value) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const createDefaultAssetAllocation = (portfolioData) => {
  const { totalValue = 125430000, availableCash = 24570000 } = portfolioData;
  
  return [
    { name: '한국 주식', value: Math.floor(totalValue * 0.36) },
    { name: '미국 주식', value: Math.floor(totalValue * 0.28) },
    { name: '채권', value: Math.floor(totalValue * 0.16) },
    { name: '현금', value: availableCash },
    { name: '기타', value: totalValue - Math.floor(totalValue * 0.8) - availableCash }
  ];
};

export const createDefaultHoldings = () => {
  return [
    { symbol: 'AAPL', name: 'Apple Inc.', value: 15234000, change: 2.3 },
    { symbol: 'TSLA', name: 'Tesla Inc.', value: 12456000, change: -1.1 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', value: 11789000, change: 0.8 },
    { symbol: '삼성전자', name: 'Samsung Electronics', value: 9876000, change: 1.5 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', value: 8654000, change: 3.2 }
  ];
};
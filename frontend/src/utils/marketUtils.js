// 마켓 관련 유틸리티 함수들

export const getMarketSentiment = (averageChange) => {
  if (averageChange > 1) return { text: '강세장', color: 'text-green-600', bg: 'bg-green-50', icon: '📈' };
  if (averageChange < -1) return { text: '약세장', color: 'text-red-600', bg: 'bg-red-50', icon: '📉' };
  return { text: '보합세', color: 'text-gray-600', bg: 'bg-gray-50', icon: '📊' };
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTickerIcon = (ticker) => {
  const iconMap = {
    'COMP': '🏢',
    '.DJI': '📈',
    'SPX': '🌟',
    'FX@KRW': '💱'
  };
  return iconMap[ticker] || '📊';
};

export const getTickerName = (ticker) => {
  const nameMap = {
    'COMP': 'NASDAQ',
    '.DJI': 'DOW JONES',
    'SPX': 'S&P 500',
    'FX@KRW': 'USD/KRW'
  };
  return nameMap[ticker] || ticker;
};

export const getIndexNameMap = () => ({
  'COMP': 'nasdaq',
  '.DJI': 'dow-jones',
  'SPX': 'snp500',
  'FX@KRW': 'usd-krw'
});

export const calculateMarketStats = (marketData) => {
  const averageChange = marketData.reduce((sum, item) => sum + item.rate, 0) / marketData.length;
  const positiveCount = marketData.filter(item => item.rate > 0).length;
  
  return {
    averageChange,
    positiveCount,
    totalCount: marketData.length
  };
};

export const formatPrice = (price, decimals = 2) => {
  return price.toFixed(decimals);
};

export const formatPercentage = (rate) => {
  return `${rate >= 0 ? '+' : ''}${rate.toFixed(2)}%`;
};

export const getPriceChangeColor = (change) => {
  return change >= 0 ? 'text-green-600' : 'text-red-600';
};
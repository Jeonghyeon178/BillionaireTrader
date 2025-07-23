// 금융 관련 유틸리티 함수들

export const getIndexIcon = (ticker) => {
  const icons = {
    'COMP': '🏢',      // NASDAQ
    '.DJI': '📈',      // Dow Jones
    'SPX': '🌟',       // S&P 500
    'FX@KRW': '💱'     // USD/KRW
  };
  return icons[ticker] || '📊';
};

export const getIndexName = (ticker) => {
  const names = {
    'COMP': 'NASDAQ',
    '.DJI': 'DOW JONES',
    'SPX': 'S&P 500',
    'FX@KRW': 'USD/KRW'
  };
  return names[ticker] || ticker;
};

export const formatLastUpdate = () => {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const calculateDayRange = (chartData) => {
  if (chartData.length === 0) return 'N/A';
  
  const prices = chartData.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return `${min.toFixed(2)} - ${max.toFixed(2)}`;
};

export const formatFinancialPrice = (price, currency = 'USD', decimals = 2) => {
  if (currency === 'KRW') {
    return `₩${price.toLocaleString('ko-KR', { minimumFractionDigits: decimals })}`;
  }
  return `$${price.toFixed(decimals)}`;
};

export const getCardSizeClasses = (size) => {
  switch (size) {
    case 'compact': return 'p-3';
    case 'sm': return 'p-3';
    case 'lg': return 'p-6';
    default: return 'p-4';
  }
};

export const getTrendColor = (rate) => {
  return rate >= 0 ? 'green' : 'red';
};

export const getTrendColorClasses = (rate, type = 'text') => {
  const color = getTrendColor(rate);
  
  const colorClasses = {
    text: {
      green: 'text-green-600',
      red: 'text-red-600'
    },
    bg: {
      green: 'bg-green-500',
      red: 'bg-red-500'
    },
    bgOpacity: {
      green: 'bg-green-500/20',
      red: 'bg-red-500/20'
    }
  };
  
  return colorClasses[type]?.[color] || '';
};

export const formatTrendValue = (rate, showSign = true) => {
  const sign = showSign && rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(2)}%`;
};
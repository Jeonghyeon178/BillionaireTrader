// 마켓 관련 특수 유틸리티 함수들
// 공통 함수들은 commonUtils.js로 이동됨

// Temporarily inline functions to fix circular dependency

// Ticker configuration
const TICKER_CONFIG = {
  'COMP': { icon: '🏢', name: 'NASDAQ' },
  '.DJI': { icon: '📈', name: 'DOW JONES' },
  'SPX': { icon: '🌟', name: 'S&P 500' },
  'FX@KRW': { icon: '💱', name: 'USD/KRW' }
};

const getTickerIcon = (ticker) => TICKER_CONFIG[ticker]?.icon || '📊';
const getTickerName = (ticker) => TICKER_CONFIG[ticker]?.name || ticker;
const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  const numValue = Number(value);
  return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(decimals)}%`;
};
const getTrendColor = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'text-gray-400';
  const numValue = Number(value);
  return numValue >= 0 ? 'text-green-400' : 'text-red-400';
};

// 레거시 호환성을 위한 별칭
export { getTickerIcon, getTickerName };

// 마켓 센티먼트 분석 (마켓 특화 기능)
export const getMarketSentiment = (averageChange) => {
  if (averageChange > 1) return { text: '강세장', color: 'text-green-600', bg: 'bg-green-50', icon: '📈' };
  if (averageChange < -1) return { text: '약세장', color: 'text-red-600', bg: 'bg-red-50', icon: '📉' };
  return { text: '보합세', color: 'text-gray-600', bg: 'bg-gray-50', icon: '📊' };
};

// 마켓 특화 시간 포맷
export const formatTime = (timestamp) => {
  if (!timestamp) return '-';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 인덱스 이름 매핑 (API 엔드포인트용)
export const getIndexNameMap = () => ({
  'COMP': 'nasdaq',
  '.DJI': 'dow-jones',
  'SPX': 'snp500',
  'FX@KRW': 'usd-krw'
});

// 마켓 통계 계산
export const calculateMarketStats = (marketData) => {
  if (!marketData || !Array.isArray(marketData) || marketData.length === 0) {
    return {
      averageChange: 0,
      positiveCount: 0,
      totalCount: 0
    };
  }
  
  const validData = marketData.filter(item => 
    item && typeof item.rate === 'number' && !isNaN(item.rate)
  );
  
  if (validData.length === 0) {
    return {
      averageChange: 0,
      positiveCount: 0,
      totalCount: marketData.length
    };
  }
  
  const averageChange = validData.reduce((sum, item) => sum + item.rate, 0) / validData.length;
  const positiveCount = validData.filter(item => item.rate > 0).length;
  
  return {
    averageChange,
    positiveCount,
    totalCount: marketData.length
  };
};

// 레거시 호환성을 위한 별칭들
export const formatPrice = (price, decimals = 2) => {
  if (price === null || price === undefined || isNaN(price)) return '-';
  return Number(price).toFixed(decimals);
};

export { formatPercentage };

export const getPriceChangeColor = (change) => {
  if (change === null || change === undefined || isNaN(change)) return 'text-gray-400';
  const numChange = Number(change);
  return numChange >= 0 ? 'text-green-600' : 'text-red-600';
};
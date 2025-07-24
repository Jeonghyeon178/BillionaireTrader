// 금융 관련 특수 유틸리티 함수들
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

// 레거시 지원을 위한 별칭 (점진적 마이그레이션용)
export const getIndexIcon = getTickerIcon;
export const getIndexName = getTickerName;

// 마지막 업데이트 시간 포맷 (금융 특화)
export const formatLastUpdate = () => {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 일일 가격 범위 계산 (차트 데이터 특화)
export const calculateDayRange = (chartData) => {
  if (!chartData || chartData.length === 0) return 'N/A';
  
  const prices = chartData.map(d => d.price).filter(p => p !== null && p !== undefined);
  if (prices.length === 0) return 'N/A';
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return `${min.toFixed(2)} - ${max.toFixed(2)}`;
};

// 금융 가격 포맷 (특수 통화 지원)
export const formatFinancialPrice = (price, currency = 'USD', decimals = 2) => {
  if (price === null || price === undefined || isNaN(price)) return '-';
  
  const numPrice = Number(price);
  
  if (currency === 'KRW') {
    return `₩${numPrice.toLocaleString('ko-KR', { minimumFractionDigits: decimals })}`;
  }
  return `$${numPrice.toFixed(decimals)}`;
};

// 카드 크기 클래스 (UI 특화)
export const getCardSizeClasses = (size) => {
  switch (size) {
    case 'compact': return 'p-3';
    case 'sm': return 'p-3';
    case 'lg': return 'p-6';
    default: return 'p-4';
  }
};

// 금융 특화 트렌드 컬러 (더 세분화된 스타일)
export const getFinancialTrendColorClasses = (rate, type = 'text') => {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return type === 'text' ? 'text-gray-400' : 'bg-gray-400';
  }
  
  const numRate = Number(rate);
  const isPositive = numRate >= 0;
  
  const colorClasses = {
    text: isPositive ? 'text-green-600' : 'text-red-600',
    bg: isPositive ? 'bg-green-500' : 'bg-red-500',
    bgOpacity: isPositive ? 'bg-green-500/20' : 'bg-red-500/20',
    ring: isPositive ? 'ring-green-500' : 'ring-red-500'
  };
  
  return colorClasses[type] || colorClasses.text;
};

// 금융 트렌드 값 포맷
export const formatTrendValue = (rate, showSign = true) => {
  if (rate === null || rate === undefined || isNaN(rate)) return '-';
  
  const numRate = Number(rate);
  const sign = showSign && numRate >= 0 ? '+' : '';
  return `${sign}${numRate.toFixed(2)}%`;
};

// 레거시 호환성을 위한 기본 트렌드 함수들
export const getTrendColor = (rate) => {
  if (rate === null || rate === undefined || isNaN(rate)) return 'gray';
  return Number(rate) >= 0 ? 'green' : 'red';
};

export const getTrendColorClasses = (rate, type = 'text') => {
  return getFinancialTrendColorClasses(rate, type);
};
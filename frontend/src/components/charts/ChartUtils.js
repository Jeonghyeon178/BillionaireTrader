// 차트 관련 유틸리티 함수들

// 티커별 기준 가격
export const getBasePrice = (ticker) => {
  const basePrices = {
    'COMP': 20000,
    '.DJI': 44000,
    'SPX': 6000,
    'FX@KRW': 1300
  };
  return basePrices[ticker] || 10000;
};

// 티커 이름 매핑
export const getTickerName = (ticker) => {
  const names = {
    'COMP': 'NASDAQ',
    '.DJI': 'DOW JONES',
    'SPX': 'S&P 500',
    'FX@KRW': 'USD/KRW'
  };
  return names[ticker] || ticker;
};

// 차트 색상 결정
export const getChartColor = (data) => {
  if (data.length === 0) return '#3b82f6';
  
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  return lastPrice >= firstPrice ? '#22c55e' : '#ef4444'; // 상승: 초록, 하락: 빨강
};

// Y축 범위 계산
export const getYAxisDomain = (data) => {
  if (data.length === 0) return ['auto', 'auto'];
  
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // 변동폭이 작을 때 더 좁은 범위로 설정
  const padding = Math.max(priceRange * 0.1, maxPrice * 0.01); // 최소 1% 패딩
  
  return [
    Math.max(0, minPrice - padding), // 음수 방지
    maxPrice + padding
  ];
};

// Y축 포맷터
export const formatYAxisValue = (value) => {
  if (value >= 10000) return `${(value/10000).toFixed(1)}만`;
  if (value >= 1000) return `${(value/1000).toFixed(1)}천`;
  return value.toFixed(0);
};

// X축 포맷터
export const formatXAxisValue = (value, timeFilter) => {
  const date = new Date(value);
  
  switch (timeFilter) {
    case '1D':
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case '1W':
    case '1M':
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    default:
      return date.toLocaleDateString('ko-KR', { 
        year: '2-digit', 
        month: 'short' 
      });
  }
};

// 시간 필터에 따른 틱 개수
export const getTickCount = (timeFilter) => {
  const tickCounts = {
    '1D': 6,
    '1W': 7,
    '1M': 8,
    '1Y': 12,
    'ALL': 10
  };
  return tickCounts[timeFilter] || 8;
};

// 데이터 필터링
export const filterDataByTimeRange = (data, timeFilter, timeFilters) => {
  if (!data || data.length === 0) {
    return [];
  }

  const filterConfig = timeFilters.find(f => f.key === timeFilter);
  
  // '전체' 옵션인 경우 모든 데이터 표시
  if (timeFilter === 'ALL' || !filterConfig || filterConfig.days === null) {
    return data;
  }

  const days = filterConfig.days;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return data.filter(item => {
    const itemDate = new Date(item.date || item.timestamp);
    return itemDate >= cutoffDate;
  });
};

// 샘플 데이터 생성 (개발/테스트용)
export const generateSampleData = (ticker, timeFilter, timeFilters) => {
  const data = [];
  const days = timeFilters.find(f => f.key === timeFilter)?.days || 30;
  const basePrice = getBasePrice(ticker);
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // 랜덤한 가격 변동 생성
    const randomChange = (Math.random() - 0.5) * (basePrice * 0.02);
    const price = basePrice + randomChange + (Math.sin(i * 0.1) * basePrice * 0.01);
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      price: Math.max(price, basePrice * 0.8), // 최소값 보장
      volume: Math.floor(Math.random() * 1000000) + 500000,
      ticker: ticker
    });
  }
  
  return data.sort((a, b) => a.timestamp - b.timestamp);
};
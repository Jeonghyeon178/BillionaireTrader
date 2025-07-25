export const getChartColor = (data) => {
  if (!data || data.length < 2) return '#10b981';
  
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const isPositive = lastPrice >= firstPrice;
  
  return isPositive ? '#10b981' : '#ef4444';
};

export const getYAxisDomain = (data) => {
  if (!data || data.length === 0) return [0, 100];
  
  const prices = data.map(d => d.price).filter(p => p !== null && p !== undefined);
  if (prices.length === 0) return [0, 100];
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = (max - min) * 0.1;
  
  return [Math.max(0, min - padding), max + padding];
};

export const formatYAxisValue = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
};

export const formatXAxisValue = (timestamp, timeFilter) => {
  const date = new Date(timestamp);
  
  switch (timeFilter) {
    case '1D':
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    case '1W':
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    case '1M':
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    case '1Y':
      return date.toLocaleDateString('ko-KR', { year: '2-digit', month: 'short' });
    case 'ALL':
    default:
      return date.toLocaleDateString('ko-KR', { year: '2-digit', month: 'short' });
  }
};

export const getTickCount = (dataLength, timeFilter) => {
  switch (timeFilter) {
    case '1D': return Math.min(6, dataLength);
    case '1W': return Math.min(7, dataLength);
    case '1M': return Math.min(10, dataLength);
    case '1Y': return Math.min(12, dataLength);
    case 'ALL':
    default: return Math.min(8, dataLength);
  }
};

export const filterDataByTimeRange = (data, timeFilter, timeFilters) => {
  if (!data || data.length === 0) return [];
  
  const filterConfig = timeFilters.find(f => f.key === timeFilter);
  if (!filterConfig || filterConfig.days === null) {
    return data;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - filterConfig.days);
  
  return data.filter(item => {
    const itemDate = new Date(item.timestamp || item.date);
    return itemDate >= cutoffDate;
  });
};

export const transformChartData = (rawData, format = 'default') => {
  if (!rawData || !Array.isArray(rawData)) return [];
  
  return rawData.map(item => {
    if (format === 'api') {
      return {
        timestamp: item.date || item.timestamp,
        price: Number(item.price || item.value || 0),
        volume: Number(item.volume || 0)
      };
    }
    
    return {
      timestamp: item.timestamp,
      price: Number(item.price || 0),
      volume: Number(item.volume || 0)
    };
  }).filter(item => item.price > 0);
};

export const generateDummyChartData = (days = 30, basePrice = 100) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const randomChange = (Math.random() - 0.5) * 0.1;
    const price = basePrice * (1 + randomChange);
    
    data.push({
      timestamp: date.toISOString(),
      price: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 1000000)
    });
    
    basePrice = price;
  }
  
  return data;
};
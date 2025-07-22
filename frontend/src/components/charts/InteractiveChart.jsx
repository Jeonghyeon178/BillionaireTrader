import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const InteractiveChart = ({ 
  data = [], 
  selectedTicker = 'COMP', 
  height = 400,
  showArea = true 
}) => {
  const [timeFilter, setTimeFilter] = useState('1M'); // 1D, 1W, 1M, 1Y
  // 차트 타입을 area로 고정
  const [filteredData, setFilteredData] = useState([]);

  // 시간 필터 옵션
  const timeFilters = [
    { key: '1D', label: '1일', days: 1 },
    { key: '1W', label: '1주', days: 7 },
    { key: '1M', label: '1개월', days: 30 },
    { key: '1Y', label: '1년', days: 365 }
  ];


  // 데이터 필터링
  useEffect(() => {
    if (!data || data.length === 0) {
      // 샘플 데이터 생성 (실제 API 데이터가 없을 때)
      const sampleData = generateSampleData(selectedTicker);
      setFilteredData(sampleData);
      return;
    }

    const days = timeFilters.find(f => f.key === timeFilter)?.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = data.filter(item => {
      const itemDate = new Date(item.date || item.timestamp);
      return itemDate >= cutoffDate;
    });

    setFilteredData(filtered);
  }, [data, timeFilter, selectedTicker]);

  // 샘플 데이터 생성 함수
  const generateSampleData = (ticker) => {
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

  // 티커별 기준 가격
  const getBasePrice = (ticker) => {
    const basePrices = {
      'COMP': 20000,
      '.DJI': 44000,
      'SPX': 6000,
      'FX@KRW': 1300
    };
    return basePrices[ticker] || 10000;
  };

  // 티커 이름 매핑
  const getTickerName = (ticker) => {
    const names = {
      'COMP': 'NASDAQ',
      '.DJI': 'DOW JONES',
      'SPX': 'S&P 500',
      'FX@KRW': 'USD/KRW'
    };
    return names[ticker] || ticker;
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const isPositive = data.payload.price >= (filteredData[0]?.price || 0);
      
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 text-sm mb-2">{label}</p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold">
              {typeof data.value === 'number' ? data.value.toFixed(2) : data.value}
            </span>
            <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '▲' : '▼'}
            </span>
          </div>
          {data.payload.volume && (
            <p className="text-slate-400 text-xs">
              거래량: {data.payload.volume.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // 차트 색상 결정
  const getChartColor = () => {
    if (filteredData.length === 0) return '#3b82f6';
    
    const firstPrice = filteredData[0]?.price || 0;
    const lastPrice = filteredData[filteredData.length - 1]?.price || 0;
    return lastPrice >= firstPrice ? '#22c55e' : '#ef4444'; // 상승: 초록, 하락: 빨강
  };

  const chartColor = getChartColor();

  return (
    <div className="w-full">
      {/* 차트 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {getTickerName(selectedTicker)} 차트
          </h3>
          <p className="text-slate-400 text-sm">
            실시간 가격 데이터 ({timeFilter} 기준)
          </p>
        </div>
        
        {/* 시간 필터 */}
        <div className="flex bg-slate-700 rounded-lg p-1">
          {timeFilters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                timeFilter === filter.key
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 차트 영역 - Area Chart로 고정 */}
      <div className="bg-slate-800/50 rounded-lg p-4" style={{ height: height + 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return timeFilter === '1D' ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : 
                       timeFilter === '1W' ? date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) :
                       date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickFormatter={(value) => {
                if (value >= 10000) return `${(value/10000).toFixed(1)}만`;
                if (value >= 1000) return `${(value/1000).toFixed(1)}천`;
                return value.toFixed(0);
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              dot={false}
              activeDot={{ 
                r: 4, 
                stroke: chartColor, 
                strokeWidth: 2, 
                fill: '#1f2937' 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 차트 하단 정보 */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-slate-400 text-xs">현재가</p>
          <p className="text-white font-bold">
            {filteredData.length > 0 ? filteredData[filteredData.length - 1]?.price.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs">변동률</p>
          <p className={`font-bold ${chartColor === '#22c55e' ? 'text-green-400' : 'text-red-400'}`}>
            {filteredData.length > 1 ? (
              ((filteredData[filteredData.length - 1]?.price - filteredData[0]?.price) / filteredData[0]?.price * 100).toFixed(2)
            ) : '0.00'}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs">최고가</p>
          <p className="text-blue-400 font-bold">
            {filteredData.length > 0 ? Math.max(...filteredData.map(d => d.price)).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs">최저가</p>
          <p className="text-purple-400 font-bold">
            {filteredData.length > 0 ? Math.min(...filteredData.map(d => d.price)).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveChart;
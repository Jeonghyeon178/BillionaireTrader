import React from 'react';
import PropTypes from 'prop-types';

const MiniChart = ({ data = [], width = 80, height = 40, trend }) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded"
        style={{ width, height }}
      >
        <span className="text-gray-400 text-xs">No data</span>
      </div>
    );
  }

  // 데이터에서 최대값과 최소값 추출
  const prices = data.map(item => item.price || item.value || 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1; // 0으로 나누기 방지

  // SVG path 생성
  const pathData = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * width;
      const y = height - ((price - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  const getStrokeColor = () => {
    if (trend > 0) return '#10B981'; // green-500
    if (trend < 0) return '#EF4444'; // red-500
    return '#6B7280'; // gray-500
  };

  const getFillColor = () => {
    if (trend > 0) return 'rgba(16, 185, 129, 0.1)'; // green with opacity
    if (trend < 0) return 'rgba(239, 68, 68, 0.1)'; // red with opacity
    return 'rgba(107, 114, 128, 0.1)'; // gray with opacity
  };

  return (
    <div className="relative">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
      >
        {/* 그라데이션 정의 */}
        <defs>
          <linearGradient id="miniChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={getFillColor()} stopOpacity="0.8" />
            <stop offset="100%" stopColor={getFillColor()} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* 면적 채우기 */}
        <path
          d={`${pathData} L ${width},${height} L 0,${height} Z`}
          fill="url(#miniChartGradient)"
          stroke="none"
        />
        
        {/* 선 그래프 */}
        <path
          d={pathData}
          stroke={getStrokeColor()}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* 마지막 점 표시 */}
        {prices.length > 0 && (
          <circle
            cx={(prices.length - 1) / (prices.length - 1) * width}
            cy={height - ((prices[prices.length - 1] - min) / range) * height}
            r="2"
            fill={getStrokeColor()}
          />
        )}
      </svg>
    </div>
  );
};

MiniChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    price: PropTypes.number,
    value: PropTypes.number
  })),
  width: PropTypes.number,
  height: PropTypes.number,
  trend: PropTypes.number
};

export default MiniChart;
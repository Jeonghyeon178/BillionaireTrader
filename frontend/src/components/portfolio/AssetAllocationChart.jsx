import React from 'react';

const AssetAllocationChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500">데이터가 없습니다</p>
      </div>
    );
  }

  // 도넛 차트용 SVG 생성
  const centerX = 120;
  const centerY = 120;
  const radius = 80;
  const innerRadius = 45;

  let cumulativePercentage = 0;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 2 * Math.PI - Math.PI / 2;
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    const outerStartX = centerX + radius * Math.cos(startAngle);
    const outerStartY = centerY + radius * Math.sin(startAngle);
    const outerEndX = centerX + radius * Math.cos(endAngle);
    const outerEndY = centerY + radius * Math.sin(endAngle);
    
    const innerStartX = centerX + innerRadius * Math.cos(startAngle);
    const innerStartY = centerY + innerRadius * Math.sin(startAngle);
    const innerEndX = centerX + innerRadius * Math.cos(endAngle);
    const innerEndY = centerY + innerRadius * Math.sin(endAngle);

    const pathData = [
      `M ${outerStartX} ${outerStartY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
      `L ${innerEndX} ${innerEndY}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
      'Z'
    ].join(' ');

    cumulativePercentage += percentage;

    return {
      path: pathData,
      color: colors[index % colors.length],
      percentage: percentage.toFixed(1),
      ...item
    };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="240" height="240" className="transform -rotate-90">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-gray-800">
            {total.toLocaleString('ko-KR')}
          </p>
          <p className="text-sm text-gray-500">총 자산</p>
        </div>
      </div>
      
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 mb-3">자산 구성</h4>
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div 
                className="w-4 h-4 rounded-full shadow-sm" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="flex-1 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{segment.name}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">
                    {segment.percentage}%
                  </span>
                  <p className="text-xs text-gray-500 font-mono">
                    {(segment.value / 100000000).toFixed(1)}억원
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocationChart;
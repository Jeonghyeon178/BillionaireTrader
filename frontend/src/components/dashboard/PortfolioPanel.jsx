import React, { useState } from 'react';

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

const TopHoldings = ({ holdings }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-4">주요 보유 종목</h3>
      <div className="space-y-3">
        {holdings.map((holding, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {holding.symbol.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">{holding.symbol}</p>
                <p className="text-xs text-gray-500">{holding.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-sm ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {holding.value.toLocaleString('ko-KR')}원
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PerformanceMetrics = ({ metrics }) => {
  const cards = [
    {
      icon: '📈',
      title: '총 수익률',
      value: `+${metrics.totalReturn.toFixed(2)}%`,
      subtitle: `수익금: +${(metrics.totalGain / 100000000).toFixed(1)}억원`,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💰',
      title: '가용 자금',
      value: `${(metrics.availableCash / 100000000).toFixed(1)}억원`,
      subtitle: `전체의 ${((metrics.availableCash / metrics.totalValue) * 100).toFixed(1)}%`,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: '📊',
      title: '오늘 손익',
      value: `${metrics.todayChange >= 0 ? '+' : ''}${metrics.todayChange.toFixed(2)}%`,
      subtitle: `${metrics.todayGain >= 0 ? '+' : ''}${(metrics.todayGain / 100000000).toFixed(2)}억원`,
      color: metrics.todayChange >= 0 ? 'green' : 'red',
      gradient: metrics.todayChange >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'
    },
    {
      icon: '🎯',
      title: '목표 대비',
      value: `${metrics.goalProgress.toFixed(0)}%`,
      subtitle: '연간 목표 달성률',
      color: metrics.goalProgress >= 100 ? 'green' : 'orange',
      gradient: metrics.goalProgress >= 100 ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-amber-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <div key={index} className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 overflow-hidden">
          {/* 배경 그라데이션 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white text-sm shadow-sm`}>
                {card.icon}
              </div>
              <h4 className="font-semibold text-gray-800 text-sm">{card.title}</h4>
            </div>
            <p className={`text-xl font-bold font-mono mb-1 ${
              card.color === 'green' ? 'text-green-600' : 
              card.color === 'red' ? 'text-red-600' :
              card.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {card.value}
            </p>
            <p className="text-xs text-gray-600">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const PortfolioPanel = ({ portfolioData = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // 기본 데이터 설정
  const defaultData = {
    totalValue: portfolioData.portfolioValue || 125430000,
    availableCash: portfolioData.availableCash || 24570000,
    totalReturn: portfolioData.totalReturn || 12.34,
    todayReturn: portfolioData.todayReturn || 2.1,
    ...portfolioData
  };

  // 샘플 자산 배분 데이터
  const assetAllocation = [
    { name: '한국 주식', value: 45000000 },
    { name: '미국 주식', value: 35000000 },
    { name: '채권', value: 20000000 },
    { name: '현금', value: defaultData.availableCash },
    { name: '기타', value: 5430000 }
  ];

  // 샘플 보유 종목 데이터
  const topHoldings = [
    { symbol: 'AAPL', name: 'Apple Inc.', value: 15234000, change: 2.3 },
    { symbol: 'TSLA', name: 'Tesla Inc.', value: 12456000, change: -1.1 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', value: 11789000, change: 0.8 },
    { symbol: '삼성전자', name: 'Samsung Electronics', value: 9876000, change: 1.5 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', value: 8654000, change: 3.2 }
  ];

  // 성과 지표
  const performanceMetrics = {
    totalValue: defaultData.totalValue,
    availableCash: defaultData.availableCash,
    totalReturn: defaultData.totalReturn,
    totalGain: defaultData.totalValue * (defaultData.totalReturn / 100),
    todayChange: defaultData.todayReturn,
    todayGain: defaultData.totalValue * (defaultData.todayReturn / 100),
    goalProgress: (defaultData.totalReturn / 15) * 100 // 연간 15% 목표 가정
  };

  const tabs = [
    { id: 'overview', label: '개요', icon: '📊' },
    { id: 'holdings', label: '보유종목', icon: '📈' },
    { id: 'performance', label: '성과분석', icon: '💎' }
  ];

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">포트폴리오</h2>
        <div className="text-right">
          <span className="text-xs text-gray-500 block">총 자산</span>
          <span className="text-base font-bold text-gray-800 font-mono">
            {(defaultData.totalValue / 100000000).toFixed(1)}억원
          </span>
        </div>
      </div>

      <div className="space-y-3">

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">자산 배분</h3>
              <AssetAllocationChart data={assetAllocation} />
            </div>
          </div>
        )}

        {activeTab === 'holdings' && (
          <TopHoldings holdings={topHoldings} />
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <PerformanceMetrics metrics={performanceMetrics} />
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-4">월간 성과</h3>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">월간 성과 차트 (구현 예정)</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default PortfolioPanel;
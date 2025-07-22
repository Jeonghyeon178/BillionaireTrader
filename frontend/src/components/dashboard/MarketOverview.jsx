import React, { useState } from 'react';
import FinancialCard from '../financial/FinancialCard';

const MarketSummary = ({ marketData }) => {
  // 전체 시장 동향 계산
  const averageChange = marketData.reduce((sum, item) => sum + item.rate, 0) / marketData.length;
  const positiveCount = marketData.filter(item => item.rate > 0).length;
  
  const getMarketSentiment = () => {
    if (averageChange > 1) return { text: '강세장', color: 'text-green-600', bg: 'bg-green-50', icon: '📈' };
    if (averageChange < -1) return { text: '약세장', color: 'text-red-600', bg: 'bg-red-50', icon: '📉' };
    return { text: '보합세', color: 'text-gray-600', bg: 'bg-gray-50', icon: '📊' };
  };

  const sentiment = getMarketSentiment();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">시장 현황</h3>
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${sentiment.color} ${sentiment.bg}`}>
          <span>{sentiment.icon}</span>
          {sentiment.text}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{marketData.length}</p>
          <p className="text-sm text-gray-500">추적 지수</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{positiveCount}</p>
          <p className="text-sm text-gray-500">상승 지수</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold font-mono ${averageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-500">평균 변동률</p>
        </div>
      </div>
    </div>
  );
};

const QuickStats = ({ selectedData }) => {
  if (!selectedData) return null;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 가장 최근 데이터와 이전 데이터 비교
  const latest = selectedData[selectedData.length - 1];
  const previous = selectedData[selectedData.length - 2];
  
  if (!latest || !previous) return null;

  const priceChange = latest.price - previous.price;
  const volume = Math.floor(Math.random() * 1000000); // 임시 볼륨 데이터

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-md font-semibold text-gray-800 mb-3">상세 정보</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">현재가</span>
          <span className="font-mono font-semibold">{latest.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">전일대비</span>
          <span className={`font-mono font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">거래량</span>
          <span className="font-mono">{volume.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">최종 업데이트</span>
          <span className="text-xs text-gray-500">{formatTime(latest.timestamp)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">52주 최고</span>
          <span className="font-mono text-xs">{Math.max(...selectedData.map(d => d.price)).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">52주 최저</span>
          <span className="font-mono text-xs">{Math.min(...selectedData.map(d => d.price)).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const MarketOverview = ({ 
  marketData = [],
  allIndexData = {},
  selectedIndex = 'COMP',
  onIndexSelect
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const indexNameMap = {
    'COMP': 'nasdaq',
    '.DJI': 'dow-jones',
    'SPX': 'snp500',
    'FX@KRW': 'usd-krw'
  };

  const selectedData = allIndexData[indexNameMap[selectedIndex]] || [];

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">시장 개요</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">업데이트:</span>
          <span className="text-xs font-mono text-gray-700">
            {new Date().toLocaleTimeString('ko-KR')}
          </span>
        </div>
      </div>

      <div className="space-y-3">

      {/* 시장 요약 */}
      <MarketSummary marketData={marketData} />

      {/* 뷰 모드 전환 */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-3 py-1 text-sm rounded ${
            viewMode === 'grid' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          그리드 뷰
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-1 text-sm rounded ${
            viewMode === 'list' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          리스트 뷰
        </button>
      </div>

      {/* 시장 지수 카드들 */}
      {viewMode === 'grid' ? (
        <div className="space-y-3">
          {marketData.map((data, index) => {
            const indexNames = ['nasdaq', 'dow-jones', 'snp500', 'usd-krw'];
            const chartData = allIndexData[indexNames[index]] || [];
            
            return (
              <div key={index} className="w-full">
                <FinancialCard
                  ticker={data.ticker}
                  price={data.price}
                  rate={data.rate}
                  chartData={chartData}
                  isActive={selectedIndex === data.ticker}
                  onClick={() => onIndexSelect(data.ticker)}
                  size="compact"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-gray-600 uppercase">
              <span>지수</span>
              <span>현재가</span>
              <span>변동률</span>
              <span>상태</span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {marketData.map((data, index) => (
              <div
                key={index}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedIndex === data.ticker ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => onIndexSelect(data.ticker)}
              >
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {data.ticker === 'COMP' ? '🏢' : 
                       data.ticker === '.DJI' ? '📈' : 
                       data.ticker === 'SPX' ? '🌟' : '💱'}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{data.ticker}</p>
                      <p className="text-xs text-gray-500">
                        {data.ticker === 'COMP' ? 'NASDAQ' :
                         data.ticker === '.DJI' ? 'DOW JONES' :
                         data.ticker === 'SPX' ? 'S&P 500' : 'USD/KRW'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold">
                    {data.price.toFixed(2)}
                  </span>
                  <span className={`font-mono font-semibold ${
                    data.rate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.rate >= 0 ? '+' : ''}{data.rate.toFixed(2)}%
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      data.rate >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">실시간</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 지수 상세 정보 */}
      {selectedData.length > 0 && (
        <QuickStats selectedData={selectedData} />
      )}
      </div>
    </div>
  );
};

export default MarketOverview;
import React from 'react';
import { getMarketSentiment } from '../../utils/marketUtils';

const MarketSummary = ({ marketData }) => {
  // 전체 시장 동향 계산
  const averageChange = marketData.reduce((sum, item) => sum + item.rate, 0) / marketData.length;
  const positiveCount = marketData.filter(item => item.rate > 0).length;
  
  const sentiment = getMarketSentiment(averageChange);

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

export default MarketSummary;
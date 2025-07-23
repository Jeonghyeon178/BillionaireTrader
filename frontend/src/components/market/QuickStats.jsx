import React from 'react';
import { formatTime } from '../../utils/marketUtils';

const QuickStats = ({ selectedData }) => {
  if (!selectedData) return null;

  // 가장 최근 데이터와 이전 데이터 비교
  const latest = selectedData[selectedData.length - 1];
  const previous = selectedData[selectedData.length - 2];
  
  if (!latest || !previous) return null;

  const priceChange = latest.price - previous.price;
  const volume = Math.floor(Math.random() * 1000000); // Placeholder volume data

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

export default QuickStats;
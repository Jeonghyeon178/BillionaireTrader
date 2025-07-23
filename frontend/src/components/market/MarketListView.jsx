import React from 'react';
import { getTickerIcon, getTickerName, formatPrice, formatPercentage, getPriceChangeColor } from '../../utils/marketUtils';

const MarketListView = ({ marketData, selectedIndex, onIndexSelect }) => {
  return (
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
                  {getTickerIcon(data.ticker)}
                </span>
                <div>
                  <p className="font-semibold text-sm">{data.ticker}</p>
                  <p className="text-xs text-gray-500">
                    {getTickerName(data.ticker)}
                  </p>
                </div>
              </div>
              <span className="font-mono font-semibold">
                {formatPrice(data.price)}
              </span>
              <span className={`font-mono font-semibold ${getPriceChangeColor(data.rate)}`}>
                {formatPercentage(data.rate)}
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
  );
};

export default MarketListView;
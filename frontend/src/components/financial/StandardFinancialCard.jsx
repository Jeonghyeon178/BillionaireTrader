import React from 'react';
import TrendIndicator from './TrendIndicator';
import PriceDisplay from './PriceDisplay';
import MiniChart from './MiniChart';
import { getIndexIcon, getIndexName, formatLastUpdate, calculateDayRange } from '../../utils/financialUtils';

const StandardFinancialCard = ({ 
  ticker,
  price,
  rate,
  chartData = [],
  onClick,
  isActive = false,
  size = 'md'
}) => {
  const getCardSize = () => {
    switch (size) {
      case 'sm': return 'p-3';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  };

  return (
    <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 lg:w-1/4">
      <div 
        className={`
          relative flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group
          ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}
          ${getCardSize()}
        `}
        onClick={onClick}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getIndexIcon(ticker)}</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {getIndexName(ticker)}
              </h3>
              <p className="text-xs text-gray-500">{ticker}</p>
            </div>
          </div>
          
          {/* 실시간 표시 */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">LIVE</span>
          </div>
        </div>

        {/* 가격 및 변동률 */}
        <div className="mb-3">
          <PriceDisplay 
            value={price} 
            size="lg" 
            trend={rate}
            currency={ticker === 'FX@KRW' ? 'KRW' : 'USD'}
            showCurrency={ticker === 'FX@KRW'}
          />
          
          <div className="mt-2 flex items-center justify-between">
            <TrendIndicator value={rate} size="md" />
            <span className="text-xs text-gray-400">
              {formatLastUpdate()}
            </span>
          </div>
        </div>

        {/* 미니 차트 */}
        <div className="mb-2">
          <MiniChart 
            data={chartData}
            width={200}
            height={50}
            trend={rate}
          />
        </div>

        {/* 추가 정보 */}
        <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
          <div className="flex justify-between">
            <span>24H Range</span>
            <span>{calculateDayRange(chartData)}</span>
          </div>
        </div>

        {/* 호버 효과 */}
        <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
        
        {/* 활성 상태 표시 */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardFinancialCard;
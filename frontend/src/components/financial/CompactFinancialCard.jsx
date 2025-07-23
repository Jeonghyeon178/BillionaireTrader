import React from 'react';
import TrendIndicator from './TrendIndicator';
import PriceDisplay from './PriceDisplay';
import MiniChart from './MiniChart';
import { getIndexIcon, getIndexName } from '../../utils/financialUtils';

const CompactFinancialCard = ({ 
  ticker,
  price,
  rate,
  chartData = [],
  onClick,
  isActive = false
}) => {
  return (
    <div className="w-full">
      <div 
        className={`
          relative flex flex-row items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group p-3
          ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}
        `}
        onClick={onClick}
      >
        {/* 배경 색상 오버레이 */}
        <div className={`absolute inset-0 rounded-xl opacity-5 ${
          rate >= 0 ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        
        {/* 왼쪽: 아이콘과 정보 */}
        <div className="flex items-center gap-3 flex-1 relative z-10">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${
            rate >= 0 ? 'bg-green-500' : 'bg-red-500'
          } shadow-sm`}>
            {getIndexIcon(ticker)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-sm">
              {getIndexName(ticker)}
            </h3>
            <p className="text-xs text-gray-500">{ticker}</p>
          </div>
        </div>
        
        {/* 오른쪽: 가격과 차트 */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="text-right">
            <PriceDisplay 
              value={price} 
              size="sm" 
              trend={rate}
              currency={ticker === 'FX@KRW' ? 'KRW' : 'USD'}
              showCurrency={false}
            />
            <TrendIndicator value={rate} size="sm" />
          </div>
          
          <div className="w-16">
            <MiniChart 
              data={chartData}
              width={60}
              height={30}
              trend={rate}
            />
          </div>
        </div>
        
        {/* 실시간 펄스 효과 */}
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse ${
          rate >= 0 ? 'bg-green-500' : 'bg-red-500'
        }`}></div>

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

export default CompactFinancialCard;
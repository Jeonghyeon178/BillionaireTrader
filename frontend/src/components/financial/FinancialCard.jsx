import React from 'react';
import TrendIndicator from './TrendIndicator';
import PriceDisplay from './PriceDisplay';
import MiniChart from './MiniChart';

const FinancialCard = ({ 
  ticker,
  name,
  price,
  rate,
  chartData = [],
  onClick,
  isActive = false,
  size = 'md'
}) => {
  const getCardSize = () => {
    switch (size) {
      case 'compact': return 'p-3';
      case 'sm': return 'p-3';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  };

  const getIndexIcon = (ticker) => {
    const icons = {
      'COMP': '🏢',      // NASDAQ
      '.DJI': '📈',      // Dow Jones
      'SPX': '🌟',       // S&P 500
      'FX@KRW': '💱'     // USD/KRW
    };
    return icons[ticker] || '📊';
  };

  const getIndexName = (ticker) => {
    const names = {
      'COMP': 'NASDAQ',
      '.DJI': 'DOW JONES',
      'SPX': 'S&P 500',
      'FX@KRW': 'USD/KRW'
    };
    return names[ticker] || ticker;
  };

  const formatLastUpdate = () => {
    const now = new Date();
    return now.toLocaleTimeString('ko-KR', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={size === 'compact' ? "w-full" : "w-full max-w-full px-3 mb-6 sm:w-1/2 lg:w-1/4"}>
      <div 
        className={`
          relative flex ${size === 'compact' ? 'flex-row items-center' : 'flex-col'} bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group
          ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}
          ${getCardSize()}
        `}
        onClick={onClick}
      >
        {size === 'compact' ? (
          // Compact layout
          <>
            <div className={`absolute inset-0 rounded-xl opacity-5 ${
              rate >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            
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
          </>
        ) : (
          // Original layout
          <>
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
                <span>
                  {chartData.length > 0 ? 
                    `${Math.min(...chartData.map(d => d.price)).toFixed(2)} - ${Math.max(...chartData.map(d => d.price)).toFixed(2)}` :
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </>
        )}

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

export default FinancialCard;
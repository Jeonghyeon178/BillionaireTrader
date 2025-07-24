import React from 'react';
import PropTypes from 'prop-types';
import TrendIndicator from './TrendIndicator';
import PriceDisplay from './PriceDisplay';
import MiniChart from './MiniChart';
import { getIndexIcon as getTickerIcon, getIndexName as getTickerName } from '../../utils/financialUtils';
import { formatLastUpdate, calculateDayRange } from '../../utils/financialUtils';

const FinancialCard = ({ 
  ticker,
  price,
  rate,
  chartData = [],
  onClick,
  isActive = false,
  size = 'md'
}) => {
  // Compact version
  if (size === 'compact') {
    return (
      <div className="w-full">
        <div 
          className={`
            relative flex flex-row items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group p-3
            ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}
          `}
          onClick={onClick}
        >
          <div className={`absolute inset-0 rounded-xl opacity-5 ${
            rate >= 0 ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          
          <div className="flex items-center gap-3 flex-1 relative z-10">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${
              rate >= 0 ? 'bg-green-500' : 'bg-red-500'
            } shadow-sm`}>
              {getTickerIcon(ticker)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">
                {getTickerName(ticker)}
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
          
          <div className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse ${
            rate >= 0 ? 'bg-green-500' : 'bg-red-500'
          }`}></div>

          <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
          
          {isActive && (
            <div className="absolute top-2 right-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard version
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTickerIcon(ticker)}</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {getTickerName(ticker)}
              </h3>
              <p className="text-xs text-gray-500">{ticker}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">LIVE</span>
          </div>
        </div>

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

        <div className="mb-2">
          <MiniChart 
            data={chartData}
            width={200}
            height={50}
            trend={rate}
          />
        </div>

        <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
          <div className="flex justify-between">
            <span>24H Range</span>
            <span>{calculateDayRange(chartData)}</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
        
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

FinancialCard.propTypes = {
  ticker: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  rate: PropTypes.number.isRequired,
  chartData: PropTypes.arrayOf(PropTypes.shape({
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.number
  })),
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'compact'])
};

export default FinancialCard;
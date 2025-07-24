import React from 'react';
import PropTypes from 'prop-types';

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

TopHoldings.propTypes = {
  holdings: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    change: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
  })).isRequired
};

export default TopHoldings;
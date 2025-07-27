import React from 'react';
import PropTypes from 'prop-types';
import CountingNumber from '../common/CountingNumber';

const DarkMarketCard = ({ ticker, name, price, changePercent, onClick, isActive = false }) => {
  const isPositive = changePercent >= 0;
  
  const getIcon = (ticker) => {
    const icons = {
      'COMP': 'N',
      '.DJI': 'D',
      'SPX': 'S',
      'FX@KRW': '₩'
    };
    return icons[ticker] || '📊';
  };

  return (
    <button 
      onClick={onClick}
      className={`bg-slate-800 border border-slate-600 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-slate-500 hover:shadow-lg text-left w-full ${isActive ? 'ring-2 ring-blue-500 bg-slate-700' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {getIcon(ticker)}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{name}</h3>
            <p className="text-slate-400 text-xs">{ticker}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-mono font-bold text-white">
            <CountingNumber
              value={Number(price) || 0}
              formatFunction={(val) => val.toFixed(2)}
              highlightColor="bg-white/10"
              duration={800}
            />
          </p>
          <p className={`font-mono text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <CountingNumber
              value={Number(changePercent) || 0}
              formatFunction={(val) => `${isPositive ? '+' : ''}${val.toFixed(2)}%`}
              highlightColor={isPositive ? "bg-green-500/15" : "bg-red-500/15"}
              duration={700}
            />
          </p>
        </div>
      </div>
    </button>
  );
};

DarkMarketCard.propTypes = {
  ticker: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  changePercent: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool
};


export default DarkMarketCard;
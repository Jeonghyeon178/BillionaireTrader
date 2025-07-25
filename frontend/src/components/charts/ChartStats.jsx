import React from 'react';
import PropTypes from 'prop-types';

const StatItem = ({ label, value, color = 'text-white' }) => (
  <div className="text-center">
    <p className="text-slate-400 text-xs">{label}</p>
    <p className={`font-bold ${color}`}>{value}</p>
  </div>
);

StatItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  color: PropTypes.string
};

const ChartStats = ({ 
  data = [], 
  className = '',
  showVolume = false 
}) => {
  const calculateStats = () => {
    if (data.length === 0) {
      return {
        currentPrice: '0.00',
        changePercent: '0.00',
        highPrice: '0.00',
        lowPrice: '0.00',
        volume: '0'
      };
    }

    const prices = data.map(d => d.price);
    const currentPrice = data[data.length - 1]?.price || 0;
    const firstPrice = data[0]?.price || 0;
    const changePercent = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice * 100) : 0;
    const highPrice = Math.max(...prices);
    const lowPrice = Math.min(...prices);
    const totalVolume = data.reduce((sum, d) => sum + (d.volume || 0), 0);

    return {
      currentPrice: currentPrice.toFixed(2),
      changePercent: changePercent.toFixed(2),
      highPrice: highPrice.toFixed(2),
      lowPrice: lowPrice.toFixed(2),
      volume: totalVolume.toLocaleString()
    };
  };

  const stats = calculateStats();
  const isPositive = parseFloat(stats.changePercent) >= 0;

  return (
    <div className={`mt-4 grid gap-4 ${showVolume ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} ${className}`}>
      <StatItem 
        label="현재가" 
        value={stats.currentPrice} 
      />
      
      <StatItem 
        label="변동률" 
        value={`${stats.changePercent}%`}
        color={isPositive ? 'text-green-400' : 'text-red-400'}
      />
      
      <StatItem 
        label="최고가" 
        value={stats.highPrice}
        color="text-blue-400"
      />
      
      <StatItem 
        label="최저가" 
        value={stats.lowPrice}
        color="text-purple-400"
      />

      {showVolume && (
        <StatItem 
          label="거래량" 
          value={stats.volume}
          color="text-yellow-400"
        />
      )}
    </div>
  );
};

ChartStats.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    price: PropTypes.number,
    volume: PropTypes.number
  })),
  className: PropTypes.string,
  showVolume: PropTypes.bool
};

export default ChartStats;
import React from 'react';
import PropTypes from 'prop-types';
import CountingNumber from '../common/CountingNumber';

const StatItem = ({ label, value, color = 'text-white' }) => (
  <div className="text-center">
    <p className="text-slate-400 text-xs">{label}</p>
    <p className={`font-bold ${color}`}>{value}</p>
  </div>
);

StatItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
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
        currentPrice: 0,
        changePercent: 0,
        highPrice: 0,
        lowPrice: 0,
        volume: 0
      };
    }

    const prices = data.map(d => Number(d.price) || 0).filter(p => p > 0);
    const currentPrice = Number(data[data.length - 1]?.price) || 0;
    const firstPrice = Number(data[0]?.price) || 0;
    const changePercent = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice * 100) : 0;
    const highPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const lowPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const totalVolume = data.reduce((sum, d) => sum + (Number(d.volume) || 0), 0);

    return {
      currentPrice: Number(currentPrice) || 0,
      changePercent: Number(changePercent) || 0,
      highPrice: Number(highPrice) || 0,
      lowPrice: Number(lowPrice) || 0,
      volume: Number(totalVolume) || 0
    };
  };

  const stats = calculateStats();
  const isPositive = stats.changePercent >= 0;

  return (
    <div className={`mt-4 grid gap-4 ${showVolume ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} ${className}`}>
      <StatItem 
        label="현재가" 
        value={
          <CountingNumber
            value={stats.currentPrice}
            formatFunction={(val) => val.toFixed(2)}
            highlightColor="bg-blue-500/20"
            duration={700}
          />
        }
      />
      
      <StatItem 
        label="변동률" 
        value={
          <CountingNumber
            value={stats.changePercent}
            formatFunction={(val) => `${val.toFixed(2)}%`}
            highlightColor={isPositive ? "bg-green-500/20" : "bg-red-500/20"}
            duration={700}
          />
        }
        color={isPositive ? 'text-green-400' : 'text-red-400'}
      />
      
      <StatItem 
        label="최고가" 
        value={
          <CountingNumber
            value={stats.highPrice}
            formatFunction={(val) => val.toFixed(2)}
            highlightColor="bg-blue-500/15"
            duration={600}
          />
        }
        color="text-blue-400"
      />
      
      <StatItem 
        label="최저가" 
        value={
          <CountingNumber
            value={stats.lowPrice}
            formatFunction={(val) => val.toFixed(2)}
            highlightColor="bg-purple-500/15"
            duration={600}
          />
        }
        color="text-purple-400"
      />

      {showVolume && (
        <StatItem 
          label="거래량" 
          value={
            <CountingNumber
              value={stats.volume}
              formatFunction={(val) => Math.floor(val).toLocaleString()}
              highlightColor="bg-yellow-500/20"
              duration={800}
            />
          }
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
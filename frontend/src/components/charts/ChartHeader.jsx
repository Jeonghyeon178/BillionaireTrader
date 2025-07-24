import React from 'react';
import PropTypes from 'prop-types';

const ChartHeader = ({ 
  title, 
  subtitle, 
  ticker,
  timeFilter,
  className = ''
}) => {
  // 티커 이름 매핑
  const getTickerName = (ticker) => {
    const names = {
      'COMP': 'NASDAQ',
      '.DJI': 'DOW JONES',
      'SPX': 'S&P 500',
      'FX@KRW': 'USD/KRW'
    };
    return names[ticker] || ticker;
  };

  const displayTitle = title || `${getTickerName(ticker)} 차트`;
  const displaySubtitle = subtitle || `실시간 가격 데이터 (${timeFilter} 기준)`;

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-white">
        {displayTitle}
      </h3>
      <p className="text-slate-400 text-sm">
        {displaySubtitle}
      </p>
    </div>
  );
};

ChartHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  ticker: PropTypes.string,
  timeFilter: PropTypes.string,
  className: PropTypes.string
};

export default ChartHeader;
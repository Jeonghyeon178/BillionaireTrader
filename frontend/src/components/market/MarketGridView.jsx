import React from 'react';
import PropTypes from 'prop-types';
import FinancialCard from '../financial/FinancialCard';

const MarketGridView = ({ marketData, allIndexData, selectedIndex, onIndexSelect }) => {
  return (
    <div className="space-y-3">
      {marketData.map((data, index) => {
        const indexNames = ['nasdaq', 'dow-jones', 'snp500', 'usd-krw'];
        const chartData = allIndexData[indexNames[index]] || [];
        
        return (
          <div key={index} className="w-full">
            <FinancialCard
              ticker={data.ticker}
              price={data.price}
              rate={data.rate}
              chartData={chartData}
              isActive={selectedIndex === data.ticker}
              onClick={() => onIndexSelect(data.ticker)}
              size="compact"
            />
          </div>
        );
      })}
    </div>
  );
};

MarketGridView.propTypes = {
  marketData: PropTypes.arrayOf(PropTypes.shape({
    ticker: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    rate: PropTypes.number.isRequired
  })).isRequired,
  allIndexData: PropTypes.object.isRequired,
  selectedIndex: PropTypes.string.isRequired,
  onIndexSelect: PropTypes.func.isRequired
};

export default MarketGridView;
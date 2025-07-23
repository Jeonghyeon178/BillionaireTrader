import React from 'react';
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

export default MarketGridView;
import React from 'react';
import { getBuyStrategies, getSellStrategies } from '../../utils/tradingUtils';

const StrategyDetails = () => {
  const buyStrategies = getBuyStrategies();
  const sellStrategies = getSellStrategies();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <h5 className="text-white font-semibold mb-2">매수 전략</h5>
        <ul className="text-slate-300 text-sm space-y-1">
          {buyStrategies.map((strategy, index) => (
            <li key={index}>{strategy}</li>
          ))}
        </ul>
      </div>
      <div className="bg-slate-700 rounded-lg p-4">
        <h5 className="text-white font-semibold mb-2">매도 전략</h5>
        <ul className="text-slate-300 text-sm space-y-1">
          {sellStrategies.map((strategy, index) => (
            <li key={index}>{strategy}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StrategyDetails;
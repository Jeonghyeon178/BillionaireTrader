import React from 'react';
import PropTypes from 'prop-types';

const StrategyPerformance = ({ strategies }) => {
  const totalInvestment = strategies.reduce((sum, s) => sum + s.investment, 0);
  const totalReturn = strategies.reduce((sum, s) => sum + (s.investment * s.return / 100), 0);
  const activeCount = strategies.filter(s => s.status === 'active').length;
  const avgReturn = strategies.length > 0 ? strategies.reduce((sum, s) => sum + s.return, 0) / strategies.length : 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-gray-800 mb-4">전략 성과 요약</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">{activeCount}</p>
          <p className="text-xs text-gray-600">실행중인 전략</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800 font-mono">
            {totalInvestment.toLocaleString('ko-KR')}원
          </p>
          <p className="text-xs text-gray-600">총 투자금액</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold font-mono ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toLocaleString('ko-KR')}원
          </p>
          <p className="text-xs text-gray-600">총 수익금</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold font-mono ${avgReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600">평균 수익률</p>
        </div>
      </div>
    </div>
  );
};

StrategyPerformance.propTypes = {
  strategies: PropTypes.arrayOf(PropTypes.shape({
    investment: PropTypes.number.isRequired,
    return: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired
  })).isRequired
};

export default StrategyPerformance;
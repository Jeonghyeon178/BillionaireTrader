import React from 'react';
import PropTypes from 'prop-types';

const StrategyCard = ({ strategy, onToggle, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'stopped': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '실행중';
      case 'paused': return '일시정지';
      case 'stopped': return '중지됨';
      default: return '알 수 없음';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'paused': return '🟡';
      case 'stopped': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{strategy.icon}</span>
          <h3 className="font-semibold text-gray-800">{strategy.name}</h3>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(strategy.status)}`}>
          {getStatusIcon(strategy.status)}
          {getStatusText(strategy.status)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{strategy.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">수익률</p>
          <p className={`font-mono font-semibold ${strategy.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {strategy.return >= 0 ? '+' : ''}{strategy.return.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">투자금액</p>
          <p className="font-mono font-semibold text-gray-800">
            {strategy.investment.toLocaleString('ko-KR')}원
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">마지막 거래</p>
          <p className="text-xs text-gray-600">{strategy.lastTrade}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">거래 횟수</p>
          <p className="text-sm font-semibold text-gray-800">{strategy.tradeCount}회</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onToggle(strategy.id)}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded ${
            strategy.status === 'active' 
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {strategy.status === 'active' ? '일시정지' : '시작'}
        </button>
        <button
          onClick={() => onEdit(strategy.id)}
          className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
        >
          설정
        </button>
      </div>
    </div>
  );
};

StrategyCard.propTypes = {
  strategy: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['active', 'paused', 'stopped']).isRequired,
    return: PropTypes.number.isRequired,
    investment: PropTypes.number.isRequired,
    lastTrade: PropTypes.string.isRequired,
    tradeCount: PropTypes.number.isRequired
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default StrategyCard;
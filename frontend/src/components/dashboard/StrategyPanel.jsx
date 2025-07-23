import React, { useState } from 'react';
import StrategyCard from '../strategy/StrategyCard';
import StrategyPerformance from '../strategy/StrategyPerformance';
import NewStrategyModal from '../strategy/NewStrategyModal';

const StrategyPanel = ({ schedulerStatus }) => {
  const [strategies, setStrategies] = useState([
    {
      id: '1',
      name: '모멘텀 돌파 전략',
      type: 'momentum',
      icon: '📈',
      description: '상승 모멘텀을 포착하여 매수하는 전략',
      investment: 30000000,
      status: 'active',
      return: 8.5,
      lastTrade: '2분 전',
      tradeCount: 23
    },
    {
      id: '2',
      name: '평균회귀 전략',
      type: 'mean_reversion',
      icon: '📊',
      description: '과매도 구간에서 반등을 노리는 전략',
      investment: 20000000,
      status: 'paused',
      return: -2.1,
      lastTrade: '1시간 전',
      tradeCount: 15
    },
    {
      id: '3',
      name: '페어 트레이딩',
      type: 'pair_trading',
      icon: '⚖️',
      description: '상관관계가 높은 종목들 간의 스프레드 거래',
      investment: 25000000,
      status: 'active',
      return: 4.2,
      lastTrade: '15분 전',
      tradeCount: 8
    }
  ]);

  const [showNewModal, setShowNewModal] = useState(false);

  const handleToggleStrategy = (strategyId) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, status: strategy.status === 'active' ? 'paused' : 'active' }
        : strategy
    ));
  };

  const handleEditStrategy = (strategyId) => {
    // TODO: 전략 편집 모달 열기 (구현 예정)
  };

  const handleAddStrategy = (newStrategy) => {
    setStrategies(prev => [...prev, newStrategy]);
    setShowNewModal(false);
  };

  const isSystemActive = schedulerStatus === 'ENABLED';

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">자동매매 전략</h2>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 전략 추가
        </button>
      </div>

      {/* 시스템 상태 경고 */}
      {!isSystemActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            <p className="text-yellow-800 text-sm">
              자동매매 시스템이 비활성화되어 있습니다. 전략이 실행되지 않습니다.
            </p>
          </div>
        </div>
      )}

      {/* 전략 성과 요약 */}
      <StrategyPerformance strategies={strategies} />

      {/* 전략 리스트 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">활성 전략</h3>
        {strategies.length > 0 ? (
          <div className="grid gap-4">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onToggle={handleToggleStrategy}
                onEdit={handleEditStrategy}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <span className="text-4xl mb-4 block">🤖</span>
            <p className="text-gray-600 mb-4">등록된 전략이 없습니다</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              첫 번째 전략 만들기
            </button>
          </div>
        )}
      </div>

      {/* 새 전략 추가 모달 */}
      <NewStrategyModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleAddStrategy}
      />
    </div>
  );
};

export default StrategyPanel;
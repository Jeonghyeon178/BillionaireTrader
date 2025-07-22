import React, { useState } from 'react';

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

const NewStrategyModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'momentum',
    investment: 1000000,
    description: ''
  });

  const strategyTypes = [
    { value: 'momentum', label: '모멘텀 전략', icon: '📈' },
    { value: 'mean_reversion', label: '평균회귀 전략', icon: '📊' },
    { value: 'pair_trading', label: '페어 트레이딩', icon: '⚖️' },
    { value: 'grid', label: '그리드 전략', icon: '🎯' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedType = strategyTypes.find(t => t.value === formData.type);
    
    const newStrategy = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      icon: selectedType?.icon || '📊',
      description: formData.description || `${selectedType?.label} 기반 자동매매`,
      investment: formData.investment,
      status: 'stopped',
      return: 0,
      lastTrade: '없음',
      tradeCount: 0
    };

    onSave(newStrategy);
    setFormData({ name: '', type: 'momentum', investment: 1000000, description: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">새 전략 추가</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전략 이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 나의 모멘텀 전략"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전략 유형
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {strategyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              투자 금액 (원)
            </label>
            <input
              type="number"
              value={formData.investment}
              onChange={(e) => setFormData({...formData, investment: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100000"
              step="100000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명 (선택사항)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="전략에 대한 간단한 설명..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
    // 전략 편집 모달 열기 (구현 예정)
    console.log('Edit strategy:', strategyId);
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
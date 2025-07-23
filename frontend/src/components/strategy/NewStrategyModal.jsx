import React, { useState } from 'react';

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

export default NewStrategyModal;
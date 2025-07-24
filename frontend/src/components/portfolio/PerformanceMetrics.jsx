import React from 'react';
import PropTypes from 'prop-types';

const PerformanceMetrics = ({ metrics }) => {
  const cards = [
    {
      icon: '📈',
      title: '총 수익률',
      value: `+${metrics.totalReturn.toFixed(2)}%`,
      subtitle: `수익금: +${(metrics.totalGain / 100000000).toFixed(1)}억원`,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💰',
      title: '가용 자금',
      value: `${(metrics.availableCash / 100000000).toFixed(1)}억원`,
      subtitle: `전체의 ${((metrics.availableCash / metrics.totalValue) * 100).toFixed(1)}%`,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: '📊',
      title: '오늘 손익',
      value: `${metrics.todayChange >= 0 ? '+' : ''}${metrics.todayChange.toFixed(2)}%`,
      subtitle: `${metrics.todayGain >= 0 ? '+' : ''}${(metrics.todayGain / 100000000).toFixed(2)}억원`,
      color: metrics.todayChange >= 0 ? 'green' : 'red',
      gradient: metrics.todayChange >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'
    },
    {
      icon: '🎯',
      title: '목표 대비',
      value: `${metrics.goalProgress.toFixed(0)}%`,
      subtitle: '연간 목표 달성률',
      color: metrics.goalProgress >= 100 ? 'green' : 'orange',
      gradient: metrics.goalProgress >= 100 ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-amber-500'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <div key={index} className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 overflow-hidden">
          {/* 배경 그라데이션 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white text-sm shadow-sm`}>
                {card.icon}
              </div>
              <h4 className="font-semibold text-gray-800 text-sm">{card.title}</h4>
            </div>
            <p className={`text-xl font-bold font-mono mb-1 ${
              card.color === 'green' ? 'text-green-600' : 
              card.color === 'red' ? 'text-red-600' :
              card.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {card.value}
            </p>
            <p className="text-xs text-gray-600">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

PerformanceMetrics.propTypes = {
  metrics: PropTypes.shape({
    totalReturn: PropTypes.number.isRequired,
    totalGain: PropTypes.number.isRequired,
    availableCash: PropTypes.number.isRequired,
    totalValue: PropTypes.number.isRequired,
    todayChange: PropTypes.number.isRequired,
    todayGain: PropTypes.number.isRequired,
    goalProgress: PropTypes.number.isRequired
  }).isRequired
};

export default PerformanceMetrics;
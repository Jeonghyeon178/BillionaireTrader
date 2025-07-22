import React from 'react';

const StatusCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  trend,
  onClick 
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-300';
  };

  const getValueColor = () => {
    if (trend === 'up') return 'text-green-200';
    if (trend === 'down') return 'text-red-200';
    return 'text-white';
  };

  return (
    <div 
      className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all duration-200 border border-white/10 ${onClick ? 'cursor-pointer hover:bg-white/20 hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-sm ${getTrendColor()}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
      <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
      <p className={`text-xl font-semibold font-mono ${getValueColor()}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-white/60 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
};

const HeroDashboard = ({ 
  schedulerStatus,
  totalReturn = 0,
  todayReturn = 0,
  portfolioValue = 0,
  availableCash = 0,
  activeStrategies = 0,
  alertCount = 0,
  onToggleScheduler
}) => {
  const isTrading = schedulerStatus === 'ENABLED';
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (percent) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 rounded-xl shadow-xl mb-6 border border-blue-500/20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">자동매매 대시보드</h1>
          <p className="text-blue-100 text-sm">
            실시간 포트폴리오 및 전략 모니터링
          </p>
        </div>
        <div className="text-right">
          <p className="text-blue-100 text-sm">마지막 업데이트</p>
          <p className="text-white font-mono text-sm">
            {new Date().toLocaleTimeString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 상태 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          icon={isTrading ? '🟢' : '🔴'} 
          title="자동매매 상태"
          value={isTrading ? '활성화' : '비활성화'}
          subtitle={`실행중: ${activeStrategies}전략`}
          onClick={onToggleScheduler}
        />
        
        <StatusCard 
          title="총 수익률" 
          value={formatPercent(totalReturn)}
          subtitle={`오늘: ${formatPercent(todayReturn)}`}
          trend={totalReturn > 0 ? 'up' : totalReturn < 0 ? 'down' : null}
          icon="📈"
        />
        
        <StatusCard 
          title="포트폴리오" 
          value={formatCurrency(portfolioValue)}
          subtitle={`가용자금: ${formatCurrency(availableCash)}`}
          icon="💰"
        />
        
        <StatusCard 
          title="실시간 알림" 
          value={`${alertCount}개`}
          subtitle={alertCount > 0 ? "새로운 알림" : "모든 알림 확인됨"}
          icon="🔔"
        />
      </div>

      {/* 빠른 액션 버튼 */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/20">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-white/20 ${
            isTrading 
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-100' 
              : 'bg-green-500/20 hover:bg-green-500/30 text-green-100'
          }`}
          onClick={onToggleScheduler}
        >
          {isTrading ? '🛑 자동매매 중지' : '▶️ 자동매매 시작'}
        </button>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all duration-200 border border-white/10">
          ⚙️ 전략 설정
        </button>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all duration-200 border border-white/10">
          📊 거래 내역
        </button>
      </div>
    </div>
  );
};

export default HeroDashboard;
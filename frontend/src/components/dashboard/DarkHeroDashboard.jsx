import React from 'react';

const DarkHeroDashboard = ({ 
  schedulerStatus,
  totalReturn = 12.34,
  todayReturn = 2.1,
  portfolioValue = 125430000,
  availableCash = 24570000,
  activeStrategies = 3,
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
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 rounded-xl shadow-2xl mb-6 border border-slate-600">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            자동매매 대시보드
          </h1>
          <p className="text-slate-300 text-sm">
            실시간 포트폴리오 및 전략 모니터링
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm">마지막 업데이트</p>
          <p className="text-white font-mono text-sm">
            {new Date().toLocaleTimeString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 상태 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600 ${isTrading ? 'ring-1 ring-green-500' : 'ring-1 ring-red-500'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{isTrading ? '🟢' : '🔴'}</span>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isTrading ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
          <h3 className="text-slate-300 text-sm font-medium mb-1">자동매매 상태</h3>
          <p className={`text-xl font-semibold font-mono ${isTrading ? 'text-green-400' : 'text-red-400'}`}>
            {isTrading ? '활성화' : '비활성화'}
          </p>
          <p className="text-slate-400 text-xs mt-1">실행중: {activeStrategies}전략</p>
        </div>
        
        <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📈</span>
            <span className={`text-sm ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalReturn >= 0 ? '↗️' : '↘️'}
            </span>
          </div>
          <h3 className="text-slate-300 text-sm font-medium mb-1">총 수익률</h3>
          <p className={`text-xl font-semibold font-mono ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercent(totalReturn)}
          </p>
          <p className="text-slate-400 text-xs mt-1">오늘: {formatPercent(todayReturn)}</p>
        </div>
        
        <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-slate-300 text-sm font-medium mb-1">포트폴리오</h3>
          <p className="text-xl font-semibold font-mono text-blue-400">
            {(portfolioValue / 100000000).toFixed(1)}억원
          </p>
          <p className="text-slate-400 text-xs mt-1">가용자금: {(availableCash / 100000000).toFixed(1)}억원</p>
        </div>
        
        <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔔</span>
            {alertCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{alertCount}</span>
            )}
          </div>
          <h3 className="text-slate-300 text-sm font-medium mb-1">실시간 알림</h3>
          <p className="text-xl font-semibold font-mono text-yellow-400">
            {alertCount}개
          </p>
          <p className="text-slate-400 text-xs mt-1">{alertCount > 0 ? "새로운 알림" : "모든 알림 확인됨"}</p>
        </div>
      </div>

      {/* 빠른 액션 버튼 */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-600">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
            isTrading 
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/50' 
              : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/50'
          }`}
          onClick={onToggleScheduler}
        >
          {isTrading ? '🛑 자동매매 중지' : '▶️ 자동매매 시작'}
        </button>
        <button className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-500 text-slate-300">
          ⚙️ 전략 설정
        </button>
        <button className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-500 text-slate-300">
          📊 거래 내역
        </button>
      </div>
    </div>
  );
};

export default DarkHeroDashboard;
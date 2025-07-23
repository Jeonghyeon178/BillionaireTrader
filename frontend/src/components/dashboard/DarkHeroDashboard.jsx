import React from 'react';
import DashboardHeader from './DashboardHeader';
import BaseCard from '../common/BaseCard';
import MetricDisplay from '../common/MetricDisplay';

const DarkHeroDashboard = ({ 
  schedulerStatus,
  totalReturn = 0,
  todayReturn = 0,
  portfolioValue = 0,
  availableCash = 0,
  alertCount = 0,
  holdingsCount = 0,
  lastUpdated = new Date(),
  isToggling = false,
  onToggleScheduler
}) => {

  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 rounded-xl shadow-2xl mb-6 border border-slate-600">
      <DashboardHeader 
        title="자동매매 대시보드"
        subtitle="실시간 포트폴리오 및 전략 모니터링"
        lastUpdated={lastUpdated}
      />

      {/* 상태 카드 그리드 - BaseCard + MetricDisplay 사용 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 수익륭 카드 */}
        <BaseCard variant="metric">
          <MetricDisplay
            title="총 수익률"
            value={`${totalReturn.toFixed(2)}%`}
            valueColor={totalReturn >= 0 ? "text-green-400" : "text-red-400"}
            subtitle={`오늘: ${todayReturn.toFixed(2)}%`}
            icon="📈"
            trend={totalReturn >= 0 ? 'up' : 'down'}
          />
        </BaseCard>
        
        {/* 포트폴리오 가치 카드 */}
        <BaseCard variant="metric">
          <MetricDisplay
              title="포트폴리오 가치"
              value={`${Math.floor(portfolioValue).toLocaleString()}원`}
              valueColor="text-blue-400"
              subtitle={`현금: ${Math.floor(availableCash).toLocaleString()}원`}
              icon="💼"
          />
        </BaseCard>
        
        {/* 알림 카드 */}
        <BaseCard variant="metric">
          <MetricDisplay
            title="실시간 알림"
            value={`${alertCount}개`}
            valueColor="text-yellow-400"
            subtitle={alertCount > 0 ? "새로운 알림" : "모든 알림 확인됨"}
            icon="🔔"
            badge={alertCount > 0 ? (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {alertCount}
              </span>
            ) : null}
          />
        </BaseCard>
        
        {/* 자동매매 컨트롤 카드 */}
        <BaseCard 
          variant="metric"
          className={`cursor-pointer transition-all duration-200 ${
            isToggling 
              ? 'opacity-70 cursor-not-allowed' 
              : 'hover:ring-2' + (schedulerStatus === 'ENABLED' ? ' hover:ring-red-400' : ' hover:ring-green-400')
          }`}
          onClick={!isToggling ? onToggleScheduler : undefined}
        >
          <MetricDisplay
            title="자동매매 상태"
            value={isToggling ? '처리 중...' : (schedulerStatus === 'ENABLED' ? '활성화됨' : '비활성화됨')}
            valueColor={isToggling ? 'text-gray-400' : (schedulerStatus === 'ENABLED' ? 'text-green-400' : 'text-red-400')}
            subtitle={isToggling ? '상태 변경 중...' : (schedulerStatus === 'ENABLED' ? '클릭하여 비활성화' : '클릭하여 활성화')}
            icon={isToggling ? '⏳' : (schedulerStatus === 'ENABLED' ? '▶️' : '⏸️')}
            badge={isToggling ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : null}
          />
        </BaseCard>
      </div>

    </div>
  );
};

export default DarkHeroDashboard;
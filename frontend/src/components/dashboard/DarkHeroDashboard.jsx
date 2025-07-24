import React from 'react';
import PropTypes from 'prop-types';
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
  lastUpdated = new Date(),
  isToggling = false,
  onToggleScheduler
}) => {
  // Extract complex conditional logic
  const getSchedulerStatus = () => {
    if (isToggling) return '처리 중...';
    return schedulerStatus === 'ENABLED' ? '활성화됨' : '비활성화됨';
  };

  const getSchedulerValueColor = () => {
    if (isToggling) return 'text-gray-400';
    return schedulerStatus === 'ENABLED' ? 'text-green-400' : 'text-red-400';
  };

  const getSchedulerSubtitle = () => {
    if (isToggling) return '상태 변경 중...';
    return schedulerStatus === 'ENABLED' ? '클릭하여 비활성화' : '클릭하여 활성화';
  };

  const getSchedulerIcon = () => {
    if (isToggling) return '⏳';
    return schedulerStatus === 'ENABLED' ? '▶️' : '⏸️';
  };

  const getSchedulerHoverRing = () => {
    if (isToggling) return 'opacity-70 cursor-not-allowed';
    const baseHover = 'hover:ring-2';
    const ringColor = schedulerStatus === 'ENABLED' ? ' hover:ring-red-400' : ' hover:ring-green-400';
    return baseHover + ringColor;
  };

  const getSchedulerBadge = () => {
    if (!isToggling) return null;
    return (
      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
    );
  };

  const getAlertBadge = () => {
    if (alertCount <= 0) return null;
    return (
      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
        {alertCount}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 rounded-xl shadow-2xl mb-6 border border-slate-600">
      <DashboardHeader 
        title="자동매매 대시보드"
        subtitle="실시간 포트폴리오 및 전략 모니터링"
        lastUpdated={lastUpdated}
      />

      {/* 상태 카드 그리드 - BaseCard + MetricDisplay 사용 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 자동매매 컨트롤 카드 */}
        <BaseCard
          variant="metric"
          className={`cursor-pointer transition-all duration-200 ${getSchedulerHoverRing()}`}
          onClick={!isToggling ? onToggleScheduler : undefined}
        >
          <MetricDisplay
            title="자동매매 상태"
            value={getSchedulerStatus()}
            valueColor={getSchedulerValueColor()}
            subtitle={getSchedulerSubtitle()}
            icon={getSchedulerIcon()}
            badge={getSchedulerBadge()}
          />
        </BaseCard>

        {/* 수익률 카드 */}
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
            badge={getAlertBadge()}
          />
        </BaseCard>
      </div>
    </div>
  );
};

DarkHeroDashboard.propTypes = {
  schedulerStatus: PropTypes.string,
  totalReturn: PropTypes.number,
  todayReturn: PropTypes.number,
  portfolioValue: PropTypes.number,
  availableCash: PropTypes.number,
  alertCount: PropTypes.number,
  lastUpdated: PropTypes.instanceOf(Date),
  isToggling: PropTypes.bool,
  onToggleScheduler: PropTypes.func
};

export default DarkHeroDashboard;
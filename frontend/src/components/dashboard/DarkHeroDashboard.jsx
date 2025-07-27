import React from 'react';
import PropTypes from 'prop-types';
import DashboardHeader from './DashboardHeader';
import BaseCard from '../common/BaseCard';
import MetricDisplay from '../common/MetricDisplay';
import CountingNumber from '../common/CountingNumber';

const DarkHeroDashboard = ({ 
  schedulerStatus,
  totalReturn = 0,
  portfolioValue = 0,
  availableCash = 0,
  alertCount = 0,
  lastUpdated = new Date(),
  isToggling = false,
  onToggleScheduler
}) => {
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
    return schedulerStatus === 'ENABLED' ? '🟢' : '🔴';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <BaseCard variant="metric">
          <MetricDisplay
            title="총 수익률"
            value={
              <CountingNumber
                value={Number(totalReturn) || 0}
                formatFunction={(val) => `${val.toFixed(2)}%`}
                highlightColor={totalReturn >= 0 ? "bg-green-500/20" : "bg-red-500/20"}
                duration={800}
              />
            }
            valueColor={totalReturn >= 0 ? "text-green-400" : "text-red-400"}
            subtitle="총 원금 대비 수익률"
            icon="📈"
            trend={totalReturn >= 0 ? 'up' : 'down'}
          />
        </BaseCard>
        
        <BaseCard variant="metric">
          <MetricDisplay
            title="포트폴리오 가치"
            value={
              <CountingNumber
                value={Number(portfolioValue) || 0}
                formatFunction={(val) => `${Math.floor(val).toLocaleString()}원`}
                highlightColor="bg-blue-500/20"
                duration={1000}
              />
            }
            valueColor="text-blue-400"
            subtitle={
              <>
                현금: <CountingNumber
                  value={Number(availableCash) || 0}
                  formatFunction={(val) => `${Math.floor(val).toLocaleString()}원`}
                  highlightColor="bg-blue-500/10"
                  duration={800}
                />
              </>
            }
            icon="💼"
          />
        </BaseCard>
        
        <BaseCard variant="metric">
          <MetricDisplay
            title="실시간 알림"
            value={
              <CountingNumber
                value={Number(alertCount) || 0}
                formatFunction={(val) => `${Math.floor(val)}개`}
                highlightColor="bg-yellow-500/20"
                duration={500}
              />
            }
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
  portfolioValue: PropTypes.number,
  availableCash: PropTypes.number,
  alertCount: PropTypes.number,
  lastUpdated: PropTypes.instanceOf(Date),
  isToggling: PropTypes.bool,
  onToggleScheduler: PropTypes.func
};

export default DarkHeroDashboard;
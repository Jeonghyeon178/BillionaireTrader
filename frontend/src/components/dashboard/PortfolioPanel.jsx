import React, { useState } from 'react';
import AssetAllocationChart from '../portfolio/AssetAllocationChart';
import TopHoldings from '../portfolio/TopHoldings';
import PerformanceMetrics from '../portfolio/PerformanceMetrics';
import { 
  calculatePortfolioMetrics, 
  createDefaultAssetAllocation, 
  createDefaultHoldings 
} from '../../utils/portfolioUtils';

const PortfolioPanel = ({ portfolioData = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // 기본 데이터 설정
  const defaultData = {
    totalValue: portfolioData.portfolioValue || 125430000,
    availableCash: portfolioData.availableCash || 24570000,
    totalReturn: portfolioData.totalReturn || 12.34,
    todayReturn: portfolioData.todayReturn || 2.1,
    ...portfolioData
  };

  // 유틸리티 함수 사용하여 데이터 생성
  const assetAllocation = createDefaultAssetAllocation(defaultData);
  const topHoldings = createDefaultHoldings();
  const performanceMetrics = calculatePortfolioMetrics(defaultData);

  const tabs = [
    { id: 'overview', label: '개요', icon: '📊' },
    { id: 'holdings', label: '보유종목', icon: '📈' },
    { id: 'performance', label: '성과분석', icon: '💎' }
  ];

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">포트폴리오</h2>
        <div className="text-right">
          <span className="text-xs text-gray-500 block">총 자산</span>
          <span className="text-base font-bold text-gray-800 font-mono">
            {(defaultData.totalValue / 100000000).toFixed(1)}억원
          </span>
        </div>
      </div>

      <div className="space-y-3">

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">자산 배분</h3>
              <AssetAllocationChart data={assetAllocation} />
            </div>
          </div>
        )}

        {activeTab === 'holdings' && (
          <TopHoldings holdings={topHoldings} />
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <PerformanceMetrics metrics={performanceMetrics} />
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-4">월간 성과</h3>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">월간 성과 차트 (구현 예정)</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default PortfolioPanel;
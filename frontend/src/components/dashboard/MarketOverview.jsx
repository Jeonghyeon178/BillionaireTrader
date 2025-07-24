import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MarketSummary from '../market/MarketSummary';
import QuickStats from '../market/QuickStats';
import ViewModeSwitcher from '../common/ViewModeSwitcher';
import MarketGridView from '../market/MarketGridView';
import MarketListView from '../market/MarketListView';
import { getIndexNameMap } from '../../utils/marketUtils';

const MarketOverview = ({ 
  marketData = [],
  allIndexData = {},
  selectedIndex = 'COMP',
  onIndexSelect
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const indexNameMap = getIndexNameMap();
  const selectedData = allIndexData[indexNameMap[selectedIndex]] || [];

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">시장 개요</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">업데이트:</span>
          <span className="text-xs font-mono text-gray-700">
            {new Date().toLocaleTimeString('ko-KR')}
          </span>
        </div>
      </div>

      <div className="space-y-3">

      {/* 시장 요약 */}
      <MarketSummary marketData={marketData} />

      {/* 뷰 모드 전환 */}
      <ViewModeSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* 시장 지수 카드들 */}
      {viewMode === 'grid' ? (
        <MarketGridView 
          marketData={marketData}
          allIndexData={allIndexData}
          selectedIndex={selectedIndex}
          onIndexSelect={onIndexSelect}
        />
      ) : (
        <MarketListView 
          marketData={marketData}
          selectedIndex={selectedIndex}
          onIndexSelect={onIndexSelect}
        />
      )}

      {/* 선택된 지수 상세 정보 */}
      {selectedData.length > 0 && (
        <QuickStats selectedData={selectedData} />
      )}
      </div>
    </div>
  );
};

MarketOverview.propTypes = {
  marketData: PropTypes.arrayOf(PropTypes.shape({
    ticker: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    rate: PropTypes.number.isRequired
  })),
  allIndexData: PropTypes.object,
  selectedIndex: PropTypes.string,
  onIndexSelect: PropTypes.func.isRequired
};

export default MarketOverview;
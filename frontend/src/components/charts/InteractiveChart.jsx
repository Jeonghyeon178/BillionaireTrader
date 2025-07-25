import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import ChartHeader from './ChartHeader';
import TimeFilter from './TimeFilter';
import ChartContainer from './ChartContainer';
import ChartStats from './ChartStats';
import CustomTooltip from './CustomTooltip';
import {
  getChartColor,
  getYAxisDomain,
  formatYAxisValue,
  formatXAxisValue,
  getTickCount,
  filterDataByTimeRange
} from '../../utils/chartUtils';

const TIME_FILTERS = [
  { key: '1D', label: '1일', days: 1 },
  { key: '1W', label: '1주', days: 7 },
  { key: '1M', label: '1개월', days: 30 },
  { key: '1Y', label: '1년', days: 365 },
  { key: 'ALL', label: '전체', days: null }
];

const InteractiveChart = ({ 
  data = [], 
  selectedTicker = 'COMP', 
  height = 400,
  loading = false
}) => {
  const [timeFilter, setTimeFilter] = useState('1M');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    const filtered = filterDataByTimeRange(data, timeFilter, TIME_FILTERS);
    setFilteredData(filtered);
  }, [data, timeFilter, selectedTicker]);

  const chartColor = getChartColor(filteredData);
  const yAxisDomain = getYAxisDomain(filteredData);
  const tickCount = getTickCount(timeFilter);
  
  const isLoading = loading || !data;
  
  const formatTooltipLabel = (label) => label;
  const formatTooltipValue = (value) => typeof value === 'number' ? value.toFixed(2) : value;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <ChartHeader 
          ticker={selectedTicker}
          timeFilter={timeFilter}
        />
        
        <TimeFilter 
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          filters={TIME_FILTERS}
        />
      </div>

      <ChartContainer 
        height={height}
        loading={isLoading}
        error={data && data.length === 0 ? "차트 데이터를 불러올 수 없습니다" : null}
        emptyMessage="차트 데이터를 불러오는 중입니다..."
        errorMessage="API 연결을 확인해주세요"
        showRetryInfo={true}
      >
        {filteredData && filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9ca3af" 
                fontSize={12}
                interval="preserveStartEnd"
                minTickGap={30}
                tick={{ fill: '#9ca3af' }}
                tickCount={tickCount}
                tickFormatter={(value) => formatXAxisValue(value, timeFilter)}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12}
                domain={yAxisDomain}
                tickFormatter={formatYAxisValue}
              />
              <Tooltip 
                content={
                  <CustomTooltip 
                    baselineData={filteredData}
                    formatValue={formatTooltipValue}
                    formatLabel={formatTooltipLabel}
                  />
                } 
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ 
                  r: 4, 
                  stroke: chartColor, 
                  strokeWidth: 2, 
                  fill: '#1f2937' 
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 text-2xl mb-2">📈</div>
              <p className="text-slate-400">선택한 기간에 데이터가 없습니다</p>
              <p className="text-slate-500 text-sm mt-1">다른 시간 범위를 선택해보세요</p>
            </div>
          </div>
        )}
      </ChartContainer>

      <ChartStats 
        data={filteredData}
        chartColor={chartColor}
        showVolume={false}
      />
    </div>
  );
};

InteractiveChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  selectedTicker: PropTypes.string,
  height: PropTypes.number,
  loading: PropTypes.bool
};

InteractiveChart.defaultProps = {
  data: [],
  selectedTicker: 'COMP',
  height: 400,
  loading: false
};

export default InteractiveChart;
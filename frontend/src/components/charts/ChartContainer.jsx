import React from 'react';
import PropTypes from 'prop-types';
import ErrorState from '../common/ErrorState';

const ChartContainer = ({ 
  children, 
  height = 400, 
  loading = false,
  error = null,
  emptyMessage = "차트 데이터를 불러오는 중입니다...",
  className = '',
  showRetryInfo = false
}) => {
  const containerHeight = height + 40;

  if (loading) {
    return (
      <div 
        className={`bg-slate-800/50 rounded-lg p-4 ${className}`} 
        style={{ height: containerHeight }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`bg-slate-800/50 rounded-lg p-4 ${className}`} 
        style={{ height: containerHeight }}
      >
        <ErrorState message={error} showRetryInfo={showRetryInfo} />
      </div>
    );
  }

  if (!children || (React.Children.count(children) === 0)) {
    return (
      <div 
        className={`bg-slate-800/50 rounded-lg p-4 ${className}`} 
        style={{ height: containerHeight }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400 text-2xl mb-2">📊</div>
            <p className="text-slate-400">차트 데이터가 없습니다</p>
            <p className="text-slate-500 text-sm mt-1">API에서 데이터를 가져오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-slate-800/50 rounded-lg p-4 ${className}`} 
      style={{ height: containerHeight }}
    >
      {children}
    </div>
  );
};

ChartContainer.propTypes = {
  children: PropTypes.node,
  height: PropTypes.number,
  loading: PropTypes.bool,
  error: PropTypes.string,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  showRetryInfo: PropTypes.bool
};

ChartContainer.defaultProps = {
  children: null,
  height: 400,
  loading: false,
  error: null,
  emptyMessage: "차트 데이터를 불러오는 중입니다...",
  className: '',
  showRetryInfo: false
};

export default ChartContainer;
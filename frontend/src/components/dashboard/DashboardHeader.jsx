import React from 'react';
import PropTypes from 'prop-types';

const DashboardHeader = ({ 
  title, 
  subtitle, 
  lastUpdated = new Date(),
  showLastUpdated = true 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-slate-300 text-sm">
          {subtitle}
        </p>
      </div>
      
      {showLastUpdated && (
        <div className="text-right">
          <p className="text-slate-400 text-sm">마지막 업데이트</p>
          <p className="text-white font-mono text-sm">
            {lastUpdated.toLocaleTimeString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  );
};

DashboardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  lastUpdated: PropTypes.instanceOf(Date),
  showLastUpdated: PropTypes.bool
};

export default DashboardHeader;
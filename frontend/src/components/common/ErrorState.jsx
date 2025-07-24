import React from 'react';
import PropTypes from 'prop-types';

const ErrorState = ({ message, showRetryInfo = false }) => {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 h-48 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-2">⚠️</p>
        <p className="text-red-400 text-sm">{message}</p>
        {showRetryInfo && (
          <p className="text-slate-500 text-xs mt-2">
            자동으로 다시 시도합니다...
          </p>
        )}
      </div>
    </div>
  );
};

ErrorState.propTypes = {
  message: PropTypes.string.isRequired,
  showRetryInfo: PropTypes.bool
};

ErrorState.defaultProps = {
  showRetryInfo: false
};

export default ErrorState;
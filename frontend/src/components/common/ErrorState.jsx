import React from 'react';
import PropTypes from 'prop-types';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 h-48 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-2">⚠️</p>
        <p className="text-red-400 text-sm">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

ErrorState.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func
};

ErrorState.defaultProps = {
  onRetry: null
};

export default ErrorState;
import React from 'react';
import PropTypes from 'prop-types';

const LoadingState = ({ message = "로딩 중..." }) => {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 h-48 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400">{message}</p>
      </div>
    </div>
  );
};

LoadingState.propTypes = {
  message: PropTypes.string
};

export default LoadingState;
import React from 'react';

// 호버 효과 컴포넌트
export const HoverEffect = () => (
  <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
);

// 활성 상태 표시 컴포넌트  
export const ActiveIndicator = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="absolute top-2 right-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
    </div>
  );
};

// 실시간 펄스 효과
export const LivePulse = ({ rate, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2'
  };

  return (
    <div className={`absolute ${positionClasses[position]} w-2 h-2 rounded-full animate-pulse ${
      rate >= 0 ? 'bg-green-500' : 'bg-red-500'
    }`}></div>
  );
};

// 실시간 라이브 표시
export const LiveIndicator = () => (
  <div className="flex items-center gap-1">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    <span className="text-xs text-gray-400">LIVE</span>
  </div>
);

// 배경 색상 오버레이
export const BackgroundOverlay = ({ rate, opacity = 5 }) => (
  <div className={`absolute inset-0 rounded-xl opacity-${opacity} ${
    rate >= 0 ? 'bg-green-500' : 'bg-red-500'
  }`}></div>
);

// 링 효과 (활성 상태)
export const RingEffect = ({ isActive, color = 'blue' }) => {
  if (!isActive) return '';
  return `ring-2 ring-${color}-500 shadow-lg`;
};
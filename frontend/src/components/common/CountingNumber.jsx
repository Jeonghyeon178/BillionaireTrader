import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CountingNumber = ({ 
  value, 
  duration = 1000, 
  className = '', 
  highlightColor = 'bg-blue-500/20',
  formatFunction = null,
  easingFunction = 'easeOutCubic',
  enableCounting = true
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(value);
  const animationFrame = useRef(null);
  const startTime = useRef(null);

  // 이징 함수들
  const easingFunctions = {
    linear: (t) => t,
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutQuart: (t) => 1 - Math.pow(1 - t, 4)
  };

  const animate = (timestamp) => {
    if (!startTime.current) startTime.current = timestamp;
    
    const elapsed = timestamp - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    
    const easedProgress = easingFunctions[easingFunction](progress);
    
    const numValue = Number(value) || 0;
    const numPrevValue = Number(previousValue.current) || 0;
    const currentValue = numPrevValue + (numValue - numPrevValue) * easedProgress;
    setDisplayValue(currentValue);
    
    if (progress < 1) {
      animationFrame.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      startTime.current = null;
    }
  };

  useEffect(() => {
    // 숫자 값이고 카운팅이 활성화된 경우에만 애니메이션
    const numValue = Number(value);
    const numPrevValue = Number(previousValue.current);
    
    if (
      enableCounting &&
      !isNaN(numValue) && 
      !isNaN(numPrevValue) &&
      numPrevValue !== numValue && 
      previousValue.current !== undefined
    ) {
      setIsAnimating(true);
      startTime.current = null;
      
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      animationFrame.current = requestAnimationFrame(animate);
    } else if (previousValue.current !== value) {
      // 숫자가 아니거나 카운팅이 비활성화된 경우 즉시 업데이트
      setDisplayValue(value);
    }
    
    previousValue.current = value;
  }, [value, duration, easingFunction, enableCounting]);

  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const formattedValue = formatFunction ? formatFunction(Number(displayValue) || 0) : displayValue;

  return (
    <span 
      className={`
        counting-transition
        ${isAnimating ? `data-update-animation ${highlightColor} scale-105 rounded px-1` : ''} 
        ${className}
      `}
      style={{
        '--highlight-color': highlightColor.includes('green') ? 'rgba(34, 197, 94, 0.2)' : 
                           highlightColor.includes('red') ? 'rgba(239, 68, 68, 0.2)' : 
                           'rgba(59, 130, 246, 0.2)'
      }}
    >
      {formattedValue}
    </span>
  );
};

CountingNumber.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  duration: PropTypes.number,
  className: PropTypes.string,
  highlightColor: PropTypes.string,
  formatFunction: PropTypes.func,
  easingFunction: PropTypes.oneOf(['linear', 'easeOutCubic', 'easeInOutCubic', 'easeOutQuart']),
  enableCounting: PropTypes.bool
};

export default CountingNumber;
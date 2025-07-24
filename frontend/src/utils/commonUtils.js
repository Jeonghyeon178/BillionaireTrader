/**
 * Common utility functions for the BillionaireTrader application
 * Note: Ticker functions moved to individual utils to avoid circular dependencies
 */

// Unified price formatting
export const formatPrice = (value, currency = '₩') => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  const numValue = Number(value);
  if (numValue >= 1000000) {
    return `${currency}${(numValue / 1000000).toFixed(1)}M`;
  } else if (numValue >= 1000) {
    return `${currency}${(numValue / 1000).toFixed(1)}K`;
  }
  return `${currency}${numValue.toLocaleString()}`;
};

// Unified percentage formatting
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  const numValue = Number(value);
  return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(decimals)}%`;
};

// Unified color utilities for trends
export const getTrendColor = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'text-gray-400';
  const numValue = Number(value);
  return numValue >= 0 ? 'text-green-400' : 'text-red-400';
};

export const getTrendColorClasses = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'text-gray-400';
  const numValue = Number(value);
  return numValue >= 0 
    ? 'text-green-400 bg-green-400/10' 
    : 'text-red-400 bg-red-400/10';
};

// Unified data validation
export const isValidNumber = (value) => {
  return value !== null && value !== undefined && !isNaN(value) && isFinite(value);
};

// Unified date formatting
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('ko-KR');
    case 'time':
      return dateObj.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case 'datetime':
      return dateObj.toLocaleString('ko-KR');
    default:
      return dateObj.toLocaleDateString('ko-KR');
  }
};

// Unified loading state helper
export const createLoadingState = (isLoading, error, data) => ({
  isLoading,
  error,
  data,
  hasData: data && Object.keys(data).length > 0
});

// Unified error message formatter
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};
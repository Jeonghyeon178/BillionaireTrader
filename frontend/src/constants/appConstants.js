// Application Constants
export const APP_CONSTANTS = {
  // API Configuration
  DEFAULT_USD_KRW_RATE: 1300,
  
  // Timing Configuration
  DEBOUNCE_DELAY: 300,
  SCHEDULER_TIMEOUT: 1000,
  SCHEDULER_RETRY_DELAY: 1000,
  REFRESH_INTERVAL: 30000,
  REACT_BATCH_UPDATE_DELAY: 100,
  
  // Retry Configuration
  MAX_RETRIES: 3,
  
  // Alert Thresholds
  ALERT_THRESHOLDS: {
    TOTAL_LOSS: -5,
    DAILY_LOSS: -3
  },
  
  // Chart Configuration
  DEFAULT_CHART_HEIGHT: 400,
  CHART_VOLUME_MIN: 500000,
  CHART_VOLUME_RANGE: 1000000,
  
  // Search Configuration
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_RESULTS: 10,
  
  // Default Values
  DEFAULT_SELECTED_CARD: 'COMP',
  DEFAULT_CHART_TITLE: '인터랙티브 차트',
  
  // Market Data
  MARKET_NAMES: ['NASDAQ', 'DOW JONES', 'S&P 500', 'USD/KRW'],
  
  // Status Values
  SCHEDULER_STATUS: {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
    UNKNOWN: 'UNKNOWN'
  },
  
  // Task Status
  TASK_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    BLOCKED: 'blocked',
    CANCELLED: 'cancelled'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  SCHEDULER: {
    STATUS: '/scheduler/status',
    ENABLE: '/scheduler/enable',
    DISABLE: '/scheduler/disable'
  },
  INDICES: {
    NASDAQ: '/indices/nasdaq',
    DOW_JONES: '/indices/dow-jones',
    SNP500: '/indices/snp500',
    USD_KRW: '/indices/usd-krw'
  },
  ACCOUNT: '/account',
  STOCKS: {
    SEARCH: '/stocks/search',
    CHART: (symbol) => `/stocks/${symbol}/chart`
  }
};

// Chart Endpoint Mapping
export const CHART_ENDPOINTS = {
  'COMP': API_ENDPOINTS.INDICES.NASDAQ,
  '.DJI': API_ENDPOINTS.INDICES.DOW_JONES,
  'SPX': API_ENDPOINTS.INDICES.SNP500,
  'FX@KRW': API_ENDPOINTS.INDICES.USD_KRW
};
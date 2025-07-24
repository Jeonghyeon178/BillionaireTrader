// Development-only logger utility
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message, ...args) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message, ...args) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args);
    }
    // In production, you might want to send errors to a logging service
    // logToService(message, args);
  }
};

// Performance monitoring utility
export const performanceLogger = {
  time: (label) => {
    if (isDevelopment) {
      console.time(label);
    }
  },
  
  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};
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
  }
};

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
import { APP_CONSTANTS } from '../constants/appConstants';
import { logger } from './logger';

export const normalizeSchedulerStatus = (statusText) => {
  const text = String(statusText).trim();
  
  if (text.includes("비활성화됨")) {
    return APP_CONSTANTS.SCHEDULER_STATUS.DISABLED;
  } else if (text.includes("활성화됨")) {
    return APP_CONSTANTS.SCHEDULER_STATUS.ENABLED;
  } else {
    return APP_CONSTANTS.SCHEDULER_STATUS.UNKNOWN;
  }
};

export const getSchedulerAction = (currentStatus) => {
  return currentStatus === APP_CONSTANTS.SCHEDULER_STATUS.ENABLED ? "disable" : "enable";
};

export const getExpectedStatus = (action) => {
  return action === 'enable' 
    ? APP_CONSTANTS.SCHEDULER_STATUS.ENABLED 
    : APP_CONSTANTS.SCHEDULER_STATUS.DISABLED;
};

export const retrySchedulerStatusCheck = async (fetchStatusFn, expectedStatus, maxRetries = APP_CONSTANTS.MAX_RETRIES) => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    retryCount++;
    
    const waitTime = APP_CONSTANTS.SCHEDULER_RETRY_DELAY * Math.pow(2, retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    try {
      const status = await fetchStatusFn();
      
      if (status === expectedStatus) {
        return true;
      }
    } catch (error) {
      logger.error(`Retry ${retryCount} failed:`, error);
    }
  }
  
  logger.warn(`Failed to confirm scheduler status after ${maxRetries} retries`);
  return false;
};

export const createSchedulerErrorMessage = (action, errorMessage) => {
  const actionText = action === 'enable' ? '활성화' : '비활성화';
  return `자동매매 ${actionText}에 실패했습니다.\n오류: ${errorMessage}`;
};
import { APP_CONSTANTS } from '../constants/appConstants';
import { logger } from './logger';

/**
 * Normalize scheduler status from API response
 * @param {string} statusText - Raw status text from API
 * @returns {string} Normalized status
 */
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

/**
 * Get scheduler action based on current status
 * @param {string} currentStatus - Current scheduler status
 * @returns {string} Action to perform (enable/disable)
 */
export const getSchedulerAction = (currentStatus) => {
  return currentStatus === APP_CONSTANTS.SCHEDULER_STATUS.ENABLED ? "disable" : "enable";
};

/**
 * Get expected status after action
 * @param {string} action - Action being performed
 * @returns {string} Expected status after action
 */
export const getExpectedStatus = (action) => {
  return action === 'enable' 
    ? APP_CONSTANTS.SCHEDULER_STATUS.ENABLED 
    : APP_CONSTANTS.SCHEDULER_STATUS.DISABLED;
};

/**
 * Retry scheduler status check with exponential backoff
 * @param {Function} fetchStatusFn - Function to fetch status
 * @param {string} expectedStatus - Expected status
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<boolean>} Whether the expected status was achieved
 */
export const retrySchedulerStatusCheck = async (fetchStatusFn, expectedStatus, maxRetries = APP_CONSTANTS.MAX_RETRIES) => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    retryCount++;
    
    // Wait with exponential backoff
    const waitTime = APP_CONSTANTS.SCHEDULER_RETRY_DELAY * Math.pow(2, retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    try {
      const status = await fetchStatusFn();
      
      if (status === expectedStatus) {
        logger.debug(`Scheduler status confirmed after ${retryCount} retries`);
        return true;
      }
      
      logger.debug(`Retry ${retryCount}/${maxRetries}: Status is ${status}, expected ${expectedStatus}`);
    } catch (error) {
      logger.error(`Retry ${retryCount} failed:`, error);
    }
  }
  
  logger.warn(`Failed to confirm scheduler status after ${maxRetries} retries`);
  return false;
};

/**
 * Create scheduler toggle error message
 * @param {string} action - Action that failed
 * @param {string} errorMessage - Error message from API
 * @returns {string} Formatted error message for user
 */
export const createSchedulerErrorMessage = (action, errorMessage) => {
  const actionText = action === 'enable' ? '활성화' : '비활성화';
  return `자동매매 ${actionText}에 실패했습니다.\n오류: ${errorMessage}`;
};
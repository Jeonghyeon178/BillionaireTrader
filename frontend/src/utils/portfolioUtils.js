import { APP_CONSTANTS } from '../constants/appConstants';
import { logger } from './logger';

/**
 * Calculate total return percentage
 * @param {number} currentValue - Current portfolio value
 * @param {number} purchaseValue - Original purchase value
 * @returns {number} Return percentage
 */
export const calculateTotalReturn = (currentValue, purchaseValue) => {
  if (purchaseValue <= 0) {
    logger.warn('Invalid purchase value for return calculation:', purchaseValue);
    return 0;
  }

  const profitLoss = currentValue - purchaseValue;
  const returnPercent = (profitLoss / purchaseValue) * 100;
  
  logger.debug('Total return calculated:', {
    currentValue: currentValue.toFixed(2),
    purchaseValue: purchaseValue.toFixed(2),
    profitLoss: profitLoss.toFixed(2),
    returnPercent: returnPercent.toFixed(2) + '%'
  });

  return returnPercent;
};

/**
 * Calculate today's return based on holdings
 * @param {Array} holdings - Array of holding objects
 * @param {number} usdToKrw - USD to KRW exchange rate
 * @param {number} totalStockValue - Total current stock value
 * @returns {number} Today's return percentage
 */
export const calculateTodayReturn = (holdings, usdToKrw, totalStockValue) => {
  if (!Array.isArray(holdings) || holdings.length === 0) {
    return 0;
  }

  let totalTodayProfitLoss = 0;

  holdings.forEach(holding => {
    const currentPrice = parseFloat(holding.ovrs_now_pric1 || 0);
    const prevPrice = parseFloat(holding.prpr || currentPrice);
    const quantity = parseFloat(holding.ovrs_cblc_qty || 0);

    if (prevPrice > 0 && quantity > 0) {
      const dailyChange = (currentPrice - prevPrice) * quantity * usdToKrw;
      totalTodayProfitLoss += dailyChange;
    }
  });

  if (totalStockValue <= 0) {
    return 0;
  }

  return (totalTodayProfitLoss / totalStockValue) * 100;
};

/**
 * Calculate alert count based on portfolio performance
 * @param {number} totalReturn - Total return percentage
 * @param {number} todayReturn - Today's return percentage
 * @returns {number} Number of alerts
 */
export const calculateAlertCount = (totalReturn, todayReturn) => {
  let alertCount = 0;
  
  if (totalReturn < APP_CONSTANTS.ALERT_THRESHOLDS.TOTAL_LOSS) {
    alertCount++;
  }
  
  if (todayReturn < APP_CONSTANTS.ALERT_THRESHOLDS.DAILY_LOSS) {
    alertCount++;
  }

  return alertCount;
};

/**
 * Parse and validate USD values from API response
 * @param {Object} stockBalanceData - Stock balance data from API
 * @param {Object} cashBalanceData - Cash balance data from API
 * @returns {Object} Parsed USD values
 */
export const parseUSDValues = (stockBalanceData, cashBalanceData) => {
  const totalStockValueUSD = parseFloat(stockBalanceData?.tot_evlu_pfls_amt || 0);
  const totalPurchaseValueUSD = parseFloat(stockBalanceData?.frcr_pchs_amt1 || 0);
  const cashValueUSD = parseFloat(cashBalanceData?.frcr_dncl_amt1 || 0);

  logger.debug('Parsed USD values:', {
    totalStockValueUSD,
    totalPurchaseValueUSD,
    cashValueUSD
  });

  return {
    totalStockValueUSD,
    totalPurchaseValueUSD,
    cashValueUSD
  };
};

/**
 * Convert USD values to KRW
 * @param {Object} usdValues - USD values object
 * @param {number} exchangeRate - USD to KRW exchange rate
 * @returns {Object} KRW values
 */
export const convertToKRW = (usdValues, exchangeRate) => {
  const { totalStockValueUSD, totalPurchaseValueUSD, cashValueUSD } = usdValues;
  
  return {
    totalStockValue: totalStockValueUSD * exchangeRate,
    totalPurchaseValue: totalPurchaseValueUSD * exchangeRate,
    cashValue: cashValueUSD * exchangeRate,
    totalPortfolioValue: (totalStockValueUSD + cashValueUSD) * exchangeRate
  };
};

/**
 * Create default portfolio data for error cases
 * @returns {Object} Default portfolio data
 */
export const getDefaultPortfolioData = () => ({
  totalReturn: 0,
  todayReturn: 0,
  portfolioValue: 0,
  availableCash: 0,
  alertCount: 1, // API connection failure alert
  holdingsCount: 0,
  lastUpdated: new Date()
});
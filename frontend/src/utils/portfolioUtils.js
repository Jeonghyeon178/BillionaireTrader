import { APP_CONSTANTS } from '../constants/appConstants';
import { logger } from './logger';

export const calculateTotalReturn = (totalPortfolioValue, totalInvestedAmount) => {
  if (totalInvestedAmount <= 0) {
    logger.warn('Invalid invested amount for return calculation:', totalInvestedAmount);
    return 0;
  }

  const profitLoss = totalPortfolioValue - totalInvestedAmount;
  return (profitLoss / totalInvestedAmount) * 100;
};


export const calculateAlertCount = (totalReturn) => {
  let alertCount = 0;
  
  if (totalReturn < APP_CONSTANTS.ALERT_THRESHOLDS.TOTAL_LOSS) {
    alertCount++;
  }

  return alertCount;
};

export const parseUSDValues = (stockBalanceData, cashBalanceData) => {
  const totalStockValueUSD = parseFloat(stockBalanceData?.tot_evlu_pfls_amt || 0);
  const totalPurchaseValueUSD = parseFloat(stockBalanceData?.frcr_pchs_amt1 || 0);
  const cashValueUSD = parseFloat(cashBalanceData?.frcr_dncl_amt1 || 0);

  return {
    totalStockValueUSD,
    totalPurchaseValueUSD,
    cashValueUSD
  };
};

export const convertToKRW = (usdValues, exchangeRate) => {
  const { totalStockValueUSD, totalPurchaseValueUSD, cashValueUSD } = usdValues;
  
  return {
    totalStockValue: totalStockValueUSD * exchangeRate,
    totalPurchaseValue: totalPurchaseValueUSD * exchangeRate,
    cashValue: cashValueUSD * exchangeRate,
    totalPortfolioValue: (totalStockValueUSD + cashValueUSD) * exchangeRate
  };
};

export const getDefaultPortfolioData = () => ({
  totalReturn: 0,
  portfolioValue: 0,
  availableCash: 0,
  alertCount: 1,
  holdingsCount: 0,
  lastUpdated: new Date()
});
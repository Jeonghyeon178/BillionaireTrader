import { APP_CONSTANTS } from '../constants/appConstants';
import { logger } from './logger';

export const calculateTotalReturn = (currentValue, purchaseValue) => {
  if (purchaseValue <= 0) {
    logger.warn('Invalid purchase value for return calculation:', purchaseValue);
    return 0;
  }

  const profitLoss = currentValue - purchaseValue;
  return (profitLoss / purchaseValue) * 100;
};

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
  todayReturn: 0,
  portfolioValue: 0,
  availableCash: 0,
  alertCount: 1,
  holdingsCount: 0,
  lastUpdated: new Date()
});
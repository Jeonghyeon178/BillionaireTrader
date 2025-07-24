import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

// Components
import Navbar from "../components/Navbar";
import DarkHeroDashboard from "../components/dashboard/DarkHeroDashboard";
import DarkMarketCard from "../components/market/DarkMarketCard";
import InteractiveChart from "../components/charts/InteractiveChart";
import PortfolioOverview from "../components/portfolio/PortfolioOverview";
import Container from "../components/common/Container";
import Section from "../components/common/Section";
import StockSearch from "../components/search/StockSearch";
import ErrorState from "../components/common/ErrorState";

// Constants and Utils
import { APP_CONSTANTS, API_ENDPOINTS, CHART_ENDPOINTS } from '../constants/appConstants';
import { logger, performanceLogger } from '../utils/logger';
import { transformChartData, generateDummyChartData } from '../utils/chartUtils';
import {
  calculateTotalReturn,
  calculateTodayReturn,
  calculateAlertCount,
  parseUSDValues,
  convertToKRW,
  getDefaultPortfolioData
} from '../utils/portfolioUtils';
import {
  normalizeSchedulerStatus,
  getSchedulerAction,
  getExpectedStatus,
  retrySchedulerStatusCheck,
  createSchedulerErrorMessage
} from '../utils/schedulerUtils';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Initial state constants
const INITIAL_PORTFOLIO_DATA = {
  totalReturn: 0,
  todayReturn: 0,
  portfolioValue: 0,
  availableCash: 0,
  alertCount: 0,
  holdingsCount: 0,
  lastUpdated: new Date()
};

const INITIAL_UI_STATE = {
  loading: true,
  isToggling: false,
  selectedCard: APP_CONSTANTS.DEFAULT_SELECTED_CARD,
  selectedStock: null,
  chartTitle: APP_CONSTANTS.DEFAULT_CHART_TITLE
};

const MainPage = () => {
  // State management - consolidated for better performance
  const [uiState, setUiState] = useState(INITIAL_UI_STATE);
  const [cardData, setCardData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [portfolioData, setPortfolioData] = useState(INITIAL_PORTFOLIO_DATA);
  const [usdKrwRate, setUsdKrwRate] = useState(APP_CONSTANTS.DEFAULT_USD_KRW_RATE);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [schedulerError, setSchedulerError] = useState(null);

  // Memoized market names to prevent re-renders
  const marketNames = useMemo(() => APP_CONSTANTS.MARKET_NAMES, []);

  /**
   * Handle React 18 batch update for scheduler status
   * @param {string} normalizedStatus - The normalized status
   * @param {string} prevStatus - Previous status
   */
  const handleSchedulerStatusUpdate = useCallback((normalizedStatus, prevStatus) => {
    if (prevStatus !== normalizedStatus) {
      // React 18 batch update consideration
      setTimeout(() => {
        setSchedulerStatus(current => current !== normalizedStatus ? normalizedStatus : current);
      }, APP_CONSTANTS.REACT_BATCH_UPDATE_DELAY);
      return normalizedStatus;
    }
    return prevStatus;
  }, []);

  /**
   * Fetch scheduler status with error handling
   * @returns {Promise<string>} Normalized scheduler status
   */
  const fetchSchedulerStatus = useCallback(async () => {
    try {
      performanceLogger.time('fetchSchedulerStatus');
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SCHEDULER.STATUS}`);
      const normalizedStatus = normalizeSchedulerStatus(response.data);
      
      setSchedulerStatus(prevStatus => handleSchedulerStatusUpdate(normalizedStatus, prevStatus));
      
      return normalizedStatus;
    } catch (error) {
      logger.error("스케줄러 상태 조회 실패:", error.message);
      setSchedulerStatus(APP_CONSTANTS.SCHEDULER_STATUS.UNKNOWN);
      return APP_CONSTANTS.SCHEDULER_STATUS.UNKNOWN;
    } finally {
      performanceLogger.timeEnd('fetchSchedulerStatus');
    }
  }, [handleSchedulerStatusUpdate]);

  /**
   * Fetch USD/KRW exchange rate
   */
  const fetchUsdKrwRate = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.INDICES.USD_KRW}`);
      const latestData = response.data[response.data.length - 1];
      if (latestData?.price) {
        setUsdKrwRate(latestData.price);
      }
    } catch (error) {
      logger.error("USD/KRW 환율 가져오기 실패:", error);
      // Keep default rate on failure
    }
  }, []);

  /**
   * Extract data from account API response
   * @param {AccountData} accountData - Account data from API
   * @returns {Object} Extracted data
   */
  const extractAccountData = useCallback((accountData) => {
    // Type-safe property access with fallbacks
    const stockBalanceData = accountData?.stock_balance_res?.output2 || {};
    const cashBalanceData = accountData?.cash_balance_res?.output?.[0] || {};
    const holdings = accountData?.stock_balance_res?.output1 || [];
    
    return { stockBalanceData, cashBalanceData, holdings };
  }, []);

  /**
   * Fetch and process portfolio data
   * @returns {Promise<void>}
   */
  const fetchPortfolioData = useCallback(async () => {
    try {
      performanceLogger.time('fetchPortfolioData');
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ACCOUNT}`);
      /** @type {AccountData} */
      const accountData = response.data;
      
      // Extract data from API response
      const { stockBalanceData, cashBalanceData, holdings } = extractAccountData(accountData);
      
      // Parse USD values
      const usdValues = parseUSDValues(stockBalanceData, cashBalanceData);
      
      // Convert to KRW
      const krwValues = convertToKRW(usdValues, usdKrwRate);
      
      // Calculate returns
      const totalReturn = calculateTotalReturn(krwValues.totalStockValue, krwValues.totalPurchaseValue);
      const todayReturn = calculateTodayReturn(holdings, usdKrwRate, krwValues.totalStockValue);
      
      // Calculate alerts
      const alertCount = calculateAlertCount(totalReturn, todayReturn);
      
      setPortfolioData({
        totalReturn,
        todayReturn,
        portfolioValue: krwValues.totalPortfolioValue,
        availableCash: krwValues.cashValue,
        alertCount,
        holdingsCount: holdings.length,
        lastUpdated: new Date()
      });
      
    } catch (error) {
      logger.error("포트폴리오 데이터 가져오기 실패:", error);
      setPortfolioData(getDefaultPortfolioData());
    } finally {
      performanceLogger.timeEnd('fetchPortfolioData');
    }
  }, [usdKrwRate, extractAccountData]);

  /**
   * Process successful scheduler toggle
   * @param {string} action - The action performed
   * @returns {Promise<void>}
   */
  const processSuccessfulToggle = useCallback(async (action) => {
    // Wait for backend processing
    await new Promise(resolve => setTimeout(resolve, APP_CONSTANTS.SCHEDULER_TIMEOUT));
    
    const expectedStatus = getExpectedStatus(action);
    const actualStatus = await fetchSchedulerStatus();
    
    if (actualStatus !== expectedStatus) {
      const success = await retrySchedulerStatusCheck(fetchSchedulerStatus, expectedStatus);
      if (!success) {
        setSchedulerError('상태 변경이 완료되지 않았습니다. 페이지를 새로고침해주세요.');
      }
    }
  }, [fetchSchedulerStatus]);

  /**
   * Handle scheduler toggle error
   * @param {Error} error - The error object
   * @returns {Promise<void>}
   */
  const handleToggleError = useCallback(async (error) => {
    logger.error('스케줄러 토글 실패:', error.response?.data || error.message);
    
    // Re-fetch current status on error - don't await to avoid blocking
    fetchSchedulerStatus().catch(statusError => {
      logger.error('Failed to re-fetch scheduler status:', statusError);
    });
    
    const action = getSchedulerAction(schedulerStatus);
    const errorMessage = createSchedulerErrorMessage(action, error.response?.data || error.message);
    setSchedulerError(errorMessage);
  }, [schedulerStatus, fetchSchedulerStatus]);

  /**
   * Handle scheduler error retry
   * @returns {void}
   */
  const handleSchedulerErrorRetry = useCallback(() => {
    setSchedulerError(null);
    // Retry the scheduler status fetch
    fetchSchedulerStatus().catch(error => {
      logger.error('Scheduler status retry failed:', error);
      setSchedulerError('스케줄러 상태를 다시 가져올 수 없습니다.');
    });
  }, [fetchSchedulerStatus]);

  /**
   * Handle scheduler toggle with proper error handling and retries
   * @returns {Promise<void>}
   */
  const handleSchedulerToggle = useCallback(async () => {
    if (uiState.isToggling) return;

    try {
      setUiState(/** @type {function(UIState): UIState} */ (prev => ({ ...prev, isToggling: true })));
      
      const action = getSchedulerAction(schedulerStatus);
      const endpoint = action === 'enable' 
        ? API_ENDPOINTS.SCHEDULER.ENABLE 
        : API_ENDPOINTS.SCHEDULER.DISABLE;
      
      performanceLogger.time(`schedulerToggle_${action}`);
      const response = await axios.post(`${API_BASE_URL}${endpoint}`);
      
      if (response.status === 200) {
        await processSuccessfulToggle(action);
        // Refresh portfolio data after successful toggle - don't await to avoid blocking UI
        fetchPortfolioData().catch(error => {
          logger.error('Portfolio data refresh failed after scheduler toggle:', error);
        });
      }
    } catch (error) {
      await handleToggleError(error);
    } finally {
      setUiState(/** @type {function(UIState): UIState} */ (prev => ({ ...prev, isToggling: false })));
      performanceLogger.timeEnd(`schedulerToggle_${getSchedulerAction(schedulerStatus)}`);
    }
  }, [uiState.isToggling, schedulerStatus, processSuccessfulToggle, handleToggleError, fetchPortfolioData]);

  /**
   * Fetch chart data for indices
   */
  const fetchIndexChartData = useCallback(async (ticker) => {
    try {
      const endpoint = CHART_ENDPOINTS[ticker] || API_ENDPOINTS.INDICES.NASDAQ;
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const transformedData = transformChartData(response.data, ticker);
      setChartData(transformedData);
    } catch (error) {
      logger.error("차트 데이터 가져오기 실패:", ticker, error);
      setChartData([]);
    }
  }, []);

  /**
   * Fetch chart data for individual stocks
   */
  const fetchStockChartData = useCallback(async (symbol) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.STOCKS.CHART(symbol)}`);
      const transformedData = transformChartData(response.data, symbol);
      setChartData(transformedData);
    } catch (error) {
      logger.error(`종목 ${symbol} 차트 데이터 가져오기 실패:`, error);
      // Fallback to dummy data for development
      const dummyData = generateDummyChartData(symbol);
      setChartData(dummyData);
    }
  }, []);

  /**
   * Handle market card selection
   * @param {string} ticker - Selected ticker symbol
   */
  const handleCardClick = useCallback((ticker) => {
    setUiState(/** @type {function(UIState): UIState} */ (prev => ({
      ...prev,
      selectedCard: ticker,
      selectedStock: null,
      chartTitle: APP_CONSTANTS.DEFAULT_CHART_TITLE
    })));
  }, []);

  /**
   * Handle stock search selection
   * @param {Object} stock - Selected stock object
   */
  const handleStockSelect = useCallback((stock) => {
    setUiState(/** @type {function(UIState): UIState} */ (prev => ({
      ...prev,
      selectedStock: stock,
      selectedCard: null,
      chartTitle: `${stock.symbol} - ${stock.name}`
    })));
    // Don't await to avoid blocking UI
    fetchStockChartData(stock.symbol).catch(error => {
      logger.error('Failed to fetch stock chart data:', error);
    });
  }, [fetchStockChartData]);

  /**
   * Initial data fetch
   * @returns {Promise<void>}
   */
  const fetchInitialData = useCallback(async () => {
    try {
      setUiState(/** @type {function(UIState): UIState} */ (prev => ({ ...prev, loading: true })));
      
      const indexResponses = await Promise.all([
        axios.get(`${API_BASE_URL}${API_ENDPOINTS.INDICES.NASDAQ}`),
        axios.get(`${API_BASE_URL}${API_ENDPOINTS.INDICES.DOW_JONES}`),
        axios.get(`${API_BASE_URL}${API_ENDPOINTS.INDICES.SNP500}`),
        axios.get(`${API_BASE_URL}${API_ENDPOINTS.INDICES.USD_KRW}`)
      ]);

      const processedCardData = indexResponses
        .map(response => {
          const data = response.data;
          return data.length > 0 ? data[data.length - 1] : null;
        })
        .filter(Boolean);
      
      setCardData(processedCardData);
      
      // Load default chart data - don't await to avoid blocking
      if (processedCardData.length > 0) {
        fetchIndexChartData(uiState.selectedCard).catch(error => {
          logger.error('Failed to fetch initial chart data:', error);
        });
      }
    } catch (error) {
      logger.error("초기 데이터 가져오기 실패:", error);
    } finally {
      setUiState(/** @type {function(UIState): UIState} */ (prev => ({ ...prev, loading: false })));
    }
  }, [uiState.selectedCard, fetchIndexChartData]);

  // Effects - Initial data loading
  useEffect(() => {
    // Don't await promises to prevent blocking initial render
    fetchInitialData().catch(error => {
      logger.error('Initial data fetch failed:', error);
    });
    
    fetchSchedulerStatus().catch(error => {
      logger.error('Initial scheduler status fetch failed:', error);
    });
    
    fetchUsdKrwRate().catch(error => {
      logger.error('Initial USD/KRW rate fetch failed:', error);
    });
  }, [fetchInitialData, fetchSchedulerStatus, fetchUsdKrwRate]);

  // Update portfolio data when exchange rate changes
  useEffect(() => {
    if (usdKrwRate > 0 && !uiState.loading) {
      // Don't await to prevent blocking UI
      fetchPortfolioData().catch(error => {
        logger.error('Failed to fetch portfolio data on exchange rate change:', error);
      });
    }
  }, [usdKrwRate, uiState.loading, fetchPortfolioData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!uiState.loading) {
        // Don't await promises to prevent blocking UI
        fetchPortfolioData().catch(error => {
          logger.error('Auto-refresh portfolio data failed:', error);
        });
        
        if (!uiState.isToggling) {
          fetchSchedulerStatus().catch(error => {
            logger.error('Auto-refresh scheduler status failed:', error);
          });
        }
      }
    }, APP_CONSTANTS.REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [uiState.loading, uiState.isToggling, fetchPortfolioData, fetchSchedulerStatus]);

  // Update chart when selected card changes
  useEffect(() => {
    if (!uiState.loading && uiState.selectedCard) {
      // Don't await to prevent blocking UI
      fetchIndexChartData(uiState.selectedCard).catch(error => {
        logger.error('Failed to fetch chart data on card change:', error);
      });
    }
  }, [uiState.selectedCard, uiState.loading, fetchIndexChartData]);

  // Loading state
  if (uiState.loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-300">
      <Navbar />
      
      {/* Scheduler Error State */}
      {schedulerError && (
        <div className="w-full bg-slate-800 border-b border-slate-600">
          <Container className="py-4">
            <ErrorState message={schedulerError} onRetry={handleSchedulerErrorRetry} />
          </Container>
        </div>
      )}
      
      <main className="w-full">
        <Container className="py-6">
          {/* Hero Dashboard */}
          <DarkHeroDashboard 
            schedulerStatus={schedulerStatus}
            totalReturn={portfolioData.totalReturn}
            todayReturn={portfolioData.todayReturn}
            portfolioValue={portfolioData.portfolioValue}
            availableCash={portfolioData.availableCash}
            alertCount={portfolioData.alertCount}
            holdingsCount={portfolioData.holdingsCount}
            lastUpdated={portfolioData.lastUpdated}
            isToggling={uiState.isToggling}
            onToggleScheduler={handleSchedulerToggle}
          />

          {/* Market Overview */}
          <Section 
            title="시장 개요" 
            subtitle="실시간 지수 현황"
            icon="📊"
            contentClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {cardData.map((data, index) => (
              <DarkMarketCard
                key={`${data.ticker}-${index}`}
                ticker={data.ticker}
                name={marketNames[index]}
                price={data.price}
                change={data.price}
                changePercent={data.rate}
                isActive={uiState.selectedCard === data.ticker}
                onClick={() => handleCardClick(data.ticker)}
              />
            ))}
          </Section>

          {/* Interactive Chart Section */}
          <Section 
            title={uiState.chartTitle}
            icon="📈"
            variant="transparent"
            className="mb-6"
          >
            {/* Stock Search */}
            <div className="mb-4">
              <StockSearch 
                onStockSelect={handleStockSelect}
                className="max-w-md"
              />
            </div>
            
            <InteractiveChart 
              data={chartData}
              selectedTicker={uiState.selectedStock ? uiState.selectedStock.symbol : uiState.selectedCard}
              height={APP_CONSTANTS.DEFAULT_CHART_HEIGHT}
            />
          </Section>

          {/* Portfolio Section */}
          <Section 
            title="포트폴리오 현황"
            icon="💼"
            variant="transparent"
            className="mb-6"
          >
            <PortfolioOverview />
          </Section>

        </Container>
      </main>
    </div>
  );
};

export default MainPage;
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import DarkHeroDashboard from "../components/dashboard/DarkHeroDashboard";
import DarkMarketCard from "../components/market/DarkMarketCard";
import InteractiveChart from "../components/charts/InteractiveChart";
import PortfolioOverview from "../components/portfolio/PortfolioOverview";
import Container from "../components/common/Container";
import Section from "../components/common/Section";
import ErrorState from "../components/common/ErrorState";
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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
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
  loading: false,
  isToggling: false,
  selectedCard: APP_CONSTANTS.DEFAULT_SELECTED_CARD,
  selectedStock: null,
  chartTitle: APP_CONSTANTS.DEFAULT_CHART_TITLE
};

const MainPage = () => {
  const [uiState, setUiState] = useState(INITIAL_UI_STATE);
  const [cardData, setCardData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [portfolioData, setPortfolioData] = useState(INITIAL_PORTFOLIO_DATA);
  const [portfolioApiData, setPortfolioApiData] = useState(null);
  const [usdKrwRate, setUsdKrwRate] = useState(APP_CONSTANTS.DEFAULT_USD_KRW_RATE);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [schedulerError, setSchedulerError] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [errors, setErrors] = useState({
    portfolio: null,
    chart: null,
    scheduler: null,
    market: null
  });
  const [lastChartUpdate, setLastChartUpdate] = useState(null);

  const marketNames = useMemo(() => APP_CONSTANTS.MARKET_NAMES, []);

  const handleError = useCallback((errorType, errorMessage) => {
    setErrors(prev => ({
      ...prev,
      [errorType]: errorMessage
    }));
    logger.error(`${errorType} 에러:`, errorMessage);
  }, []);

  const clearError = useCallback((errorType) => {
    setErrors(prev => ({
      ...prev,
      [errorType]: null
    }));
  }, []);

  const handleSchedulerStatusUpdate = useCallback((normalizedStatus, prevStatus) => {
    if (prevStatus !== normalizedStatus) {
      setTimeout(() => {
        setSchedulerStatus(current => current !== normalizedStatus ? normalizedStatus : current);
      }, APP_CONSTANTS.REACT_BATCH_UPDATE_DELAY);
      return normalizedStatus;
    }
    return prevStatus;
  }, []);

  const fetchSchedulerStatus = useCallback(async () => {

    const timerId = `fetchSchedulerStatus_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    let result;
    
    try {
      clearError('scheduler');
      
      try {
        performanceLogger.time(timerId);
        
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SCHEDULER.STATUS}`);
        result = normalizeSchedulerStatus(response.data);
        
        setSchedulerStatus(prevStatus => handleSchedulerStatusUpdate(result, prevStatus));
      } finally {
        performanceLogger.timeEnd(timerId);
      }
      
      return result;
    } catch (error) {
      logger.error("스케줄러 상태 조회 실패:", error.message);
      setSchedulerStatus(APP_CONSTANTS.SCHEDULER_STATUS.UNKNOWN);
      handleError('scheduler', '스케줄러 상태를 조회할 수 없습니다.');
      return APP_CONSTANTS.SCHEDULER_STATUS.UNKNOWN;
    }
  }, [handleSchedulerStatusUpdate, handleError, clearError]);

  const fetchUsdKrwRate = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.INDICES.USD_KRW}`);
      const result = response.data;
      
      const latestData = result[result.length - 1];
      if (latestData?.price) {
        setUsdKrwRate(latestData.price);
      }
    } catch (error) {
      logger.error("USD/KRW 환율 가져오기 실패:", error);
    }
  }, []);

  const extractAccountData = useCallback((accountData) => {
    const stockBalanceData = accountData?.stock_balance_res?.output2 || {};
    const cashBalanceData = accountData?.cash_balance_res?.output?.[0] || {};
    const holdings = accountData?.stock_balance_res?.output1 || [];
    
    return { stockBalanceData, cashBalanceData, holdings };
  }, []);

  const fetchPortfolioData = useCallback(async () => {
    try {
      clearError('portfolio');
      
      const timerId = `fetchPortfolioData_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      let accountData;
      
      try {
        performanceLogger.time(timerId);
        
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ACCOUNT}`);
        accountData = response.data;
      } finally {
        performanceLogger.timeEnd(timerId);
      }
      
      setPortfolioApiData(accountData);
      const { stockBalanceData, cashBalanceData, holdings } = extractAccountData(accountData);
      
      const usdValues = parseUSDValues(stockBalanceData, cashBalanceData);
      const krwValues = convertToKRW(usdValues, usdKrwRate);
      const totalReturn = calculateTotalReturn(krwValues.totalStockValue, krwValues.totalPurchaseValue);
      const todayReturn = calculateTodayReturn(holdings, usdKrwRate, krwValues.totalStockValue);
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
      setPortfolioApiData(null);
      handleError('portfolio', '포트폴리오 데이터를 불러올 수 없습니다.');
    }
  }, [usdKrwRate, extractAccountData, handleError, clearError]);

  const processSuccessfulToggle = useCallback(async (action) => {
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

  const handleToggleError = useCallback(async (error) => {
    logger.error('스케줄러 토글 실패:', error.response?.data || error.message);
    
    fetchSchedulerStatus().catch(statusError => {
      logger.error('Failed to re-fetch scheduler status:', statusError);
    });
    
    const action = getSchedulerAction(schedulerStatus);
    const errorMessage = createSchedulerErrorMessage(action, error.response?.data || error.message);
    setSchedulerError(errorMessage);
  }, [schedulerStatus, fetchSchedulerStatus]);
  const handleSchedulerToggle = useCallback(async () => {
    if (uiState.isToggling) return;

    try {
      setUiState(prev => ({
        loading: prev.loading,
        isToggling: true,
        selectedCard: prev.selectedCard,
        selectedStock: prev.selectedStock,
        chartTitle: prev.chartTitle
      }));
      
      const action = getSchedulerAction(schedulerStatus);
      const endpoint = action === 'enable' 
        ? API_ENDPOINTS.SCHEDULER.ENABLE 
        : API_ENDPOINTS.SCHEDULER.DISABLE;
      
      performanceLogger.time(`schedulerToggle_${action}`);
      const response = await axios.post(`${API_BASE_URL}${endpoint}`);
      
      if (response.status === 200) {
        await processSuccessfulToggle(action);
        fetchPortfolioData().catch(error => {
          logger.error('Portfolio data refresh failed after scheduler toggle:', error);
        });
      }
    } catch (error) {
      await handleToggleError(error);
    } finally {
      setUiState(prev => ({
        loading: prev.loading,
        isToggling: false,
        selectedCard: prev.selectedCard,
        selectedStock: prev.selectedStock,
        chartTitle: prev.chartTitle
      }));
      performanceLogger.timeEnd(`schedulerToggle_${getSchedulerAction(schedulerStatus)}`);
    }
  }, [uiState.isToggling, schedulerStatus, processSuccessfulToggle, handleToggleError, fetchPortfolioData]);

  const fetchIndexChartData = useCallback(async (ticker, showLoading = false) => {
    try {
      if (showLoading) {
        setChartLoading(true);
      }
      clearError('chart');
      
      const endpoint = CHART_ENDPOINTS[ticker] || API_ENDPOINTS.INDICES.NASDAQ;
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      
      const transformedData = transformChartData(response.data, 'api');
      setChartData(transformedData);
    } catch (error) {
      logger.error("차트 데이터 가져오기 실패:", ticker, error);
      setChartData([]);
      handleError('chart', '차트 데이터를 불러올 수 없습니다.');
    } finally {
      if (showLoading) {
        setChartLoading(false);
      }
    }
  }, [handleError, clearError]);

  const fetchStockChartData = useCallback(async (symbol, showLoading = false) => {
    try {
      if (showLoading) {
        setChartLoading(true);
      }
      clearError('chart');
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.STOCKS.CHART(symbol)}`);
      
      const transformedData = transformChartData(response.data, 'api');
      setChartData(transformedData);
      setLastChartUpdate({ symbol, time: Date.now() });
    } catch (error) {
      logger.error(`종목 ${symbol} 차트 데이터 가져오기 실패:`, error);
      const dummyData = generateDummyChartData(30, 100);
      setChartData(dummyData);
      handleError('chart', `종목 ${symbol} 차트 데이터를 불러올 수 없습니다.`);
    } finally {
      if (showLoading) {
        setChartLoading(false);
      }
    }
  }, [handleError, clearError]);

  const handleCardClick = useCallback((ticker) => {
    setUiState(prev => ({
      loading: prev.loading,
      isToggling: prev.isToggling,
      selectedCard: ticker,
      selectedStock: null,
      chartTitle: APP_CONSTANTS.DEFAULT_CHART_TITLE
    }));
    
    fetchIndexChartData(ticker, true).catch(error => {
      logger.error('Failed to fetch chart data on card click:', error);
    });
  }, [fetchIndexChartData]);

  const handleStockSelect = useCallback((stock) => {
    setUiState(prev => ({
      loading: prev.loading,
      isToggling: prev.isToggling,
      selectedStock: stock,
      selectedCard: null,
      chartTitle: `${stock.symbol} - ${stock.name}`
    }));
    
    // StockSearch에서 이미 차트 데이터를 가져온 경우 바로 사용
    if (stock.chartData && stock.chartData.length > 0) {
      logger.info(`Using chart data from StockSearch for ${stock.symbol}:`, stock.chartData.length, 'data points');
      const transformedData = transformChartData(stock.chartData, 'api');
      setChartData(transformedData);
      setChartLoading(false);
      clearError('chart');
      setLastChartUpdate({ symbol: stock.symbol, time: Date.now() });
    } else {
      // 차트 데이터가 없는 경우에만 별도로 요청
      logger.info(`No chart data from StockSearch for ${stock.symbol}, fetching separately`);
      fetchStockChartData(stock.symbol, true).catch(error => {
        logger.error('Failed to fetch stock chart data:', error);
      });
    }
  }, [fetchStockChartData, transformChartData, setChartData, setChartLoading, clearError]);

  const fetchMarketIndexData = useCallback(async () => {
    const indexData = [];
    const endpoints = [
      { name: 'NASDAQ', url: API_ENDPOINTS.INDICES.NASDAQ, id: 'nasdaq-index' },
      { name: 'DOW_JONES', url: API_ENDPOINTS.INDICES.DOW_JONES, id: 'dow-index' },
      { name: 'SNP500', url: API_ENDPOINTS.INDICES.SNP500, id: 'snp-index' },
      { name: 'USD_KRW', url: API_ENDPOINTS.INDICES.USD_KRW, id: 'usd-krw-index' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint.url}`);
        
        const data = response.data;
        if (data && data.length > 0) {
          indexData.push(data[data.length - 1]);
        }
      } catch (endpointError) {
        logger.warn(`${endpoint.name} 데이터 가져오기 실패:`, endpointError);
      }
    }

    return indexData;
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      clearError('market');
      
      const indexData = await fetchMarketIndexData();
      setCardData(indexData);
    } catch (error) {
      logger.error("초기 데이터 가져오기 실패:", error);
      handleError('market', '시장 데이터를 불러올 수 없습니다.');
    }
  }, [handleError, clearError, fetchMarketIndexData]);

  const fetchMarketData = useCallback(async () => {
    try {
      clearError('market');
      
      const indexData = await fetchMarketIndexData();
      setCardData(indexData);
    } catch (error) {
      logger.error("시장 데이터 가져오기 실패:", error);
      handleError('market', '시장 데이터를 불러올 수 없습니다.');
    }
  }, [handleError, clearError, fetchMarketIndexData]);

  useEffect(() => {
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

  useEffect(() => {
    if (!uiState.loading && uiState.selectedCard) {
      fetchIndexChartData(uiState.selectedCard, false).catch(error => {
        logger.error('Failed to fetch initial chart data:', error);
      });
    }
  }, [uiState.loading, uiState.selectedCard, fetchIndexChartData]);


  useEffect(() => {
    if (usdKrwRate > 0 && !uiState.loading) {
      fetchPortfolioData().catch(error => {
        logger.error('Failed to fetch portfolio data on exchange rate change:', error);
      });
    }
  }, [usdKrwRate, fetchPortfolioData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPortfolioData().catch(error => {
        logger.error('Auto-refresh portfolio data failed:', error);
      });
      
      fetchUsdKrwRate().catch(error => {
        logger.error('Auto-refresh USD/KRW rate failed:', error);
      });
      
      fetchMarketData().catch(error => {
        logger.error('Auto-refresh market data failed:', error);
      });
      
      if (uiState.selectedStock) {
        const now = Date.now();
        const timeSinceLastUpdate = lastChartUpdate && lastChartUpdate.symbol === uiState.selectedStock.symbol 
          ? now - lastChartUpdate.time 
          : Infinity;
        
        // 최근 10초 이내에 업데이트된 경우 건너뛰기
        if (timeSinceLastUpdate < 10000) {
          logger.info(`Auto-refresh: 주식 차트 데이터 최근 업데이트로 인한 건너뛰기 - ${uiState.selectedStock.symbol}`);
        } else {
          logger.info(`Auto-refresh: 주식 차트 데이터 새로고침 - ${uiState.selectedStock.symbol}`);
          fetchStockChartData(uiState.selectedStock.symbol).catch(error => {
            logger.error('Auto-refresh stock chart failed:', error);
          });
        }
      } else {
        logger.info(`Auto-refresh: 인덱스 차트 데이터 새로고침 - ${uiState.selectedCard}`);
        fetchIndexChartData(uiState.selectedCard).catch(error => {
          logger.error('Auto-refresh index chart failed:', error);
        });
      }
      
      if (!uiState.isToggling) {
        fetchSchedulerStatus().catch(error => {
          logger.error('Auto-refresh scheduler status failed:', error);
        });
      }
    }, APP_CONSTANTS.REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [uiState.isToggling, uiState.selectedCard, uiState.selectedStock, lastChartUpdate, fetchPortfolioData, fetchSchedulerStatus, fetchUsdKrwRate, fetchMarketData, fetchStockChartData, fetchIndexChartData]);



  return (
    <div className="min-h-screen bg-slate-900 text-gray-300">
      <Navbar onStockSelect={handleStockSelect} />
      
      {(schedulerError || errors.scheduler) && (
        <div className="w-full bg-slate-800 border-b border-slate-600">
          <Container className="py-4">
            <ErrorState message={schedulerError || errors.scheduler} showRetryInfo={true} />
          </Container>
        </div>
      )}
      
      <main className="w-full">
        <Container className="py-6">
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

          <Section 
            title="시장 개요" 
            subtitle="실시간 지수 현황"
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

          <Section 
            title={uiState.chartTitle}
            variant="transparent"
            className="mb-6"
          >
            <InteractiveChart 
              data={chartData}
              selectedTicker={uiState.selectedStock ? uiState.selectedStock.symbol : uiState.selectedCard}
              height={APP_CONSTANTS.DEFAULT_CHART_HEIGHT}
              loading={chartLoading}
            />
          </Section>

          <Section 
            title="포트폴리오 현황"
            variant="transparent"
            className="mb-6"
          >
            <PortfolioOverview 
              portfolioData={portfolioApiData}
              error={errors.portfolio}
            />
          </Section>

        </Container>
      </main>
    </div>
  );
};

export default MainPage;
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DarkHeroDashboard from "../components/dashboard/DarkHeroDashboard";
import DarkMarketCard from "../components/market/DarkMarketCard";
import InteractiveChart from "../components/charts/InteractiveChart";
import PortfolioOverview from "../components/portfolio/PortfolioOverview";
import Container from "../components/common/Container";
import Section from "../components/common/Section";
import axios from "axios";

// 환경변수에서 API 기본 URL 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const MainPage = () => {
  const [cardData, setCardData] = useState([]);
  const [chartData, setChartData] = useState([]); // 차트용 데이터 추가
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState('COMP');
  const [usdKrwRate, setUsdKrwRate] = useState(1300); // USD/KRW 환율
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [isToggling, setIsToggling] = useState(false); // 토글 중 상태
  
  // Hero Dashboard 데이터
  const [portfolioData, setPortfolioData] = useState({
    totalReturn: 0,
    todayReturn: 0,
    portfolioValue: 0,
    availableCash: 0,
    alertCount: 0,
    holdingsCount: 0,
    lastUpdated: new Date()
  });

  const fetchSchedulerStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/scheduler/status`);
      const statusText = String(res.data).trim();
      
      let normalizedStatus;
      if (statusText.includes("비활성화됨")) {
        normalizedStatus = "DISABLED";
      } else if (statusText.includes("활성화됨")) {
        normalizedStatus = "ENABLED";
      } else {
        normalizedStatus = "UNKNOWN";
      }
      
      if (schedulerStatus !== normalizedStatus) {
        setSchedulerStatus(normalizedStatus);
        
        // React 18 배치 업데이트 고려
        setTimeout(() => {
          setSchedulerStatus(prevStatus => {
            if (prevStatus !== normalizedStatus) {
              return normalizedStatus;
            }
            return prevStatus;
          });
        }, 100);
      }
      
      return normalizedStatus;
    } catch (e) {
      console.error("스케줄러 상태 조회 실패:", e.message);
      setSchedulerStatus("UNKNOWN");
      return "UNKNOWN";
    }
  };

  const toggleScheduler = async () => {
    if (isToggling) {
      return;
    }

    try {
      setIsToggling(true);
      
      const isCurrentlyEnabled = schedulerStatus === 'ENABLED';
      const action = isCurrentlyEnabled ? "disable" : "enable";
      
      const response = await axios.post(`${API_BASE_URL}/scheduler/${action}`);
      
      if (response.status === 200) {
        // 백엔드 처리 완료를 위한 대기 시간
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const actualStatus = await fetchSchedulerStatus();
        const expectedStatus = action === 'enable' ? 'ENABLED' : 'DISABLED';
        const isExpectedResult = actualStatus === expectedStatus;
        
        if (!isExpectedResult) {
          // 최대 3번 재시도
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const retryStatus = await fetchSchedulerStatus();
            if (retryStatus === expectedStatus) {
              break;
            }
            
            if (retryCount === maxRetries) {
              alert('상태 변경이 완료되지 않았습니다. 페이지를 새로고침해주세요.');
            }
          }
        }
        
        // 포트폴리오 데이터도 새로고침
        await fetchPortfolioData();
      }
    } catch (error) {
      console.error('스케줄러 토글 실패:', error.response?.data || error.message);
      
      // 에러 발생 시 현재 상태 재확인
      await fetchSchedulerStatus();
      
      const actionText = schedulerStatus === 'ENABLED' ? '비활성화' : '활성화';
      alert(`자동매매 ${actionText}에 실패했습니다.\n오류: ${error.response?.data || error.message}`);
    } finally {
      setIsToggling(false);
    }
  };

  // USD/KRW 환율 가져오기
  const fetchUsdKrwRate = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/indices/usd-krw`);
      const latestData = response.data[response.data.length - 1];
      if (latestData && latestData.price) {
        setUsdKrwRate(latestData.price);
      }
    } catch (error) {
      console.error("USD/KRW 환율 가져오기 실패:", error);
      // 실패 시 기본값 1300 유지
    }
  };


  // 포트폴리오 데이터 가져오기 함수
  const fetchPortfolioData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/account`);
      const accountData = response.data;
      
      // 주식 잔고 데이터
      const stockBalanceData = accountData.stock_balance_res.output2;
      const cashBalanceData = accountData.cash_balance_res.output[0];
      const holdings = accountData.stock_balance_res.output1 || [];
      
      // USD 기준 값들
      const totalStockValueUSD = parseFloat(stockBalanceData.tot_evlu_pfls_amt || 0); // 총 평가손익금액
      const totalPurchaseValueUSD = parseFloat(stockBalanceData.pchs_amt_smtl_amt || 0); // 매입금액 합계
      const cashValueUSD = parseFloat(cashBalanceData.frcr_dncl_amt1 || 0); // 외화 예수금
      
      // USD를 KRW로 환산 (실시간 환율 사용)
      const usdToKrw = usdKrwRate;
      const totalStockValue = totalStockValueUSD * usdToKrw;
      const totalPurchaseValue = totalPurchaseValueUSD * usdToKrw;
      const cashValue = cashValueUSD * usdToKrw;
      const totalPortfolioValue = totalStockValue + cashValue;
      
      // 수익률 계산
      let totalReturnPercent = 0;
      if (totalPurchaseValue > 0) {
        const totalProfitLoss = totalStockValue - totalPurchaseValue;
        totalReturnPercent = (totalProfitLoss / totalPurchaseValue) * 100;
      }
      
      // 오늘 수익률 계산 (전일 대비 변동률)
      let todayReturnPercent = 0;
      let totalTodayProfitLoss = 0;
      
      holdings.forEach(holding => {
        const currentPrice = parseFloat(holding.ovrs_now_pric1 || 0);
        const prevPrice = parseFloat(holding.prpr || currentPrice); // 전일종가 (없으면 현재가로 대체)
        const quantity = parseFloat(holding.ovrs_cblc_qty || 0);
        
        if (prevPrice > 0 && quantity > 0) {
          const dailyChange = (currentPrice - prevPrice) * quantity * usdToKrw;
          totalTodayProfitLoss += dailyChange;
        }
      });
      
      if (totalStockValue > 0) {
        todayReturnPercent = (totalTodayProfitLoss / totalStockValue) * 100;
      }
      
      
      // 알림 개수 계산 (손실이 -5% 이상이면 알림)
      let alertCount = 0;
      if (totalReturnPercent < -5) alertCount++;
      if (todayReturnPercent < -3) alertCount++;
      
      setPortfolioData({
        totalReturn: totalReturnPercent,
        todayReturn: todayReturnPercent,
        portfolioValue: totalPortfolioValue,
        availableCash: cashValue,
        alertCount,
        holdingsCount: holdings.length,
        lastUpdated: new Date()
      });
      
    } catch (error) {
      console.error("포트폴리오 데이터 가져오기 실패:", error);
      // 에러 발생 시 기본값 설정
      setPortfolioData({
        totalReturn: 0,
        todayReturn: 0,
        portfolioValue: 0,
        availableCash: 0,
        alertCount: 1, // API 연결 실패 알림
        holdingsCount: 0,
        lastUpdated: new Date()
      });
    }
  };

  // 차트 데이터 가져오기 함수
  const fetchChartData = async (ticker) => {
    try {
      let endpoint;
      switch(ticker) {
        case 'COMP':
          endpoint = '/indices/nasdaq';
          break;
        case '.DJI':
          endpoint = '/indices/dow-jones';
          break;
        case 'SPX':
          endpoint = '/indices/snp500';
          break;
        case 'FX@KRW':
          endpoint = '/indices/usd-krw';
          break;
        default:
          endpoint = '/indices/nasdaq';
      }
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const apiData = response.data;
      
      // API 데이터를 차트 형식으로 변환
      const chartFormattedData = apiData.map((item, index) => {
        // API에서 date 필드를 사용하여 timestamp 생성
        const dateObj = item.date ? new Date(item.date) : new Date(Date.now() - (apiData.length - index) * 24 * 60 * 60 * 1000);
        
        return {
          date: item.date || dateObj.toISOString().split('T')[0],
          timestamp: dateObj.getTime(),
          price: parseFloat(item.price) || 0,
          volume: Math.floor(Math.random() * 1000000) + 500000, // Placeholder volume data
          ticker: ticker
        };
      });
      
      setChartData(chartFormattedData);
    } catch (error) {
      console.error("차트 데이터 가져오기 실패:", ticker, error);
      setChartData([]); // 실패 시 빈 배열로 설정
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const indexResponses = await Promise.all([
          axios.get(`${API_BASE_URL}/indices/nasdaq`),
          axios.get(`${API_BASE_URL}/indices/dow-jones`),
          axios.get(`${API_BASE_URL}/indices/snp500`),
          axios.get(`${API_BASE_URL}/indices/usd-krw`)
        ]);

        const cardData = indexResponses.map(response => {
          const data = response.data;
          return data.length > 0 ? data[data.length - 1] : null;
        }).filter(item => item !== null);
        
        setCardData(cardData);
        
        // 기본 선택된 카드의 차트 데이터 가져오기
        if (cardData.length > 0) {
          fetchChartData(selectedCard);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchSchedulerStatus();
    fetchUsdKrwRate(); // 환율 먼저 가져오기
  }, []);

  // 환율이 업데이트되면 포트폴리오 데이터 다시 가져오기
  useEffect(() => {
    if (usdKrwRate > 0 && !loading) {
      fetchPortfolioData();
    }
  }, [usdKrwRate]);

  // 30초마다 데이터 자동 새로고침 (토글 중일 때는 스케줄러 상태 조회 건너뛰기)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchPortfolioData();
        
        // 토글 중이 아닐 때만 스케줄러 상태 조회
        if (!isToggling) {
          fetchSchedulerStatus();
        }
      }
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, [loading, isToggling]);


  // 선택된 카드가 변경될 때마다 차트 데이터 업데이트
  useEffect(() => {
    if (!loading && selectedCard) {
      fetchChartData(selectedCard);
    }
  }, [selectedCard, loading]);

  const handleCardClick = (ticker) => {
    setSelectedCard(ticker);
  };

  if (loading) {
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
            isToggling={isToggling}
            onToggleScheduler={toggleScheduler}
          />

          {/* Market Overview */}
          <Section 
            title="시장 개요" 
            subtitle="실시간 지수 현황"
            icon="📊"
            contentClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {cardData.map((data, index) => {
              const names = ['NASDAQ', 'DOW JONES', 'S&P 500', 'USD/KRW'];
              return (
                <DarkMarketCard
                  key={`${data.ticker}-${index}`}
                  ticker={data.ticker}
                  name={names[index]}
                  price={data.price}
                  change={data.price}
                  changePercent={data.rate}
                  isActive={selectedCard === data.ticker}
                  onClick={() => handleCardClick(data.ticker)}
                />
              );
            })}
          </Section>

          {/* Interactive Chart Section */}
          <Section 
            title="인터랙티브 차트" 
            icon="📈"
            variant="transparent"
            className="mb-6"
          >
            <InteractiveChart 
              data={chartData}
              selectedTicker={selectedCard}
              height={400}
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
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DarkHeroDashboard from "../components/dashboard/DarkHeroDashboard";
import DarkMarketCard from "../components/market/DarkMarketCard";
import InteractiveChart from "../components/charts/InteractiveChart";
import Container from "../components/common/Container";
import Section from "../components/common/Section";
import axios from "axios";

// 환경변수에서 API 기본 URL 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const MainPage = () => {
  const [cardData, setCardData] = useState([]);
  const [chartData, setChartData] = useState([]); // 차트용 데이터 추가
  const [loading, setLoading] = useState(true);
  const [schedulerStatus, setSchedulerStatus] = useState("unknown");
  const [selectedCard, setSelectedCard] = useState('COMP');
  
  // Hero Dashboard 데이터
  const [portfolioData, setPortfolioData] = useState({
    totalReturn: 12.34,
    todayReturn: 2.1,
    portfolioValue: 125430000,
    availableCash: 24570000,
    activeStrategies: 3,
    alertCount: 3
  });

  const fetchSchedulerStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/scheduler/status`);
      setSchedulerStatus(res.data);
    } catch (e) {
      console.error("스케줄러 상태 조회 실패:", e);
    }
  };

  const toggleScheduler = async () => {
    try {
      const newStatus = schedulerStatus !== 'ENABLED';
      await axios.post(`${API_BASE_URL}/scheduler/${newStatus ? "enable" : "disable"}`);
      fetchSchedulerStatus();
    } catch (e) {
      console.error("스케줄러 상태 변경 실패:", e);
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
      const chartFormattedData = apiData.map((item, index) => ({
        date: item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : 
              new Date(Date.now() - (apiData.length - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timestamp: item.timestamp || (Date.now() - (apiData.length - index) * 24 * 60 * 60 * 1000),
        price: item.price || 0,
        volume: Math.floor(Math.random() * 1000000) + 500000, // 임시 거래량 데이터
        ticker: ticker
      }));
      
      setChartData(chartFormattedData);
    } catch (error) {
      console.error("차트 데이터 가져오기 실패:", error);
      setChartData([]); // 실패 시 빈 배열로 설정하여 샘플 데이터 사용
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
  }, []);

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
            activeStrategies={portfolioData.activeStrategies}
            alertCount={portfolioData.alertCount}
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
            variant="card"
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
            title="포트폴리오" 
            icon="💼"
            variant="card"
            className="mb-6"
            contentClassName="h-64 bg-slate-700 rounded-lg flex items-center justify-center"
          >
            <p className="text-slate-400">포트폴리오 영역 (구현 예정)</p>
          </Section>

          {/* Strategy Section */}
          <Section 
            title="자동매매 전략" 
            icon="🤖"
            variant="card"
            contentClassName="h-48 bg-slate-700 rounded-lg flex items-center justify-center"
          >
            <p className="text-slate-400">전략 관리 영역 (구현 예정)</p>
          </Section>
        </Container>
      </main>
    </div>
  );
};

export default MainPage;
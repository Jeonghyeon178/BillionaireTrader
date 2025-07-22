import React, { useEffect, useState } from "react";
import SideNav from "../components/SideNav";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import DetailedCard from "../components/DetailedCard";
import axios from "axios";

// 환경변수에서 API 기본 URL 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const MainPage = () => {
  const [cardData, setCardData] = useState([]);
  const [allIndexData, setAllIndexData] = useState({}); // 모든 인덱스 데이터 저장
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulerStatus, setSchedulerStatus] = useState("unknown");

  const fetchSchedulerStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/scheduler/status`);
      setSchedulerStatus(res.data);
    } catch (e) {
      console.error("스케줄러 상태 조회 실패:", e);
    }
  };

  const toggleScheduler = async (enable) => {
    try {
      await axios.post(`${API_BASE_URL}/scheduler/${enable ? "enable" : "disable"}`);
      fetchSchedulerStatus();
    } catch (e) {
      console.error("스케줄러 상태 변경 실패:", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 백엔드 API 변경사항 적용: /api/indices/{name} 형태로 변경
        // 각 지수에대해 최신 데이터 1개씩만 가져오기
        const [indexResponses, pieResponse] = await Promise.all([
          Promise.all([
            axios.get(`${API_BASE_URL}/indices/nasdaq`),
            axios.get(`${API_BASE_URL}/indices/dow-jones`),
            axios.get(`${API_BASE_URL}/indices/snp500`),
            axios.get(`${API_BASE_URL}/indices/usd-krw`)
          ]),
          axios.get(`${API_BASE_URL}/account`),
        ]);

        // 모든 인덱스 데이터를 저장
        const indexNames = ['nasdaq', 'dow-jones', 'snp500', 'usd-krw'];
        const allIndexData = {};
        indexResponses.forEach((response, index) => {
          allIndexData[indexNames[index]] = response.data;
        });

        // 각 지수에서 최신 데이터 1개씩 추출
        const cardData = indexResponses.map(response => {
          const data = response.data;
          // 배열에서 최신 데이터 (마지막 요소) 추출
          return data.length > 0 ? data[data.length - 1] : null;
        }).filter(item => item !== null);
        
        setAllIndexData(allIndexData);
        setCardData(cardData);
        setLineData(allIndexData.nasdaq); // nasdaq 데이터를 기본 차트로 사용
        setPieData(pieResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchSchedulerStatus(); // 상태 초기 조회
  }, []);

  const handleCardClick = (ticker) => {
    // ticker를 지수 이름으로 매핑
    const indexNameMap = {
      'COMP': 'nasdaq',
      '.DJI': 'dow-jones',
      'SPX': 'snp500',
      'FX@KRW': 'usd-krw'
    };
    const indexName = indexNameMap[ticker] || ticker;
    
    // 이미 가져온 데이터에서 해당 인덱스 데이터를 사용
    if (allIndexData[indexName]) {
      setLineData(allIndexData[indexName]);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
    );
  }

  return (
      <div className="m-0 font-sans text-base antialiased font-normal leading-default bg-gray-50 text-slate-500">
        <div className="absolute w-full bg-blue-500 min-h-72"></div>
        <SideNav />
        <main className="relative h-full max-h-screen transition-all duration-200 ease-in-out xl:ml-72 rounded-xl">
          <Navbar />
          <div className="w-full px-6 py-6 mx-auto">
            <div className="mb-4 flex gap-4 items-center">
              <span>스케줄러 상태: {schedulerStatus}</span>
              <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={() => toggleScheduler(true)}
              >
                활성화
              </button>
              <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => toggleScheduler(false)}
              >
                비활성화
              </button>
            </div>

            {/* 카드 및 상세 */}
            <div className="flex flex-wrap -mx-3">
              {cardData.map((data, index) => (
                  <Card
                      key={index}
                      index={data.ticker}
                      rate={data.rate}
                      value={data.price}
                      onClick={() => handleCardClick(data.ticker)}
                  />
              ))}
            </div>
            <DetailedCard row={1} data1={lineData} data2={pieData} />
          </div>
        </main>
      </div>
  );
};

export default MainPage;

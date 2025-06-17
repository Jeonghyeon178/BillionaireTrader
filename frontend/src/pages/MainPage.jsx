import React, { useEffect, useState } from "react";
import SideNav from "../components/SideNav";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import DetailedCard from "../components/DetailedCard";
import axios from "axios";

const MainPage = () => {
  const [cardData, setCardData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulerStatus, setSchedulerStatus] = useState("unknown");

  const fetchSchedulerStatus = async () => {
    try {
      const res = await axios.get("/api/scheduler/status");
      setSchedulerStatus(res.data);
    } catch (e) {
      console.error("스케줄러 상태 조회 실패:", e);
    }
  };

  const toggleScheduler = async (enable) => {
    try {
      await axios.post(`/api/scheduler/${enable ? "enable" : "disable"}`);
      fetchSchedulerStatus();
    } catch (e) {
      console.error("스케줄러 상태 변경 실패:", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cardResponse, lineResponse, pieResponse] = await Promise.all([
          axios.get("/api/index"),
          axios.get("/api/index/COMP"),
          axios.get("/api/account"),
        ]);

        setCardData(cardResponse.data);
        setLineData(lineResponse.data);
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

  const handleCardClick = async (ticker) => {
    try {
      const res = await axios.get(`/api/index/${ticker}`);
      setLineData(res.data);
    } catch (error) {
      console.error("Error fetching detailed line data:", error);
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

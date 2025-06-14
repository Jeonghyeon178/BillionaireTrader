import React, { useEffect, useState } from "react";
import SideNav from "../components/SideNav";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import DetailedCard from "../components/DetailedCard";
import axios from "axios";
import LineChart from "../components/LineChart";

const MainPage = () => {
  const [cardData, setCardData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 관리

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // 로딩 시작
        const [cardResponse, lineResponse, pieResponse] = await Promise.all([
          axios.get("http://localhost:8080/index"),
          axios.get("http://localhost:8080/index/COMP"),
          axios.get("http://localhost:8080/account"),
        ]);

        // 모든 응답이 완료된 후 상태 업데이트
        setCardData(cardResponse.data);
        setLineData(lineResponse.data);
        setPieData(pieResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchData();
  }, []);

  const handleCardClick = async (ticker) => {
    try {
      const res = await axios.get(`http://localhost:8080/index/${ticker}`);
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
    ); // 데이터를 가져오는 동안 로딩 화면 표시
  }

  return (
    <div className="m-0 font-sans text-base antialiased font-normal leading-default bg-gray-50 text-slate-500">
      <div className="absolute w-full bg-blue-500 min-h-72"></div>
      <SideNav />
      <main className="relative h-full max-h-screen transition-all duration-200 ease-in-out xl:ml-72 rounded-xl">
        <Navbar />
        <div className="w-full px-6 py-6 mx-auto">
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

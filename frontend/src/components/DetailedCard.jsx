import React from "react";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import SearchHistory from "./SearchHistory";

const DetailedCard = ({ row, data1, data2 }) => {
  const renderFirstComponent = (row) => {
    switch (row) {
      case 1:
        return <LineChart data={data1} />;
      case 2:
        return (
          <div>
            <h1>I dont know what to do this.</h1>
          </div>
        );
      default:
        return null;
    }
  };
  const renderSecondComponent = (row) => {
    switch (row) {
      case 1:
        return <PieChart data={data2} />;
      case 2:
        return <SearchHistory />;
      default:
        return null;
    }
  };

  return (
    // 나중에 div 정리하기
    <div className="flex flex-wrap mt-6 -mx-3">
      <div className="w-full max-w-full px-3 mt-0 lg:w-7/12 lg:flex-none">
        <div className="border-black shadow-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
          <div className="flex-auto p-4">{renderFirstComponent(row)}</div>
        </div>
      </div>
      <div className="w-full max-w-full px-3 lg:w-5/12 lg:flex-none">
        <div className="h-full flex-auto p-4 break-words rounded-2xl border-0 border-solid bg-white bg-clip-border border-black shadow-xl relative z-20">
          {renderSecondComponent(row)}
        </div>
      </div>
    </div>
  );
};

export default DetailedCard;

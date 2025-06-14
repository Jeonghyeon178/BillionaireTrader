import React from "react";

const Card = ({ index, rate, value, onClick }) => {
  return (
    <div
      className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4"
      onClick={onClick}
    >
      <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border">
        <div className="flex-auto p-4">
          <div className="flex flex-row -mx-3">
            <div className="flex-none w-2/3 max-w-full px-3">
              <div>
                <p className="mb-0 text-sm font-semibold leading-normal uppercase ">
                  {index}
                </p>
                <h5 className="mb-2 font-bold">{value}</h5>
                <p className="mb-0">
                  {/* 변동률에 따라 텍스트 색상 변화 필요 */}
                  <span
                    className={`mx-1 text-sm font-bold leading-normal ${
                      rate > 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {rate > 0 ? "+" : ""}
                    {rate}%
                  </span>
                  since yesterday
                </p>
              </div>
            </div>
            <div className="px-3 text-right basis-1/3">
              {/* 이미지 들어가는 공간. */}
              <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500">
                <i className="ni leading-none ni-money-coins text-lg relative top-3.5 text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Card;

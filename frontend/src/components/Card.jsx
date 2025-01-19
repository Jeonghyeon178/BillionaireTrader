import React from "react";

const Card = ({ index, rate, value }) => {
  return (
    // 차례대로 다우존스, s&p, nasdaq, 원달러
    <div class="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
      <div class="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border">
        <div class="flex-auto p-4">
          <div class="flex flex-row -mx-3">
            <div class="flex-none w-2/3 max-w-full px-3">
              <div>
                <p class="mb-0 text-sm font-semibold leading-normal uppercase ">
                  {index}
                </p>
                <h5 class="mb-2 font-bold">{value}</h5>
                <p class="mb-0">
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
            <div class="px-3 text-right basis-1/3">
              {/* 이미지 들어가는 공간. */}
              <div class="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500">
                <i class="ni leading-none ni-money-coins text-lg relative top-3.5 text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Card;

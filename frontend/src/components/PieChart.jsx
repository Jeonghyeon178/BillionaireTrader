import React from "react";
import ReactApexChart from "react-apexcharts";

const PieChart = ({ data }) => {
  const cashBalance = parseFloat(
    data.cash_balance_res.output[0].frcr_dncl_amt1
  );
  const stockValues = data.stock_balance_res.output1.map((item) => ({
    value: parseFloat(item.ovrs_stck_evlu_amt),
    name: item.ovrs_item_name,
  }));
  // 파이차트 시리즈와 라벨 생성
  const series = [cashBalance, ...stockValues.map((stock) => stock.value)];
  const labels = ["보유 현금", ...stockValues.map((stock) => stock.name)];

  const state = {
    series: series,
    options: {
      chart: {
        type: "donut",
      },
      labels: labels,
      title: {
        text: "Investment Distribution",
        width: 300,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  return (
    <ReactApexChart
      options={state.options}
      series={state.series}
      type="pie"
      height={360}
    />
  );
};

export default PieChart;

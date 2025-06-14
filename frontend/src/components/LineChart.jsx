import React from "react";
import ReactApexChart from "react-apexcharts";

const LineChart = ({ data }) => {
  // output2가 정의되지 않았을 때 기본값을 빈 배열로 설정
  const formattedData = (data || []).map((item) => ({
    x: new Date(
      item.date?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") || Date.now()
    ),
    y: item.price || 0, // 값이 없으면 기본값 0
  }));

  const state = {
    series: [
      {
        name: "Stock Price",
        data: formattedData,
      },
    ],
    options: {
      chart: {
        type: "area",
        stacked: false,
        height: 350,
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          autoSelected: "zoom",
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      title: {
        text: "Price Movement",
        align: "left",
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val;
          },
        },
        title: {
          text: "Price",
        },
      },
      xaxis: {
        type: "datetime",
      },
      tooltip: {
        shared: false,
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
    },
  };

  return (
    <ReactApexChart
      options={state.options}
      series={state.series}
      type="area"
      height={350}
    />
  );
};

export default LineChart;

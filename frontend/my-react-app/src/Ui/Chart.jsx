import React from "react";
import ReactApexChart from "react-apexcharts";

const ChartComponent = () => {
  const options = {
    chart: {
      id: "basic-bar",
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995],
    },
  };

  const series = [
    {
      name: "series-1",
      data: [30, 40, 35, 50, 49],
    },
  ];

  return (
    <div>
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default ChartComponent;

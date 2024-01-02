// FavoriteStock.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "./FavoriteStock.css"; // Make sure this CSS file exists

const FavoriteStock = ({ symbol, onClick }) => {
  const [stockData, setStockData] = useState({
    high: 0,
    low: 0,
    current: 0,
    chartData: {
      labels: [],
      datasets: []
    },
  });

  useEffect(() => {
    const fetchStockData = async () => {
      const apiKey = "pk_302c7bd6ee464d738f364961b88569ee";
      const chartUrl = `https://cloud.iexapis.com/stable/stock/${symbol}/chart/1m?token=${apiKey}`;
      const quoteUrl = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${apiKey}`;

      try {
        const chartResponse = await axios.get(chartUrl);
        const chartData = chartResponse.data?.map(data => ({
          x: data.date,
          y: data.close
        })) || [];

        const quoteResponse = await axios.get(quoteUrl);
        const { high, low, latestPrice: current } = quoteResponse.data || {};

        setStockData({
          high: high || 0,
          low: low || 0,
          current: current || 0,
          chartData: {
            labels: chartData.map(data => data.x),
            datasets: [{
              label: `${symbol} Price`,
              data: chartData.map(data => data.y),
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.5)",
              fill: false
            }]
          }
        });
      } catch (error) {
        console.error("Error fetching stock data: ", error);
      }
    };

    fetchStockData();
  }, [symbol]);

  return (
    <div className="favorite-stock-container" onClick={() => onClick(symbol)}>
      <h3>{symbol}</h3>
      {stockData.chartData.datasets.length > 0 && (
        <Line data={stockData.chartData} /* Options and other props */ />
      )}
      <p>High: {stockData.high}</p>
      <p>Low: {stockData.low}</p>
      <p>Current: {stockData.current}</p>
    </div>
  );
};

export default FavoriteStock;

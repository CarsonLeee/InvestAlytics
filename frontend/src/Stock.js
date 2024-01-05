import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "./Stock.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const timePeriods = ["1d", "5d", "1m", "6m", "1y", "5y", "max"];
const analysisOptions = [
  "Simple Moving Average",
  "Exponential Moving Average",
  "Relative Strength Index",
  "Bollinger Bands",
  "MACD",
  "Stochastic Oscillator",
  "Fibonacci Retracement",
];

const Stock = ({ selectedStock, onClose, onFavoriteAdded, favorites }) => {
  const [stockInfo, setStockInfo] = useState({ high: 0, low: 0, current: 0 });
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1m");
  const [tickerData, setTickerData] = useState([]);
  const [fullStockData, setFullStockData] = useState([]);
  const [prediction, setPrediction] = useState(""); // State for overall prediction
  const [taPrediction, setTAPrediction] = useState(""); // State for Technical Analysis Prediction
  const [isFavorite, setIsFavorite] = useState(
    favorites.includes(selectedStock)
  );
  const [stockData, setStockData] = useState({
    labels: [],
    datasets: [
      {
        label: `${selectedStock} Stock Price`,
        data: [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.5)",
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "black",
      },
    ],
  });

  const closeStock = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleMLPrediction = async () => {
    if (selectedStock !== "TSLA") {
      alert("ML prediction is only available for TSLA stock.");
      return;
    }

    if (fullStockData.length === 0) {
      alert("No data available for prediction.");
      return;
    }

    // Get the latest available full data point
    const latestDataPoint = fullStockData[fullStockData.length - 1];

    console.log("Latest Full Data Point:", latestDataPoint); // Debugging

    // Check if all required fields are available
    const requiredFields = ["open", "high", "low", "close", "volume"];
    const missingFields = requiredFields.filter(
      (field) => latestDataPoint[field] === undefined
    );

    if (missingFields.length > 0) {
      alert(
        "Data is incomplete for prediction. Missing fields: " +
          missingFields.join(", ")
      );
      return;
    }

    const features = {
      Open: latestDataPoint.open,
      High: latestDataPoint.high,
      Low: latestDataPoint.low,
      Close: latestDataPoint.close,
      Volume: latestDataPoint.volume,
    };

    const lastClosePrice = fullStockData[fullStockData.length - 1].close; // Get the last closing price

    try {
      const response = await axios.post("http://localhost:3001/predict", {
        features,
        stockSymbol: selectedStock,
        lastClose: lastClosePrice, // Pass the last closing price in the request
      });

      console.log("Received prediction response:", response);

      // Assuming the prediction is returned in the response
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error("Error fetching ML prediction:", error);
      alert("Failed to fetch prediction");
    }
  };

  const handleToggleFavorite = async () => {
    const userId = localStorage.getItem("userId");
    try {
      if (isFavorite) {
        // If it's already a favorite, send a DELETE request to remove it
        await axios.delete(`http://localhost:3001/user/${userId}/favorites`, {
          data: { stockSymbol: selectedStock },
        });
      } else {
        // If it's not a favorite, send a POST request to add it
        await axios.post(`http://localhost:3001/user/${userId}/favorites`, {
          stockSymbol: selectedStock,
        });
      }
      setIsFavorite(!isFavorite); // Toggle local favorite state
      if (onFavoriteAdded) {
        onFavoriteAdded(); // Trigger re-fetching of favorites in the parent component
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const handleFavorite = async () => {
    const userId = localStorage.getItem("userId");
    try {
      await axios.post(`http://localhost:3001/user/${userId}/favorites`, {
        stockSymbol: selectedStock,
      });
      console.log("Added to favorites");
      if (onFavoriteAdded) {
        onFavoriteAdded(); // Invoke the callback when the favorite is added successfully
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const calculatePrediction = async () => {
    let weightedScore = 0;
    const weights = {
      "Simple Moving Average": 1.1,
      "Exponential Moving Average": 1.3,
      "Relative Strength Index": 1.5,
      "Bollinger Bands": 1.2,
      MACD: 1.4,
      "Stochastic Oscillator": 1.2,
      "Fibonacci Retracement": 1.0,
    };
    const threshold = 3; // Define the threshold for buy/sell decision

    try {
      for (const analysisType of analysisOptions) {
        const trend = await handleAnalysisOptionClick(analysisType, false);
        const weight = weights[analysisType];

        if (trend.toLowerCase() === "bullish") {
          weightedScore += weight;
        } else if (trend.toLowerCase() === "bearish") {
          weightedScore -= weight;
        }
        // Neutral trends do not affect the score
      }

      let decision = "Hold Stock"; // Default decision
      if (weightedScore >= threshold) {
        decision = "Buy Stock";
      } else if (weightedScore <= -threshold) {
        decision = "Sell Stock";
      }

      setTAPrediction(decision); // Update TA prediction state
    } catch (error) {
      setTAPrediction("Error in prediction");
    }
  };

  const parseChartData = (data) => {
    const chartData = {
      labels: [],
      datasets: [
        {
          label: `${selectedStock} Stock Price`,
          data: [],
          borderColor: "rgba(75,192,192,1)",
          fill: false,
        },
      ],
    };
    const fullData = [];

    data.forEach((dayData) => {
      chartData.labels.push(dayData.date);
      chartData.datasets[0].data.push(dayData.close); // Only push closing price here
      fullData.push({
        open: dayData.open,
        high: dayData.high,
        low: dayData.low,
        close: dayData.close,
        volume: dayData.volume,
      });
    });

    return { chartData, fullData };
  };

  const fetchChartData = async () => {
    try {
      const apiKey = "pk_fa779df6b79c4e499e1d7114377e9684";
      const url = `https://cloud.iexapis.com/stable/stock/${selectedStock}/chart/${selectedTimePeriod}?token=${apiKey}`;

      const response = await axios.get(url);
      if (response.data) {
        console.log("Fetched Data:", response.data); // Log the fetched data
        const { chartData, fullData } = parseChartData(response.data);
        setStockData(chartData); // Set chart data for rendering the chart
        setFullStockData(fullData); // Set full data for predictions

        if (response.data.length > 0) {
          const lastDayData = response.data[response.data.length - 1];
          console.log("Last Day Data:", lastDayData); // Log the last day's data
          setStockInfo({
            high: lastDayData.high,
            low: lastDayData.low,
            current: lastDayData.close,
          });
        }
      } else {
        console.log("No data received.");
      }
    } catch (error) {
      console.error("Error fetching stock time series data:", error);
    }
  };

  const options = {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const handleAnalysisOptionClick = async (analysisType, showAlert = true) => {
    try {
      let url = "";
      switch (analysisType) {
        case "Simple Moving Average":
          url = `http://localhost:3001/sma/${selectedStock}/${selectedTimePeriod}`;
          break;
        case "Exponential Moving Average":
          url = `http://localhost:3001/ema/${selectedStock}/${selectedTimePeriod}`;
          break;
        case "Relative Strength Index":
          url = `http://localhost:3001/rsi/${selectedStock}/${selectedTimePeriod}`;
          break;
        case "Bollinger Bands":
          url = `http://localhost:3001/bollinger-bands/${selectedStock}/${selectedTimePeriod}`;
          break;
        case "MACD":
          url = `http://localhost:3001/macd/${selectedStock}/${selectedTimePeriod}`;
          break;
        case "Stochastic Oscillator":
          url = `http://localhost:3001/stochastic/${selectedStock}/${selectedTimePeriod}`;
          break;
        case "Fibonacci Retracement":
          url = `http://localhost:3001/fibonacci/${selectedStock}/${selectedTimePeriod}`;
          break;
        default:
          console.error("Unrecognized analysis type:", analysisType);
          return "error";
      }

      const response = await axios.get(url);
      console.log(`Trend for ${analysisType}:`, response.data.trend); // Log the trend

      if (showAlert) {
        alert(`Trend for ${analysisType}: ${response.data.trend}`);
      }
      return response.data.trend;
    } catch (error) {
      console.error("Error performing analysis for", analysisType, ":", error);
      return "error"; // Return a default value in case of an error
    }
  };

  useEffect(() => {
    const fetchTickerData = async () => {
      const apiKey = "pk_fa779df6b79c4e499e1d7114377e9684";
      const symbols =
        "AAPL,MSFT,AMZN,GOOGL,FB,BABA,TSLA,V,JPM,JNJ,BRK.A,XOM,BAC,PG,WMT,DIS,VZ,PFE,CVX,KO,PEP,CSCO,MRK,INTC,CMCSA";
      const url = `https://cloud.iexapis.com/stable/stock/market/batch?symbols=${symbols}&types=quote,previous&token=${apiKey}`;

      try {
        const response = await axios.get(url);
        setTickerData(response.data);
      } catch (error) {
        console.error("Error fetching ticker data: ", error);
      }
    };

    fetchTickerData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [selectedStock, selectedTimePeriod]);

  return (
    <div
      className={`stock-container ${
        selectedStock ? "stock-container-animate" : ""
      }`}
    >
      <span
        onClick={handleToggleFavorite}
        style={{ cursor: "pointer", fontSize: "24px" }}
      >
        {isFavorite ? "★" : "☆"}
      </span>
      <div className="stock-ticker">{/* Ticker data display logic here */}</div>
      <div className="time-periods">
        {timePeriods.map((period) => (
          <button key={period} onClick={() => setSelectedTimePeriod(period)}>
            {period.toUpperCase()}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p>
            <strong>Definitions</strong>
          </p>
          <p>
            <strong>Bullish:</strong> Buy Stock
          </p>
          <p>
            <strong>Bearish:</strong> Sell Stock
          </p>
          <p>
            <strong>Neutral:</strong> Hold Stock
          </p>
          <p>
            <strong>ML:</strong> Machine Learning
          </p>
          <p>
            <strong>TA:</strong> Technical Analysis
          </p>
        </div>
        <div style={{ width: "600px", height: "300px", marginLeft: "20px" }}>
          <h2 style={{ textAlign: "center" }}>{selectedStock} Stock Chart</h2>
          {stockData.datasets[0].data.length > 0 && (
            <Line data={stockData} options={options} />
          )}
        </div>
        <div style={{ marginLeft: "20px" }}>
          <p>
            <strong>High:</strong> {stockInfo.high}
          </p>
          <p>
            <strong>Low:</strong> {stockInfo.low}
          </p>
          <p>
            <strong>Current:</strong> {stockInfo.current}
          </p>
          <p>
            <strong>ML Prediction:</strong> {prediction}
          </p>
          <p>
            <strong>TA Prediction:</strong> {taPrediction}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "80px",
          gap: "10px",
        }}
      >
        {analysisOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnalysisOptionClick(option)}
            style={{ padding: "10px 20px" }}
          >
            {option}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button onClick={calculatePrediction}>Calculate Prediction</button>
        <button onClick={handleMLPrediction}>ML Prediction</button>
      </div>
    </div>
  );
};

export default Stock;

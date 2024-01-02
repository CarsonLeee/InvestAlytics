// StochasticOscillator.js
const axios = require("axios");

const calculateStochasticOscillator = (data, period = 14) => {
  let stochastics = [];

  for (let i = period - 1; i < data.length; i++) {
    const highMax = Math.max(
      ...data.slice(i - period + 1, i + 1).map((item) => item.high)
    );
    const lowMin = Math.min(
      ...data.slice(i - period + 1, i + 1).map((item) => item.low)
    );
    const close = data[i].close;

    const k = ((close - lowMin) / (highMax - lowMin)) * 100;
    stochastics.push({ k });
  }

  return stochastics;
};

const determineTrend = (stochastics) => {
  const latestStochastic = stochastics[stochastics.length - 1].k;

  if (latestStochastic > 80) {
    return "Bearish";
  } else if (latestStochastic < 20) {
    return "Bullish";
  } else {
    return "Neutral";
  }
};

const fetchStockDataAndCalculateStochastic = async (
  stockSymbol,
  period,
  apiKey
) => {
  const url = `https://cloud.iexapis.com/stable/stock/${stockSymbol}/chart/${period}?token=${apiKey}`;
  try {
    const response = await axios.get(url);
    const data = response.data; // Ensure this contains high, low, and close prices
    const stochastic = calculateStochasticOscillator(data);
    const trend = determineTrend(stochastic);
    return { stochastic, trend };
  } catch (error) {
    throw new Error("Error fetching stock data");
  }
};

module.exports = { fetchStockDataAndCalculateStochastic };

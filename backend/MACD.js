// MACD.js
const axios = require("axios");

const calculateEMA = (data, period) => {
  const k = 2 / (period + 1);
  let emaArray = [data[0]];

  for (let i = 1; i < data.length; i++) {
    emaArray[i] = data[i] * k + emaArray[i - 1] * (1 - k);
  }

  return emaArray;
};

const calculateMACD = (data) => {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = ema12.map((value, index) => value - ema26[index]);
  const signal = calculateEMA(macd, 9);
  return { macd, signal };
};

const determineTrend = (macd, signal) => {
  const latestMACD = macd[macd.length - 1];
  const latestSignal = signal[signal.length - 1];

  if (latestMACD > latestSignal) {
    return "Bullish";
  } else if (latestMACD < latestSignal) {
    return "Bearish";
  } else {
    return "Neutral";
  }
};

const fetchStockDataAndCalculateMACD = async (stockSymbol, period, apiKey) => {
  const url = `https://cloud.iexapis.com/stable/stock/${stockSymbol}/chart/${period}?token=${apiKey}`;
  try {
    const response = await axios.get(url);
    const data = response.data.map((item) => item.close); // Ensure this is correct
    const { macd, signal } = calculateMACD(data);
    const trend = determineTrend(macd, signal);
    return { macd, signal, trend };
  } catch (error) {
    throw new Error("Error fetching stock data");
  }
};

module.exports = { fetchStockDataAndCalculateMACD };

// BollingerBands.js
const axios = require('axios');

const calculateBollingerBands = (data, period = 20, stdDevMultiplier = 2) => {
  if (data.length < period) {
    throw new Error('Not enough data to calculate Bollinger Bands');
  }

  // Calculate Simple Moving Average (SMA)
  const sma = data.slice(-period).reduce((sum, value) => sum + value, 0) / period;

  // Calculate Standard Deviation
  const squareDiffs = data.slice(-period).map(value => (value - sma) ** 2);
  const variance = squareDiffs.reduce((sum, value) => sum + value, 0) / period;
  const stdDev = Math.sqrt(variance);

  // Calculate Upper and Lower Bands
  const upperBand = sma + stdDevMultiplier * stdDev;
  const lowerBand = sma - stdDevMultiplier * stdDev;

  return { sma, upperBand, lowerBand };
};

const determineTrend = (price, upperBand, lowerBand) => {
  if (price > upperBand) {
    return 'Bullish';
  } else if (price < lowerBand) {
    return 'Bearish';
  }
  return 'Neutral';
};

const fetchStockDataAndCalculateBollingerBands = async (stockSymbol, period, apiKey) => {
  const url = `https://cloud.iexapis.com/stable/stock/${stockSymbol}/chart/${period}?token=${apiKey}`;
  try {
    const response = await axios.get(url);
    const data = response.data.map(item => item.close);
    const { sma, upperBand, lowerBand } = calculateBollingerBands(data);
    const trend = determineTrend(data[data.length - 1], upperBand, lowerBand);
    return { sma, upperBand, lowerBand, trend };
  } catch (error) {
    throw new Error('Error fetching stock data');
  }
};

module.exports = { fetchStockDataAndCalculateBollingerBands };

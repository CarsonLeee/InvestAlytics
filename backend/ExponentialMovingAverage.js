// ExponentialMovingAverage.js
const axios = require('axios');

const calculateEMA = (data, period) => {
  let ema = [];
  let multiplier = 2 / (period + 1);

  // Starting EMA value (SMA of first 'period' values)
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  ema.push(sum / period);

  // Calculating remaining EMA values
  for (let i = period; i < data.length; i++) {
    let emaValue = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(emaValue);
  }

  return ema;
};

const determineTrend = (ema) => {
  if (ema.length < 2) return 'Neutral';
  const latest = ema[ema.length - 1];
  const previous = ema[ema.length - 2];
  return latest > previous ? 'Bullish' : 'Bearish';
};

const fetchStockDataAndCalculateEMA = async (stockSymbol, period, apiKey) => {
  const url = `https://cloud.iexapis.com/stable/stock/${stockSymbol}/chart/${period}?token=${apiKey}`;
  try {
    const response = await axios.get(url);
    const data = response.data.map(item => item.close);
    const ema = calculateEMA(data, 5); // Adjust the period as needed
    const trend = determineTrend(ema);
    return { ema, trend };
  } catch (error) {
    throw new Error('Error fetching stock data');
  }
};

module.exports = { fetchStockDataAndCalculateEMA };

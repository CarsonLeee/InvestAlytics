// RelativeStrengthIndex.js
const axios = require('axios');

const calculateRSI = (data) => {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < data.length; i++) {
    const difference = data[i] - data[i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  const averageGain = gains / 14; // Assuming a 14-day RSI
  const averageLoss = losses / 14;

  if (averageLoss === 0) {
    return 100; // Prevent division by zero
  }

  const relativeStrength = averageGain / averageLoss;
  const rsi = 100 - (100 / (1 + relativeStrength));

  return rsi;
};

const determineTrend = (rsi) => {
  return rsi > 70 ? 'Bullish' : rsi < 30 ? 'Bearish' : 'Neutral';
};

const fetchStockDataAndCalculateRSI = async (stockSymbol, period, apiKey) => {
  const url = `https://cloud.iexapis.com/stable/stock/${stockSymbol}/chart/${period}?token=${apiKey}`;
  try {
    const response = await axios.get(url);
    const data = response.data.map(item => item.close);
    const rsi = calculateRSI(data);
    const trend = determineTrend(rsi);
    return { rsi, trend };
  } catch (error) {
    throw new Error('Error fetching stock data');
  }
};

module.exports = { fetchStockDataAndCalculateRSI };

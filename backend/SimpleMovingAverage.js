// SimpleMovingAverage.js
const axios = require('axios');

const calculateSMA = (data, period) => {
  let sma = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    sma.push(sum / period);
  }
  return sma;
};

const determineTrend = (sma) => {
  if (sma.length < 2) return 'Neutral';
  const latest = sma[sma.length - 1];
  const previous = sma[sma.length - 2];
  return latest > previous ? 'Bullish' : 'Bearish';
};

const fetchStockDataAndCalculateSMA = async (stockSymbol, period, apiKey) => {
  const url = `https://cloud.iexapis.com/stable/stock/${stockSymbol}/chart/${period}?token=${apiKey}`;
  try {
    const response = await axios.get(url);
    const data = response.data.map(item => item.close);
    const sma = calculateSMA(data, 5); // adjust period as needed
    const trend = determineTrend(sma);
    return { sma, trend };
  } catch (error) {
    throw new Error('Error fetching stock data');
  }
};

module.exports = { fetchStockDataAndCalculateSMA };

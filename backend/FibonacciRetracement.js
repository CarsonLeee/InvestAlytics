// FibonacciRetracement.js
const axios = require('axios');

const calculateFibonacciRetracement = (high, low) => {
  const diff = high - low;
  return {
    level0: high,
    level236: high - diff * 0.236,
    level382: high - diff * 0.382,
    level5: high - diff * 0.5,
    level618: high - diff * 0.618,
    level786: high - diff * 0.786,
    level1: low,
  };
};

const determineFibonacciTrend = (currentPrice, fibonacciLevels) => {
    if (currentPrice > fibonacciLevels.level618) {
      return 'Bullish';
    } else if (currentPrice < fibonacciLevels.level618) {
      return 'Bearish';
    } else {
      return 'Neutral';
    }
  };

const fetchStockDataAndCalculateFibonacci = async (stockSymbol, period, apiKey) => {
  const url = `https://cloud.iexapis.com/stable/stock/${stockSymbol}/chart/${period}?token=${apiKey}`;
  try {
    const response = await axios.get(url);
    const high = Math.max(...response.data.map(item => item.high));
    const low = Math.min(...response.data.map(item => item.low));
    const currentPrice = response.data[response.data.length - 1].close; // Get the latest close price
    const fibonacciLevels = calculateFibonacciRetracement(high, low);
    const trend = determineFibonacciTrend(currentPrice, fibonacciLevels);

    return { fibonacciLevels, trend };
  } catch (error) {
    throw new Error('Error fetching stock data');
  }
};

module.exports = { fetchStockDataAndCalculateFibonacci };

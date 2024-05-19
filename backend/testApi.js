require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.REACT_APP_API_KEY;

const testFetchStockData = async (symbol) => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: apiKey,
      },
    });

    console.log('Stock Data Response:', response.data);
  } catch (error) {
    console.error('Error fetching stock data:', error.response ? error.response.data : error.message);
  }
};

const testSearchStocks = async (query) => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: apiKey,
      },
    });

    console.log('Search Stocks Response:', response.data);
  } catch (error) {
    console.error('Error fetching stock symbols:', error.response ? error.response.data : error.message);
  }
};

// Test with specific stock symbol and query
testFetchStockData('AAPL');
testSearchStocks('Apple');

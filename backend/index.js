require('dotenv').config(); // Ensure this is the very first line
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Log the API key to verify it's being read correctly
const apiKey = process.env.REACT_APP_API_KEY;
console.log('API Key:', apiKey);

// Route to fetch stock data
app.get('/api/stocks/:symbol', async (req, res) => {
  const { symbol } = req.params;

  if (!apiKey) {
    console.error('API key is missing');
    return res.status(500).send('API key is missing');
  }

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: apiKey,
      },
    });

    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock data:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching stock data');
  }
});

// Route to search for stock symbols
app.get('/api/search/:query', async (req, res) => {
  const { query } = req.params;

  if (!apiKey) {
    console.error('API key is missing');
    return res.status(500).send('API key is missing');
  }

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: apiKey,
      },
    });

    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock symbols:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching stock symbols');
  }
});

// Test route to verify API key
app.get('/api/test', (req, res) => {
  res.send(`API Key: ${apiKey}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

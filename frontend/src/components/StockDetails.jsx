import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StockDetails.css';

const StockDetails = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/stocks/${symbol}`);
        setStockData(response.data);
      } catch (error) {
        console.error('Error fetching stock data', error);
      }
    };

    fetchStockData();
  }, [symbol, apiUrl]);

  if (!stockData || !stockData['Time Series (Daily)']) {
    return <div>No data available</div>;
  }

  const timeSeries = stockData['Time Series (Daily)'];
  const chartData = Object.keys(timeSeries).map((date) => ({
    date,
    open: parseFloat(timeSeries[date]['1. open']),
    high: parseFloat(timeSeries[date]['2. high']),
    low: parseFloat(timeSeries[date]['3. low']),
    close: parseFloat(timeSeries[date]['4. close']),
    volume: parseInt(timeSeries[date]['5. volume'], 10),
  })).reverse();

  const lastRefreshed = stockData['Meta Data']['3. Last Refreshed'];
  const dailyData = timeSeries[lastRefreshed];

  return (
    <div className="stock-details">
      <h2>Stock Details for {symbol}</h2>
      <p><strong>Symbol:</strong> {symbol}</p>
      <p><strong>Last Refreshed:</strong> {lastRefreshed}</p>
      <p><strong>Open:</strong> {dailyData['1. open']}</p>
      <p><strong>High:</strong> {dailyData['2. high']}</p>
      <p><strong>Low:</strong> {dailyData['3. low']}</p>
      <p><strong>Close:</strong> {dailyData['4. close']}</p>
      <p><strong>Volume:</strong> {dailyData['5. volume']}</p>

      <div className="chart-container">
        <ResponsiveContainer className="responsive-container">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="open" stroke="#8884d8" />
            <Line type="monotone" dataKey="high" stroke="#82ca9d" />
            <Line type="monotone" dataKey="low" stroke="#ff7300" />
            <Line type="monotone" dataKey="close" stroke="#0000ff" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockDetails;

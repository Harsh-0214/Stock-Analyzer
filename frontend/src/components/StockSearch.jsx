import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StockSearch.css';

const StockSearch = () => {
  const [symbol, setSymbol] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSymbol(value);

    if (value) {
      try {
        const response = await axios.get(`${apiUrl}/api/search/${value}`);
        setSuggestions(response.data.bestMatches || []);
      } catch (error) {
        console.error('Error fetching stock symbols', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSymbol(suggestion['1. symbol']);
    setSuggestions([]);
    navigate(`/stock/${suggestion['1. symbol']}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate(`/stock/${symbol}`);
  };

  return (
    <div className="stock-search">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter stock symbol"
            value={symbol}
            onChange={handleInputChange}
            required
            className="search-input"
          />
          {Array.isArray(suggestions) && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion['1. symbol']} - {suggestion['2. name']}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="buttons">Search</button>
      </form>
    </div>
  );
};

export default StockSearch;

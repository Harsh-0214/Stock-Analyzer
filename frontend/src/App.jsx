import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import StockSearch from './components/StockSearch';
import StockDetails from './components/StockDetails';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/stock/:symbol" element={<StockDetails />} />
        </Routes>
        <StockSearch />
      </div>
    </Router>
  );
}

export default App;

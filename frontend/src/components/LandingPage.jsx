import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="Landing-page">
      <h1>Stock Analyzer</h1>
      <div className='button-container'>
      </div>
    </div>
  );
};

export default LandingPage;

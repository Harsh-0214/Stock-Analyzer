import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/Register');
  };

  const handleLoginClick = () => {
    navigate('/Login');
  };

  return (
    <div className="Landing-page">
      <h1>Welcome</h1>
      <button className="fade-button" onClick={handleRegisterClick}>Get Started</button>
      <button className="fade-button" onClick={handleLoginClick}>Login</button>
    </div>
  );
};

export default LandingPage;

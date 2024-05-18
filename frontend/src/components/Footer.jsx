import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h1 className="logo">Stock Analysis App</h1>  
      </div>
      <div className='nav-right'>
            <nav className="nav">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/register" className="nav-link">Register</Link>
                <Link to="/login" className="nav-link">Login</Link>
            </nav>
        </div>
    </footer>
  );
};

export default Footer;
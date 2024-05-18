import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Stock Analysis App</h1>  
      </div>
      <div className='nav-right'>
            <nav className="nav">
                <Link to="/" className="nav-link">Home</Link>
            </nav>
        </div>
    </header>
  );
};

export default Header;

import React from 'react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import '../Styles/Header.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-info">
        <h2>PawPraise</h2>
        <h1>PET PRODUCTS</h1>
        <p>100% Honest Reviews For All Products</p>
        <Button color="black" className="header-button" onClick={() => navigate('/products')}>
          Learn More
        </Button>
      </div>
    </header>
  );
};

export default Header;

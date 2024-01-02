import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Search from './Search';
import Stock from './Stock';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedStock, setSelectedStock] = useState('');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {currentPage === 'login' && <Login navigateTo={navigateTo} />}
      {currentPage === 'register' && <Register navigateTo={navigateTo} />}
      {currentPage === 'forgotPassword' && <ForgotPassword navigateTo={navigateTo} />}
      {currentPage === 'search' && <Search navigateTo={navigateTo} setSelectedStock={setSelectedStock} />}
      {currentPage === 'stock' && <Stock selectedStock={selectedStock} navigateTo={navigateTo} />}
    </div>
  );
}

export default App;

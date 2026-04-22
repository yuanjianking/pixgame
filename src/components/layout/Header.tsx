// Header.tsx - 确保没有额外的样式
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="header-title">
            游戏平台
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
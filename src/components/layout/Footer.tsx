// Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-text">
          © {new Date().getFullYear()} PixGame
        </div>
      </div>
    </footer>
  );
};

export default Footer;
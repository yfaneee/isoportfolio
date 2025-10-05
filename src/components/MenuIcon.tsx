import React from 'react';
import './MenuIcon.css';

interface MenuIconProps {
  onClick: () => void;
  isVisible: boolean;
  isMenuOpen?: boolean;
}

const MenuIcon: React.FC<MenuIconProps> = ({ onClick, isVisible, isMenuOpen = false }) => {
  return (
    <div 
      className={`menu-icon ${isVisible ? 'visible' : ''} ${isMenuOpen ? 'menu-open' : ''}`}
      onClick={onClick}
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      <span className="menu-line top"></span>
      <span className="menu-line bottom"></span>
    </div>
  );
};

export default MenuIcon;

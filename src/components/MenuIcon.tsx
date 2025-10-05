import React from 'react';
import './MenuIcon.css';

interface MenuIconProps {
  onClick: () => void;
  isVisible: boolean;
}

const MenuIcon: React.FC<MenuIconProps> = ({ onClick, isVisible }) => {
  return (
    <div 
      className={`menu-icon ${isVisible ? 'visible' : ''}`}
      onClick={onClick}
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      <span className="menu-line top"></span>
      <span className="menu-line bottom"></span>
    </div>
  );
};

export default MenuIcon;

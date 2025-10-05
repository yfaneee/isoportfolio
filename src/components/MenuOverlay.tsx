import React from 'react';
import './MenuOverlay.css';

interface MenuOverlayProps {
  isVisible: boolean;
  onNavigateToLocation?: (location: string) => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isVisible, onNavigateToLocation }) => {
  return (
    <div className={`menu-overlay ${isVisible ? 'visible' : ''}`} style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
      <div className="menu-content">

        <div className="menu-sections">

          <div className="menu-section">
            <h3>Learning Outcomes</h3>
            <div className="learning-outcomes-links">
              <a href="#lo1" onClick={() => onNavigateToLocation?.('conceptualize')}>Conceptualize, design, and develop professional media products</a>
              <a href="#lo2" onClick={() => onNavigateToLocation?.('transferable')}>Transferable production</a>
              <a href="#lo3" onClick={() => onNavigateToLocation?.('creative')}>Creative iterations</a>
              <a href="#lo4" onClick={() => onNavigateToLocation?.('professional')}>Professional standards</a>
              <a href="#lo5" onClick={() => onNavigateToLocation?.('leadership')}>Personal leadership</a>
            </div>
          </div>

          <div className="menu-section">
            <h3>Project</h3>
            <div className="project-links">
              <a href="#project1" onClick={() => onNavigateToLocation?.('studio')}>Studio</a>
              <a href="#project2" onClick={() => onNavigateToLocation?.('ironfilms')}>IronFilms</a>
            </div>
          </div>

          <div className="menu-section">
            <h3>Work</h3>
            <div className="work-links">
              <a href="#work1" onClick={() => onNavigateToLocation?.('artwork')}>Artwork</a>
              <a href="#work2" onClick={() => onNavigateToLocation?.('projects')}>Projects</a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MenuOverlay;

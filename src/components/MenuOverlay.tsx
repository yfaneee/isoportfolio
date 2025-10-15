import React from 'react';
import './MenuOverlay.css';
import ElectricBorder from './ElectricBorder';

interface MenuOverlayProps {
  isVisible: boolean;
  onNavigateToLocation?: (location: string) => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isVisible, onNavigateToLocation }) => {
  return (
    <div className={`menu-overlay ${isVisible ? 'visible' : ''}`} style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
      <ElectricBorder
        color="#E6E0FF"
        speed={1}
        chaos={0.5}
        thickness={2}
        style={{ borderRadius: 16, width: '100%', height: '100%' }}
      >
        <div className="menu-content">

          <div className="menu-sections">

            <div className="menu-section">
              <div className="section-title-with-dividers">
                <div className="divider-left">
                  <img src="/images/divider-003.png" alt="" />
                </div>
                <h3>Learning Outcomes</h3>
                <div className="divider-right">
                  <img src="/images/divider-003.png" alt="" />
                </div>
              </div>
              <div className="learning-outcomes-links">
                <a href="#lo1" onClick={() => onNavigateToLocation?.('conceptualize')}>Conceptualize, design, and develop professional media products</a>
                <a href="#lo2" onClick={() => onNavigateToLocation?.('transferable')}>Transferable production</a>
                <a href="#lo3" onClick={() => onNavigateToLocation?.('creative')}>Creative iterations</a>
                <a href="#lo4" onClick={() => onNavigateToLocation?.('professional')}>Professional standards</a>
                <a href="#lo5" onClick={() => onNavigateToLocation?.('leadership')}>Personal leadership</a>
              </div>
            </div>

            <div className="menu-section">
              <div className="section-title-with-dividers">
                <div className="divider-left">
                  <img src="/images/divider-003.png" alt="" />
                </div>
                <h3>Project</h3>
                <div className="divider-right">
                  <img src="/images/divider-003.png" alt="" />
                </div>
              </div>
              <div className="project-links">
                <a href="#project1" onClick={() => onNavigateToLocation?.('studio')}>Studio</a>
                <a href="#project2" onClick={() => onNavigateToLocation?.('ironfilms')}>IronFilms</a>
              </div>
            </div>

            <div className="menu-section">
              <div className="section-title-with-dividers">
                <div className="divider-left">
                  <img src="/images/divider-003.png" alt="" />
                </div>
                <h3>Work</h3>
                <div className="divider-right">
                  <img src="/images/divider-003.png" alt="" />
                </div>
              </div>
              <div className="work-links">
                <a href="#work1" onClick={() => onNavigateToLocation?.('artwork')}>Artwork</a>
                <a href="#work2" onClick={() => onNavigateToLocation?.('projects')}>Projects</a>
              </div>
            </div>

          </div>

        </div>
      </ElectricBorder>
    </div>
  );
};

export default MenuOverlay;

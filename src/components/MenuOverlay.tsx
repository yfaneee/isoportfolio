import React from 'react';
import './MenuOverlay.css';

interface MenuOverlayProps {
  isVisible: boolean;
  onNavigateToLocation?: (location: string) => void;
  onClose?: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isVisible, onNavigateToLocation, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Full-screen backdrop for click-outside detection */}
      {isVisible && (
        <div 
          className="menu-backdrop"
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            background: 'transparent'
          }}
        />
      )}
      
      {/* Actual menu */}
      <div 
        className={`menu-overlay ${isVisible ? 'visible' : ''}`} 
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
      >
        <div className="menu-content" onClick={handleContentClick}>
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
            <div className="work-links-wrapper">
              <div className="work-links">
                <a href="#work1" onClick={() => onNavigateToLocation?.('artwork')}>Artwork</a>
                <a href="#work2" onClick={() => onNavigateToLocation?.('projects')}>Projects</a>
              </div>
              <div className="cv-link-container">
                <a href="#cv" className="cv-link" onClick={() => window.open('/pdfs/LSTCVv4.pdf', '_blank')}>CV</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default MenuOverlay;

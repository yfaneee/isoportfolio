import React, { useState } from 'react';
import './MenuOverlay.css';

export interface CharacterOption {
  id: string;
  name: string;
  modelPath: string;
  imagePath: string;
}

interface MenuOverlayProps {
  isVisible: boolean;
  onNavigateToLocation?: (location: string) => void;
  onClose?: () => void;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
  selectedCharacter?: CharacterOption;
  onCharacterSelect?: (character: CharacterOption) => void;
}

type TabType = 'menu' | 'info' | 'character';

const characterOptions: CharacterOption[] = [
  {
    id: 'character-r',
    name: 'Ninja',
    modelPath: '/models/character-r.glb',
    imagePath: '/images/character-r.png'
  },
  {
    id: 'character-d',
    name: 'Dummy',
    modelPath: '/models/character-d.glb',
    imagePath: '/images/character-d.png'
  },
  {
    id: 'character-h',
    name: 'Robot',
    modelPath: '/models/character-h.glb',
    imagePath: '/images/character-h.png'
  },
  {
    id: 'character-l',
    name: 'Woody',
    modelPath: '/models/character-l.glb',
    imagePath: '/images/character-l.png'
  }
];

const MenuOverlay: React.FC<MenuOverlayProps> = ({ 
  isVisible, 
  onNavigateToLocation, 
  onClose, 
  isMusicPlaying, 
  onToggleMusic,
  selectedCharacter,
  onCharacterSelect 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('menu');
  
  // Reset to menu tab whenever the menu opens
  React.useEffect(() => {
    if (isVisible) {
      setActiveTab('menu');
    }
  }, [isVisible]);
  
  // Use prop or default to first character
  const currentCharacter = selectedCharacter || characterOptions[0];

  const handleCharacterClick = (character: CharacterOption) => {
    onCharacterSelect?.(character);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const renderMenuContent = () => (
    <>
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
    </>
  );

  const renderInfoContent = () => (
    <>
      <div className="info-section">
        <div className="section-title-with-dividers">
          <div className="divider-left">
            <img src="/images/divider-003.png" alt="" />
          </div>
          <h3>Menu</h3>
          <div className="divider-right">
            <img src="/images/divider-003.png" alt="" />
          </div>
        </div>
        <p>
          Welcome to my interactive 3D portfolio! Navigate through my work and projects 
          using the menu to quickly jump to different sections, or explore by walking 
          around the world. Each platform contains information about my work.
        </p>
      </div>

      <div className="info-section">
        <div className="section-title-with-dividers">
          <div className="divider-left">
            <img src="/images/divider-003.png" alt="" />
          </div>
          <h3>Controls</h3>
          <div className="divider-right">
            <img src="/images/divider-003.png" alt="" />
          </div>
        </div>
        <div className="controls-list">
          <div className="control-row">
            <div className="key-group">
              <span className="key">W</span>
              <span className="key">A</span>
              <span className="key">S</span>
              <span className="key">D</span>
            </div>
            <span className="control-desc">Move around</span>
          </div>
          <div className="control-row">
            <span className="key">SPACE</span>
            <span className="control-desc">Interact / Activate elevator</span>
          </div>
          <div className="control-row">
            <div className="key-group">
              <span className="key">Q</span>
              <span className="key">E</span>
            </div>
            <span className="control-desc">Navigate between platforms</span>
          </div>
          <div className="control-row">
            <span className="key">ESC</span>
            <span className="control-desc">Open / Close menu</span>
          </div>
        </div>

        {/* Repo Links and Music Button */}
        <div className="info-repo-links">
          <button 
            onClick={(e) => {
              onToggleMusic?.();
              e.currentTarget.blur(); 
            }}
            className={`info-repo-button music-button ${isMusicPlaying ? 'playing' : ''}`}
            title={isMusicPlaying ? 'Mute Music' : 'Unmute Music'}
          >
            {isMusicPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="info-repo-icon">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="info-repo-icon">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            )}
          </button>
          <a 
            href="https://github.com/yfaneee/isoportfolio" 
            target="_blank" 
            rel="noopener noreferrer"
            className="info-repo-button github-link"
            title="View on GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="info-repo-icon">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          <a 
            href="https://git.fhict.nl/I503826/isometricportfolio" 
            target="_blank" 
            rel="noopener noreferrer"
            className="info-repo-button gitlab-link"
            title="View on GitLab"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="info-repo-icon">
              <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 00-.867 0L1.388 9.452.046 13.587a.924.924 0 00.331 1.023L12 23.054l11.623-8.443a.92.92 0 00.332-1.024"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  );

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
      
      {/* Actual menu with tabs */}
      <div 
        className={`menu-overlay ${isVisible ? 'visible' : ''}`} 
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
      >
        {/* Tab Bar */}
        <div className="menu-tabs" onClick={handleContentClick}>
          <button 
            className={`menu-tab ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
            aria-label="Menu"
          >
            <img src="/images/menu/Menu.svg" alt="Menu" />
          </button>
          <button 
            className={`menu-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            aria-label="Info"
          >
            <img src="/images/menu/Info.svg" alt="Info" />
          </button>
          <button 
            className={`menu-tab ${activeTab === 'character' ? 'active' : ''}`}
            onClick={() => setActiveTab('character')}
            aria-label="Character"
          >
            <img src="/images/menu/Charact.svg" alt="Character" />
          </button>
        </div>

        {/* Content Area */}
        <div className="menu-content" onClick={handleContentClick}>
          {activeTab === 'menu' && (
            <div className="menu-sections">
              {renderMenuContent()}
            </div>
          )}
          {activeTab === 'info' && (
            <div className="menu-sections">
              {renderInfoContent()}
            </div>
          )}
          {activeTab === 'character' && (
            <div className="menu-sections">
              <div className="menu-section character-section">
                <div className="section-title-with-dividers">
                  <div className="divider-left">
                    <img src="/images/divider-003.png" alt="" />
                  </div>
                  <h3>Character</h3>
                  <div className="divider-right">
                    <img src="/images/divider-003.png" alt="" />
                  </div>
                </div>
                <p className="character-description">
                  Select your character to explore the portfolio world.
                </p>
                
                {/* Character Grid */}
                <div className="menu-character-grid">
                  {characterOptions.map((character) => (
                    <div
                      key={character.id}
                      className={`menu-character-card ${currentCharacter.id === character.id ? 'selected' : ''}`}
                      onClick={() => handleCharacterClick(character)}
                    >
                      <div className="menu-character-image-container">
                        <img
                          src={character.imagePath}
                          alt={character.name}
                          className="menu-character-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA3NUMzNi4xOTI5IDc1IDI1IDYzLjgwNzEgMjUgNTBDMjUgMzYuMTkyOSAzNi4xOTI5IDI1IDUwIDI1QzYzLjgwNzEgMjUgNzUgMzYuMTkyOSA3NSA1MEM3NSA2My44MDcxIDYzLjgwNzEgNzUgNTAgNzVaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjc3NDhGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4K';
                          }}
                        />
                      </div>
                      <div className={`menu-character-name ${currentCharacter.id === character.id ? 'selected' : ''}`}>
                        {character.name}
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuOverlay;

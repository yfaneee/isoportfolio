import React, { useState } from 'react';
import './MenuOverlay.css';
import { useAchievements } from '../contexts/AchievementContext';
import { contentData } from '../data/ContentData';
import { CONTENT_SLAB_TARGETS, LO_SLAB_TARGETS, SOCIAL_SLABS } from '../data/InteractionZones';

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
  onOpenContactForm?: () => void;
  selectedCharacter?: CharacterOption;
  onCharacterSelect?: (character: CharacterOption) => void;
}

type TabType = 'menu' | 'info' | 'character' | 'achievements';

// Order used by the back / next arrows (same as the tab bar)
const TAB_ORDER: TabType[] = ['menu', 'info', 'character', 'achievements'];

// Past portfolios live on the staircase slabs (lo1 = oldest); list them newest first
const PORTFOLIO_LINKS = Object.values(LO_SLAB_TARGETS)
  .map(target => ({ location: target.location, title: contentData[target.contentKey]?.title ?? '' }))
  .reverse();

const PASSION_TARGET = CONTENT_SLAB_TARGETS['smaller-block'];
const PASSION_LINK = {
  location: PASSION_TARGET.location,
  title: contentData[PASSION_TARGET.contentKey]?.title ?? ''
};

const LINKEDIN_URL = SOCIAL_SLABS.find(slab => slab.kind === 'linkedin')?.url;

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
  onOpenContactForm,
  selectedCharacter,
  onCharacterSelect 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('menu');
  const activeTabIndex = TAB_ORDER.indexOf(activeTab);
  const prevTab: TabType | undefined = TAB_ORDER[activeTabIndex - 1];
  const nextTab: TabType | undefined = TAB_ORDER[activeTabIndex + 1];
  const { achievements, resetAchievements } = useAchievements();
  
  const handleResetAchievements = () => {
    if (window.confirm('Are you sure you want to reset all achievements? This cannot be undone.')) {
      resetAchievements();
    }
  };
  
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

      <div className="menu-section">
        <div className="section-title-with-dividers">
          <div className="divider-left">
            <img src="/images/divider-003.png" alt="" />
          </div>
          <h3>Portfolios</h3>
          <div className="divider-right">
            <img src="/images/divider-003.png" alt="" />
          </div>
        </div>
        <div className="menu-list-links">
          {PORTFOLIO_LINKS.map(link => (
            <a key={link.location} href={`#${link.location}`} onClick={() => onNavigateToLocation?.(link.location)}>
              {link.title}
            </a>
          ))}
        </div>
      </div>

      <div className="menu-section">
        <div className="section-title-with-dividers">
          <div className="divider-left">
            <img src="/images/divider-003.png" alt="" />
          </div>
          <h3>Passion</h3>
          <div className="divider-right">
            <img src="/images/divider-003.png" alt="" />
          </div>
        </div>
        <div className="menu-list-links">
          <a href={`#${PASSION_LINK.location}`} onClick={() => onNavigateToLocation?.(PASSION_LINK.location)}>
            {PASSION_LINK.title}
          </a>
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
        <p className="info-welcome-text">
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

        {/* Repo Links */}
        <div className="info-repo-links">
          <a
            href="https://github.com/yfaneee"
            target="_blank"
            rel="noopener noreferrer"
            className="info-repo-button github-link"
            title="My GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="info-repo-icon">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="info-repo-button"
            title="My LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="info-repo-icon">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <button
            type="button"
            className="info-repo-button"
            title="Send me a message"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenContactForm?.();
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="info-repo-icon">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  const renderAchievementsContent = () => (
    <>
      <div className="achievements-section">
        <div className="section-title-with-dividers">
          <div className="divider-left">
            <img src="/images/divider-003.png" alt="" />
          </div>
          <h3>Achievements</h3>
          <div className="divider-right">
            <img src="/images/divider-003.png" alt="" />
          </div>
        </div>
        <p className="achievements-description">
          Track your progress exploring this portfolio
        </p>
        
        <div className="achievements-list">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                <img src={achievement.iconPath} alt={achievement.title} />
              </div>
              <div className="achievement-content">
                <h4 className="achievement-title">{achievement.title}</h4>
                <p className="achievement-description">{achievement.description}</p>
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
              </div>
              {achievement.isUnlocked && (
                <div className="achievement-check">
                  <img src="/images/menu/Done.svg" alt="Completed" />
                </div>
              )}
            </div>
          ))}
          
          {/* Reset Achievements Button */}
          <button 
            className="reset-achievements-button"
            onClick={handleResetAchievements}
            title="Reset all achievements"
          >
            Reset All Achievements
          </button>
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
          <button 
            className={`menu-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
            aria-label="Achievements"
          >
            <img src="/images/menu/Star.svg" alt="Achievements" />
          </button>
        </div>

        {/* Content Area */}
        <div className="menu-content" onClick={handleContentClick}>
          {/* Back / next arrows as an alternative to the tabs */}
          {prevTab && (
            <button
              type="button"
              className="menu-page-arrow menu-page-arrow-prev"
              onClick={(e) => {
                e.currentTarget.blur();
                setActiveTab(prevTab);
              }}
              aria-label="Previous tab"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
          )}
          {nextTab && (
            <button
              type="button"
              className="menu-page-arrow menu-page-arrow-next"
              onClick={(e) => {
                e.currentTarget.blur();
                setActiveTab(nextTab);
              }}
              aria-label="Next tab"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          )}

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
          {activeTab === 'achievements' && (
            <div className="menu-sections">
              {renderAchievementsContent()}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuOverlay;

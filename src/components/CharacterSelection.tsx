import React, { useState, useEffect } from 'react';
import './CharacterSelection.css';
import SplitText from './SplitText';

export interface CharacterOption {
  id: string;
  name: string;
  modelPath: string;
  imagePath: string;
}

interface CharacterSelectionProps {
  isVisible: boolean;
  onCharacterSelect: (character: CharacterOption) => void;
  onStart: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

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

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  isVisible,
  onCharacterSelect,
  onStart,
  isMusicPlaying,
  onToggleMusic
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption>(characterOptions[0]);
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);
  const [showDividers, setShowDividers] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const textTimer = setTimeout(() => {
        setIsReadyToAnimate(true);
      }, 800);
      
      const dividerTimer = setTimeout(() => {
        setShowDividers(true);
      }, 1440);
      
      return () => {
        clearTimeout(textTimer);
        clearTimeout(dividerTimer);
      };
    } else {
      setIsReadyToAnimate(false);
      setShowDividers(false);
    }
  }, [isVisible]);

  const handleCharacterClick = (character: CharacterOption) => {
    setSelectedCharacter(character);
    onCharacterSelect(character);
  };

  const handleStartClick = () => {
    onStart();
  };

  if (!isVisible) return null;

  return (
    <div className="character-selection-overlay">
      <div className="character-selection-container">
        {/* Title */}
        <div className="character-selection-title-container">
          {/* Left divider */}
          <div className={`title-divider-left ${showDividers ? 'show' : ''}`}>
            <img src="/images/divider-003.png" alt="" />
          </div>
          
          {isReadyToAnimate ? (
            <SplitText
              key="character-title"
              text="Select a character"
              className="character-selection-title"
              delay={50}
              duration={0.4}
              ease="power2.out"
              splitType="chars"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              tag="h1"
              animate={true}
            />
          ) : (
            <h1 className="character-selection-title" style={{ opacity: 0, visibility: 'hidden' }}>
              Select a character
            </h1>
          )}
          
          {/* Right divider */}
          <div className={`title-divider-right ${showDividers ? 'show' : ''}`}>
            <img src="/images/divider-003.png" alt="" />
          </div>
        </div>
        
        {/* Character Grid */}
        <div className="character-grid">
          {characterOptions.map((character) => (
            <div
              key={character.id}
              className={`character-card ${selectedCharacter.id === character.id ? 'selected' : ''}`}
              onClick={() => handleCharacterClick(character)}
            >
              <div className="character-image-container">
                <img
                  src={character.imagePath}
                  alt={character.name}
                  className="character-image"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA3NUMzNi4xOTI5IDc1IDI1IDYzLjgwNzEgMjUgNTBDMjUgMzYuMTkyOSAzNi4xOTI5IDI1IDUwIDI1QzYzLjgwNzEgMjUgNzUgMzYuMTkyOSA3NSA1MEM3NSA2My44MDcxIDYzLjgwNzEgNzUgNTAgNzVaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjc3NDhGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4K';
                  }}
                />
              </div>
              <div className={`character-name ${selectedCharacter.id === character.id ? 'selected' : ''}`}>
                {character.name}
              </div>
            </div>
          ))}
        </div>
        
        {/* Buttons Container */}
        <div className="buttons-container">
          <button 
            className="cssbuttons-io-button music-toggle-button" 
            onClick={onToggleMusic}
            title={isMusicPlaying ? 'Mute Music' : 'Unmute Music'}
          >
            <div className="icon music-icon">
              {isMusicPlaying ? (
                <svg
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
                </svg>
              ) : (
                <svg
                  height="24"
                  width="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/>
                </svg>
              )}
            </div>
          </button>
          <button className="cssbuttons-io-button" onClick={handleStartClick}>
            START
            <div className="icon">
              <svg
                height="24"
                width="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path
                  d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;

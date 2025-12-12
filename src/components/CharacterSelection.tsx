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
  onStart
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

  // Handle keyboard events for START button 
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Space or Enter is pressed
      if (e.key === ' ' || e.key === 'Enter') {
        // Prevent default behavior 
        e.preventDefault();
        onStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onStart]);

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
        
        {/* Start Button */}
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
  );
};

export default CharacterSelection;

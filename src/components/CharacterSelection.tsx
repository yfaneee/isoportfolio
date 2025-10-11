import React, { useState } from 'react';
import './CharacterSelection.css';

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
    id: 'character-a',
    name: 'Alex',
    modelPath: '/models/character-a.glb',
    imagePath: '/images/character-a.png'
  },
  {
    id: 'character-b',
    name: 'Finley',
    modelPath: '/models/character-b.glb',
    imagePath: '/images/character-b.png'
  },
  {
    id: 'character-c',
    name: 'Drew',
    modelPath: '/models/character-c.glb',
    imagePath: '/images/character-c.png'
  },
  {
    id: 'character-d',
    name: 'Casey',
    modelPath: '/models/character-e.glb',
    imagePath: '/images/character-e.png'
  },
  {
    id: 'character-e',
    name: 'Emery',
    modelPath: '/models/character-i.glb',
    imagePath: '/images/character-i.png'
  },
  {
    id: 'character-f',
    name: 'Blake',
    modelPath: '/models/character-j.glb',
    imagePath: '/images/character-j.png'
  },
  {
    id: 'character-g',
    name: 'Gray',
    modelPath: '/models/character-k.glb',
    imagePath: '/images/character-k.png'
  },
  {
    id: 'character-h',
    name: 'Ninja',
    modelPath: '/models/character-r.glb',
    imagePath: '/images/character-r.png'
  }
];

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  isVisible,
  onCharacterSelect,
  onStart
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption>(characterOptions[0]);

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
        <h1 className="character-selection-title">Select a character</h1>
        
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
          Start
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

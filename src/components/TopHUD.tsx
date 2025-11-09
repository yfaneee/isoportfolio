import React, { useState, useEffect } from 'react';
import './TopHUD.css';

interface TopHUDProps {
  characterPosition: [number, number, number];
  isVisible: boolean;
  showMenu: boolean;
  showContent: boolean;
  currentContent: any;
  characterRotation?: number;
}

interface AreaInfo {
  name: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  discovered: boolean;
}

// Define areas with their boundaries - large areas including stairs/ramps
const areas: AreaInfo[] = [
  {
    name: 'Learning Outcomes',
    bounds: { minX: -14, maxX: -7, minZ: -2, maxZ: 2 },
    discovered: false
  },
  {
    name: 'Project Studio',
    bounds: { minX: -3.75, maxX: 3.75, minZ: -11.25, maxZ: -3.75 },
    discovered: false
  },
  {
    name: 'Artwork Gallery',
    bounds: { minX: 6, maxX: 12, minZ: -2, maxZ: 2 },
    discovered: false
  },
  {
    name: 'Work Projects',
    bounds: { minX: -2, maxX: 2, minZ: 7, maxZ: 33 },
    discovered: false
  }
];

const TopHUD: React.FC<TopHUDProps> = React.memo(({ 
  characterPosition, 
  isVisible, 
  showMenu, 
  showContent,
  currentContent,
  characterRotation = 0
}) => {
  const [currentArea, setCurrentArea] = useState<string>('Center');
  const [nextSuggestion, setNextSuggestion] = useState<string>('');
  const [visitedAreas, setVisitedAreas] = useState<Set<string>>(new Set(['Center']));

  useEffect(() => {
    const [charX, , charZ] = characterPosition;
    
    // Debug logging
    console.log('TopHUD - Character position:', charX, charZ);
    
    let foundArea = 'Center';
    
    // Check which area the character is in
    for (const area of areas) {
      if (charX >= area.bounds.minX && charX <= area.bounds.maxX &&
          charZ >= area.bounds.minZ && charZ <= area.bounds.maxZ) {
        foundArea = area.name;
        break;
      }
    }

    setCurrentArea(foundArea);

    // Track visited areas
    if (foundArea !== 'Center') {
      setVisitedAreas(prev => {
        const newSet = new Set(prev);
        newSet.add(foundArea);
        return newSet;
      });
    }

    // Smart directional suggestions based on current location
    if (foundArea === 'Center') {
      let suggestedArea = '';
      let direction = '';
      
      // Check character position relative to center (0,0)
      const offsetX = charX; 
      const offsetZ = charZ; 
      
      // Determine primary direction based on position offset
      if (Math.abs(offsetX) > Math.abs(offsetZ)) {
        // Character is more East/West oriented
        if (offsetX > 0) {
          // Leaning East 
          suggestedArea = 'Artwork Gallery';
          direction = '↓';
        } else {
          // Leaning West 
          suggestedArea = 'Learning Outcomes';
          direction = '↑';
        }
      } else {
        // Character is more North/South oriented
        if (offsetZ > 0) {
          // Leaning South
          suggestedArea = 'Work Projects';
          direction = '←';
        } else {
          // Leaning North 
          suggestedArea = 'Project Studio';
          direction = '→';
        }
      }
      
      // If suggested area is already visited, suggest first unvisited area
      const unvisitedAreas = areas.filter(area => !visitedAreas.has(area.name));
      if (visitedAreas.has(suggestedArea) && unvisitedAreas.length > 0) {
        suggestedArea = unvisitedAreas[0].name;
        switch (suggestedArea) {
          case 'Learning Outcomes': direction = '↑'; break;
          case 'Project Studio': direction = '→'; break;
          case 'Artwork Gallery': direction = '↓'; break;
          case 'Work Projects': direction = '←'; break;
        }
      }
      
      setNextSuggestion(`${suggestedArea} ${direction}`);
    } else {
      let direction = '';
      switch (foundArea) {
        case 'Learning Outcomes':
          direction = '↓'; 
          break;
        case 'Project Studio':
          direction = '←'; 
          break;
        case 'Artwork Gallery':
          direction = '↑'; 
          break;
        case 'Work Projects':
          direction = '→'; 
          break;
      }
      
      setNextSuggestion(direction ? `Center ${direction}` : '');
    }
  }, [characterPosition, visitedAreas]);

  if (!isVisible || showMenu) {
    return null;
  }

  return (
    <div className="top-hud">
      <div className="hud-content">
        <div className="current-location">
          <span className="location-label">Current:</span>
          <span className="location-name-top-hud">{currentArea}</span>
        </div>
        
        {!showContent && nextSuggestion && (
          <div className="next-suggestion">
            <span className="suggestion-label">Explore:</span>
            <span className="suggestion-name">{nextSuggestion}</span>
          </div>
        )}

        {showContent && currentContent && (
          <div className="content-indicator">
            <span className="content-label">Viewing:</span>
            <span className="content-name">{currentContent.title}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default TopHUD;

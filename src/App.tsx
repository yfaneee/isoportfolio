import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './components/IsometricScene';
import UI from './components/UI';
import ControlsUI from './components/ControlsUI';
import LoadingScreen from './components/LoadingScreen';
import MenuOverlay from './components/MenuOverlay';
import MenuIcon from './components/MenuIcon';
import Content from './components/Content';
import { getContentForSlab, ContentItem } from './data/ContentData';
import { preloadCommonPlatforms } from './utils/collisionSystem';
import './App.css';
import './styles/fonts.css';

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [menuDelayOver, setMenuDelayOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const characterControllerRef = useRef<any>(null);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setMenuDelayOver(false);

    menuTimerRef.current = setTimeout(() => {
      setShowMenu(true);
      setMenuDelayOver(true);
    }, 300);
  }, []);

  const handleMovementStart = useCallback(() => {
    if (showMenu) {
      setShowMenu(false);
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
    }
    if (showContent) {
      setShowContent(false);
    }
    // Whether or not the menu is shown, the intro/menu delay is considered over after first movement
    setMenuDelayOver(true);
  }, [showMenu, showContent]);

  const handleSpacePress = useCallback(() => {
    if (!showMenu && !showContent) {
      const characterPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
      
      // Get content for the current slab
      const content = getContentForSlab(characterPos[0], characterPos[2]);
      
      const isOnMiddleSlab = characterPos[0] >= -0.45 && characterPos[0] <= 0.45 && 
                            characterPos[2] >= -0.45 && characterPos[2] <= 0.45;
      
      if (content) {
        setCurrentContent(content);
        setShowContent(true);
      } else if (isOnMiddleSlab) {
        setShowMenu(true);
      } else {
        setShowMenu(true);
      }
    }
  }, [showMenu, showContent]);

  const handleMenuIconClick = useCallback(() => {
    if (showContent && !isTransitioning) {
      setIsTransitioning(true);
      setShowContent(false);
      setCurrentContent(null);
      
      // Wait for content to close, then open menu
      setTimeout(() => {
        setShowMenu(true);
        setMenuDelayOver(true);
        setIsTransitioning(false);
      }, 400); 
    } else if (!showMenu && !isTransitioning) {
      setShowMenu(true);
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
      setMenuDelayOver(true);
    } else if (showMenu && !isTransitioning) {
      setShowMenu(false);
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
    }
  }, [showMenu, showContent, isTransitioning]);

  const handleNavigateToLocation = useCallback((location: string) => {
    // Hide menu
    setShowMenu(false);
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current);
      menuTimerRef.current = null;
    }
    
    // Teleport character to location
    if (characterControllerRef.current) {
      characterControllerRef.current.teleportToLocation(location);
    }
  }, []);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
      }
    };
  }, []);

  // Preload collision system on app start
  useEffect(() => {
    preloadCommonPlatforms();
  }, []);

  const handleStart = useCallback(() => {
    setShowLoadingScreen(false);
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Three.js Canvas for the isometric world - always visible */}
        <Canvas
          camera={{
            position: [10, 10, 10],
            fov: 50
          }}
          style={{ 
            width: '100vw', 
            height: '100vh',
            background: 'linear-gradient(135deg, #FCF5C4 0%, #F5E8A0 50%, #E8D570 100%)',
            touchAction: 'none'
          }}
          onTouchStart={(e) => {
            // Only handle touch on the canvas, not UI elements
            if (e.target === e.currentTarget && characterControllerRef.current) {
              e.preventDefault();
              characterControllerRef.current.handleTouch(e.touches[0]);
            }
          }}
          onTouchEnd={(e) => {
            if (e.target === e.currentTarget && characterControllerRef.current) {
              e.preventDefault();
              characterControllerRef.current.stopMovement();
            }
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget && characterControllerRef.current) {
              e.preventDefault();
              characterControllerRef.current.handleTouch(e.touches[0]);
            }
          }}
        >
                 <IsometricScene
                   onIntroComplete={handleIntroComplete}
                   showMenu={showMenu}
                   showContent={showContent}
                   isTransitioning={isTransitioning}
                   onMovementStart={handleMovementStart}
                   onSpacePress={handleSpacePress}
                   characterControllerRef={characterControllerRef}
                   showLoadingScreen={showLoadingScreen}
                 />
        </Canvas>
        
        {/* Controls UI Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <ControlsUI introComplete={introComplete} />}
        
        {/* UI Overlay - always mounted; controls hint visible after intro and after menu delay */}
        <UI visible={introComplete && !showMenu && !showContent && menuDelayOver} />

        {/* Menu Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <MenuOverlay isVisible={showMenu} onNavigateToLocation={handleNavigateToLocation} />}

        {/* Content Box - hidden when loading screen is visible */}
        {!showLoadingScreen && <Content isVisible={showContent} content={currentContent} />}

        {/* Menu Icon - visible when intro is complete */}
        {!showLoadingScreen && introComplete && (
          <MenuIcon onClick={handleMenuIconClick} isVisible={true} isMenuOpen={showMenu} />
        )}

        {/* Loading Screen - now just the start button overlay */}
        <LoadingScreen onStart={handleStart} isVisible={showLoadingScreen} />
      </div>
    </Router>
  );
}

export default App;
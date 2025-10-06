import React, { useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './components/IsometricScene';
import UI from './components/UI';
import ControlsUI from './components/ControlsUI';
import LoadingScreen from './components/LoadingScreen';
import MenuOverlay from './components/MenuOverlay';
import MenuIcon from './components/MenuIcon';
import './App.css';
import './styles/fonts.css';

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [menuDelayOver, setMenuDelayOver] = useState(false);
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
    // Whether or not the menu is shown, the intro/menu delay is considered over after first movement
    setMenuDelayOver(true);
  }, [showMenu]);

  const handleSpacePress = useCallback(() => {
    if (!showMenu) {
      setShowMenu(true);
    }
  }, [showMenu]);

  const handleMenuIconClick = useCallback(() => {
    setShowMenu(!showMenu);
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current);
      menuTimerRef.current = null;
    }
    setMenuDelayOver(true);
  }, [showMenu]);

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
            background: 'linear-gradient(135deg, #FCF5C4 0%, #F5E8A0 50%, #E8D570 100%)'
          }}
        >
          <IsometricScene
            onIntroComplete={handleIntroComplete}
            showMenu={showMenu}
            onMovementStart={handleMovementStart}
            onSpacePress={handleSpacePress}
            characterControllerRef={characterControllerRef}
            showLoadingScreen={showLoadingScreen}
          />
        </Canvas>
        
        {/* Controls UI Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <ControlsUI introComplete={introComplete} />}
        
        {/* UI Overlay - always mounted; controls hint visible after intro and after menu delay */}
        <UI visible={introComplete && !showMenu && menuDelayOver} />

        {/* Menu Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <MenuOverlay isVisible={showMenu} onNavigateToLocation={handleNavigateToLocation} />}

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
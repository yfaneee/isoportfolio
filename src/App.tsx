import React, { useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './components/IsometricScene';
import UI from '../src/components/UI';
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
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const characterControllerRef = useRef<any>(null);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);

    menuTimerRef.current = setTimeout(() => {
      setShowMenu(true);
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
  }, [showMenu]);

  const handleSpacePress = useCallback(() => {
    if (!showMenu) {
      setShowMenu(true);
    }
  }, [showMenu]);

  const handleMenuIconClick = useCallback(() => {
    if (!showMenu) {
      setShowMenu(true);
    }
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
        {/* Three.js Canvas for the isometric world - hidden when loading screen is visible */}
        {!showLoadingScreen && (
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
            />
          </Canvas>
        )}
        
        {/* Controls UI Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <ControlsUI introComplete={introComplete} />}
        
        {/* UI Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <UI />}

        {/* Menu Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <MenuOverlay isVisible={showMenu} onNavigateToLocation={handleNavigateToLocation} />}

        {/* Menu Icon - visible when intro is complete and menu is not shown */}
        {!showLoadingScreen && introComplete && !showMenu && (
          <MenuIcon onClick={handleMenuIconClick} isVisible={!showMenu} />
        )}

        {/* Loading Screen */}
        <LoadingScreen onStart={handleStart} isVisible={showLoadingScreen} />
      </div>
    </Router>
  );
}

export default App;
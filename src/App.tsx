import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './components/IsometricScene';
import UI from '../src/components/UI';
import ControlsUI from './components/ControlsUI';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
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
            <IsometricScene onIntroComplete={handleIntroComplete} />
          </Canvas>
        )}
        
        {/* Controls UI Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <ControlsUI introComplete={introComplete} />}
        
        {/* UI Overlay - hidden when loading screen is visible */}
        {!showLoadingScreen && <UI />}
        
        {/* Loading Screen */}
        <LoadingScreen onStart={handleStart} isVisible={showLoadingScreen} />
      </div>
    </Router>
  );
}

export default App;
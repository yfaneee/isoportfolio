import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './components/IsometricScene';
import UI from '../src/components/UI';
import ControlsUI from './components/ControlsUI';
import './App.css';

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Three.js Canvas for the isometric world */}
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
        
        {/* Controls UI Overlay */}
        <ControlsUI introComplete={introComplete} />
        
        {/* UI Overlay */}
        <UI />
      </div>
    </Router>
  );
}

export default App;
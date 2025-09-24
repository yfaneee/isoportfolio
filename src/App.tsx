import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './components/IsometricScene';
import UI from '../src/components/UI';
import './App.css';

function App() {
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
          <IsometricScene />
        </Canvas>
        
        {/* UI Overlay */}
        <UI />
      </div>
    </Router>
  );
}

export default App;
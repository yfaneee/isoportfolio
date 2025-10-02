import React, { useState, useCallback } from 'react';
import IsometricWorld from '../components/IsometricWorld';
import CharacterController from '../components/CharacterController';
import CameraController from '../components/CameraController';
import PlatformDebugger from '../components/PlatformDebugger';

interface IsometricSceneProps {
  onIntroComplete: () => void;
}

const IsometricScene: React.FC<IsometricSceneProps> = ({ onIntroComplete }) => {
  const [characterPosition, setCharacterPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [introComplete, setIntroComplete] = useState(false);

  const handlePositionChange = useCallback((position: [number, number, number]) => {
    setCharacterPosition(position);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    onIntroComplete();
  }, [onIntroComplete]);

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={1.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={2}
        castShadow={false}
      />
      <directionalLight 
        position={[-10, 10, -5]} 
        intensity={0.8}
        castShadow={false}
      />
      
      {/* Custom camera controller with intro animation */}
      <CameraController 
        targetPosition={characterPosition}
        introComplete={introComplete}
        onIntroComplete={handleIntroComplete}
      />
      
      {/* The isometric world */}
      <IsometricWorld />
      
      {/* Debug platform boundaries (red lines) */}
      <PlatformDebugger enabled={true} />
      
      {/* The playable character */}
      <CharacterController 
        onPositionChange={handlePositionChange}
        introComplete={introComplete}
      />
    </>
  );
};

export default IsometricScene;

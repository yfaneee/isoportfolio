import React, { useState, useCallback, useRef } from 'react';
import IsometricWorld from '../components/IsometricWorld';
import CharacterController from '../components/CharacterController';
import CameraController from '../components/CameraController';
import PlatformDebugger from '../components/PlatformDebugger';

interface IsometricSceneProps {
  onIntroComplete: () => void;
}

const IsometricScene: React.FC<IsometricSceneProps> = ({ onIntroComplete }) => {
  const [introComplete, setIntroComplete] = useState(false);
  const [isCharacterMoving, setIsCharacterMoving] = useState(false);
  const characterControllerRef = useRef<any>(null);

  // Remove the delayed position callback - camera will access position directly
  const handleMovementChange = useCallback((moving: boolean) => {
    setIsCharacterMoving(moving);
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
        characterControllerRef={characterControllerRef}
        introComplete={introComplete}
        onIntroComplete={handleIntroComplete}
        isCharacterMoving={isCharacterMoving}
      />
      
      {/* The isometric world */}
      <IsometricWorld />
      
      {/* Debug platform boundaries (red lines) */}
      <PlatformDebugger enabled={false} />
      
      {/* The playable character */}
      <CharacterController 
        ref={characterControllerRef}
        onMovementChange={handleMovementChange}
        introComplete={introComplete}
      />
    </>
  );
};

export default IsometricScene;

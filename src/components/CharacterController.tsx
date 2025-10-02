import React from 'react';
import { useFrame } from '@react-three/fiber';
import Character from './Character';
import { useCharacterControls } from '../hooks/useCharacterControls';

interface CharacterControllerProps {
  onPositionChange: (position: [number, number, number]) => void;
  introComplete: boolean;
}

const CharacterController: React.FC<CharacterControllerProps> = ({ 
  onPositionChange,
  introComplete 
}) => {
  const { updateCharacter, positionRef, rotationRef, isMovingRef } = useCharacterControls([0, 0, 0]);

  // Update character movement every frame
  useFrame((state, delta) => {
    // Only allow movement after intro is complete
    if (introComplete) {
      updateCharacter(delta);
      onPositionChange(positionRef.current);
    }
  });

  return (
    <Character
      position={positionRef.current}
      rotation={rotationRef.current}
      isMoving={isMovingRef.current}
    />
  );
};

export default CharacterController;


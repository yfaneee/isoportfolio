import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Character from './Character';
import { useCharacterControls } from '../hooks/useCharacterControls';

interface CharacterControllerProps {
  onMovementChange: (moving: boolean) => void;
  introComplete: boolean;
  onSpacePress?: () => void;
}

const CharacterController = React.forwardRef<any, CharacterControllerProps>(({ 
  onMovementChange,
  introComplete,
  onSpacePress
}, ref) => {
  const { updateCharacter, positionRef, rotationRef, isMovingRef, centerOnSlab, teleportToLocation } = useCharacterControls([0, 0, 0], onSpacePress);
  const lastMoving = useRef(false);

  // Expose direct position access method
  React.useImperativeHandle(ref, () => ({
    getPosition: () => positionRef.current,
    getRotation: () => rotationRef.current,
    isMoving: () => isMovingRef.current,
    teleportToLocation: (location: string) => teleportToLocation(location)
  }));

  // Force re-render by using state 
  const [renderPosition, setRenderPosition] = React.useState<[number, number, number]>(positionRef.current);
  
  // SINGLE useFrame loop - Update character AND force re-render
  useFrame((state, delta) => {
    if (introComplete) {
      updateCharacter(delta);
      
      setRenderPosition(positionRef.current);
      
      // Only trigger movement callback when it changes
      if (isMovingRef.current !== lastMoving.current) {
        onMovementChange(isMovingRef.current);
        lastMoving.current = isMovingRef.current;
      }
    }
  });

  return (
    <Character
      position={renderPosition}
      rotation={rotationRef.current}
      isMoving={isMovingRef.current}
    />
  );
});

export default CharacterController;
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Character from './Character';
import { useCharacterControls } from '../hooks/useCharacterControls';

interface CharacterControllerProps {
  onMovementChange: (moving: boolean) => void;
  introComplete: boolean;
  onSpacePress?: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  opacity?: number;
}

const CharacterController = React.forwardRef<any, CharacterControllerProps>(({ 
  onMovementChange,
  introComplete,
  onSpacePress,
  onNavigatePrev,
  onNavigateNext,
  opacity = 1
}, ref) => {
  const { updateCharacter, positionRef, rotationRef, isMovingRef, centerOnSlab, teleportToLocation, handleTouch, stopMovement } = useCharacterControls([0, 0.22 + 0.11, 0], onSpacePress, onNavigatePrev, onNavigateNext);
  const lastMoving = useRef(false);
  const introCompletedRef = useRef(false);
  const [position, setPosition] = React.useState<[number, number, number]>(positionRef.current);

  // Expose direct position access method
  React.useImperativeHandle(ref, () => ({
    getPosition: () => positionRef.current,
    getRotation: () => rotationRef.current,
    isMoving: () => isMovingRef.current,
    teleportToLocation: (location: string) => teleportToLocation(location),
    handleTouch: (touch: Touch) => handleTouch(touch),
    stopMovement: () => stopMovement()
  }));

  useFrame((state, delta) => {
    if (introComplete) {
      // No need to add visual offset
      introCompletedRef.current = true;
      
      const oldPos = position;
      updateCharacter(delta);
      
      const newPos = positionRef.current;
      if (oldPos[0] !== newPos[0] || oldPos[1] !== newPos[1] || oldPos[2] !== newPos[2]) {
        setPosition([...newPos]);
      }
      
      if (isMovingRef.current !== lastMoving.current) {
        onMovementChange(isMovingRef.current);
        lastMoving.current = isMovingRef.current;
      }
    }
  });

  return (
    <Character
      position={position}
      rotation={rotationRef.current}
      isMoving={isMovingRef.current}
      opacity={opacity}
    />
  );
});

export default CharacterController;
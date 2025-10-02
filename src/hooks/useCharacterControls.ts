import { useRef, useEffect } from 'react';
import { constrainToPlatform, smoothHeightTransition } from '../utils/collisionSystem';

interface CharacterState {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
}

export const useCharacterControls = (initialPosition: [number, number, number] = [0, 0, 0]) => {
  // Use refs instead of state to avoid re-renders
  const positionRef = useRef<[number, number, number]>(initialPosition);
  const rotationRef = useRef(0);
  const isMovingRef = useRef(false);
  
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        keysRef.current.forward = true;
      } else if (key === 's' || key === 'arrowdown') {
        keysRef.current.backward = true;
      } else if (key === 'a' || key === 'arrowleft') {
        keysRef.current.left = true;
      } else if (key === 'd' || key === 'arrowright') {
        keysRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        keysRef.current.forward = false;
      } else if (key === 's' || key === 'arrowdown') {
        keysRef.current.backward = false;
      } else if (key === 'a' || key === 'arrowleft') {
        keysRef.current.left = false;
      } else if (key === 'd' || key === 'arrowright') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update character position based on keys (called every frame)
  const updateCharacter = (delta: number) => {
    const speed = 3; // Balanced speed - not too fast, not too slow
    let dx = 0;
    let dz = 0;

    // Calculate movement direction
    if (keysRef.current.forward) dz -= 1;
    if (keysRef.current.backward) dz += 1;
    if (keysRef.current.left) dx -= 1;
    if (keysRef.current.right) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dz !== 0) {
      const length = Math.sqrt(dx * dx + dz * dz);
      dx /= length;
      dz /= length;
    }

    // Update position with collision detection
    if (dx !== 0 || dz !== 0) {
      // Calculate new position
      const newX = positionRef.current[0] + dx * speed * delta;
      const newZ = positionRef.current[2] + dz * speed * delta;
      const currentY = positionRef.current[1];
      const currentX = positionRef.current[0];
      const currentZ = positionRef.current[2];
      
      // Apply collision detection and platform constraints
      const constrained = constrainToPlatform(newX, newZ, currentY, currentX, currentZ);
      
      if (constrained.onPlatform) {
        // Smooth height transition (for stairs)
        const smoothY = smoothHeightTransition(currentY, constrained.y, delta);
        
        positionRef.current = [constrained.x, smoothY, constrained.z];
        rotationRef.current = Math.atan2(dx, dz);
        isMovingRef.current = true;
      } else {
        // Can't move there, stay in place
        isMovingRef.current = false;
      }
    } else {
      isMovingRef.current = false;
    }
  };

  const getCharacterState = (): CharacterState => ({
    position: positionRef.current,
    rotation: rotationRef.current,
    isMoving: isMovingRef.current,
  });

  return {
    updateCharacter,
    getCharacterState,
    positionRef,
    rotationRef,
    isMovingRef,
  };
};


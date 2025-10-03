import { useRef, useEffect } from 'react';
import { constrainToPlatform, smoothHeightTransition } from '../utils/collisionSystem';
import { isOnElevator, triggerElevator, getElevatorHeight } from '../utils/elevatorSystem';

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
  
  // SIMPLIFIED: Just go back to direct position updates for now
  // const smoothPosition = useRef<[number, number, number]>(initialPosition);
  // const targetPosition = useRef<[number, number, number]>(initialPosition);
  // const positionEasing = 0.15;
  
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false,
  });

  // Handle keyboard input - SIMPLIFIED
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
      } else if (key === 'shift') {
        if (!keysRef.current.shift) {
          keysRef.current.shift = true;
          // Check if on elevator and trigger it
          const [x, , z] = positionRef.current;
          if (isOnElevator(x, z)) {
            triggerElevator();
          }
        }
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
      } else if (key === 'shift') {
        keysRef.current.shift = false;
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
    const [currentX, currentY, currentZ] = positionRef.current;
    
    // Always check elevator first (even without movement input)
    if (isOnElevator(currentX, currentZ)) {
      const elevatorY = getElevatorHeight();
      if (Math.abs(currentY - elevatorY) > 0.1) {
        positionRef.current = [currentX, elevatorY, currentZ];
        return; 
      }
    }
    
    // Check if any movement keys are pressed
    const hasInput = keysRef.current.forward || keysRef.current.backward || 
                     keysRef.current.left || keysRef.current.right;
    
    if (!hasInput) {
      isMovingRef.current = false;
      return; 
    }
    
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

    // Add back collision detection
    const speed = 3;
    const newX = currentX + dx * speed * delta;
    const newZ = currentZ + dz * speed * delta;
    
    const constrained = constrainToPlatform(newX, newZ, currentY, currentX, currentZ);
    
    if (constrained.onPlatform) {
      let finalY = constrained.y;
      if (Math.abs(currentY - constrained.y) > 0.01) {
        finalY = smoothHeightTransition(currentY, constrained.y, delta);
      }
      
      positionRef.current = [constrained.x, finalY, constrained.z];
    } else {
      // Can't move there, stay in place
      isMovingRef.current = false;
      return;
    }
    rotationRef.current = Math.atan2(dx, dz);
    isMovingRef.current = true;
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


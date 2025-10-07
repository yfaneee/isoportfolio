import { useRef, useEffect } from 'react';
import { constrainToPlatform, smoothHeightTransition, getHeightAtPosition } from '../utils/collisionSystem';
import { isOnElevator, triggerElevator, getElevatorHeight, shiftElevator } from '../utils/elevatorSystem';

interface CharacterState {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
}

interface CharacterControlsReturn {
  updateCharacter: (delta: number) => void;
  getCharacterState: () => CharacterState;
  positionRef: React.MutableRefObject<[number, number, number]>;
  rotationRef: React.MutableRefObject<number>;
  isMovingRef: React.MutableRefObject<boolean>;
  centerOnSlab: () => void;
  teleportToLocation: (location: string) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}

export const useCharacterControls = (initialPosition: [number, number, number] = [0, 0, 0], onSpacePress?: () => void, onNavigatePrev?: () => void, onNavigateNext?: () => void) => {
  const platformHeight = getHeightAtPosition(initialPosition[0], initialPosition[2]);
  const adjustedPosition: [number, number, number] = platformHeight !== null
    ? [initialPosition[0], platformHeight, initialPosition[2]]
    : initialPosition;

  const positionRef = useRef<[number, number, number]>(adjustedPosition);
  const rotationRef = useRef(0);
  const isMovingRef = useRef(false);

  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
  });


  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Check if content is open 
      const isContentOpen = document.querySelector('.content-box.visible') !== null;
      
      // Handle arrow keys for navigation when content is open
      if (isContentOpen) {
        if (key === 'arrowleft') {
          e.preventDefault();
          console.log('Left arrow pressed, onNavigatePrev:', onNavigatePrev);
          if (onNavigatePrev) {
            onNavigatePrev();
          }
          return;
        } else if (key === 'arrowright') {
          e.preventDefault();
          console.log('Right arrow pressed, onNavigateNext:', onNavigateNext);
          if (onNavigateNext) {
            onNavigateNext();
          }
          return;
        }
      }
      
      // Normal movement controls 
      if (key === 'w') {
        keysRef.current.forward = true;
      } else if (key === 's') {
        keysRef.current.backward = true;
      } else if (key === 'a') {
        keysRef.current.left = true;
      } else if (key === 'd') {
        keysRef.current.right = true;
      } else if (!isContentOpen && key === 'arrowup') {
        keysRef.current.forward = true;
      } else if (!isContentOpen && key === 'arrowdown') {
        keysRef.current.backward = true;
      } else if (!isContentOpen && key === 'arrowleft') {
        keysRef.current.left = true;
      } else if (!isContentOpen && key === 'arrowright') {
        keysRef.current.right = true;
      } else if (key === ' ') {
        if (!keysRef.current.space) {
          keysRef.current.space = true;
          // Check if on elevator and trigger it
          const [x, , z] = positionRef.current;
          if (isOnElevator(x, z)) {
            triggerElevator();
          } else {
            // Check if on smaller-block-slab 
            const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;
            // Check if on high-block-slab
            const isOnHighBlockSlab = x >= 2.55 && x <= 3.45 && z >= -12.45 && z <= -11.55;
            // Check if on middle bone white slab 
            const isOnMiddleSlab = x >= -0.45 && x <= 0.45 && z >= -0.45 && z <= 0.45;
            
            // Check staircase slabs
            const isOnStaircaseSlab1 = x >= -11.075 && x <= -10.175 && z >= 1.05 && z <= 1.95;
            const isOnStaircaseSlab2 = x >= -14.075 && x <= -13.175 && z >= 1.05 && z <= 1.95;
            const isOnStaircaseSlab3 = x >= -14.075 && x <= -13.175 && z >= -1.95 && z <= -1.05;
            const isOnStaircaseSlab4 = x >= -11.075 && x <= -10.175 && z >= -1.95 && z <= -1.05;
            const isOnStaircaseSlab5 = x >= -8.075 && x <= -7.175 && z >= -1.95 && z <= -1.05;
            
            // Check artwork platform slab
            const isOnArtworkSlab = x >= 10.05 && x <= 10.95 && z >= -0.45 && z <= 0.45;
            
            if ((isOnSmallerBlockSlab || isOnHighBlockSlab || isOnMiddleSlab || 
                 isOnStaircaseSlab1 || isOnStaircaseSlab2 || isOnStaircaseSlab3 || 
                 isOnStaircaseSlab4 || isOnStaircaseSlab5 || isOnArtworkSlab) && onSpacePress) {
              centerOnSlab();
              onSpacePress();
            }
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
      } else if (key === ' ') {
        keysRef.current.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onNavigatePrev, onNavigateNext]);

  // Update character position based on keys 
  const updateCharacter = (delta: number) => {
    const [currentX, currentY, currentZ] = positionRef.current;
    
    // Check if any movement keys are pressed
    const hasInput = keysRef.current.forward || keysRef.current.backward || 
                     keysRef.current.left || keysRef.current.right;
    
    // Handle elevator logic - simplified
    if (isOnElevator(currentX, currentZ)) {
      const elevatorY = getElevatorHeight();
      if (Math.abs(currentY - elevatorY) > 0.2) {
        positionRef.current = [currentX, elevatorY, currentZ];
      }
      shiftElevator.wasOnElevator = true;
    } else {
      shiftElevator.wasOnElevator = false;
    }
    
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

  const centerOnSlab = () => {
    const [x, , z] = positionRef.current;
    
    // Determine which slab we're on and center accordingly
    const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;
    const isOnHighBlockSlab = x >= 2.55 && x <= 3.45 && z >= -12.45 && z <= -11.55;
    const isOnMiddleSlab = x >= -0.45 && x <= 0.45 && z >= -0.45 && z <= 0.45;
    
    // Check staircase slabs
    const isOnStaircaseSlab1 = x >= -11.075 && x <= -10.175 && z >= 1.05 && z <= 1.95;
    const isOnStaircaseSlab2 = x >= -14.075 && x <= -13.175 && z >= 1.05 && z <= 1.95;
    const isOnStaircaseSlab3 = x >= -14.075 && x <= -13.175 && z >= -1.95 && z <= -1.05;
    const isOnStaircaseSlab4 = x >= -11.075 && x <= -10.175 && z >= -1.95 && z <= -1.05;
    const isOnStaircaseSlab5 = x >= -8.075 && x <= -7.175 && z >= -1.95 && z <= -1.05;
    
    // Check artwork platform slab
    const isOnArtworkSlab = x >= 10.05 && x <= 10.95 && z >= -0.45 && z <= 0.45;
    
    let centerX = x;
    let centerZ = z;
    
    if (isOnSmallerBlockSlab) {
      centerX = -1.5;
      centerZ = -10.35;
    } else if (isOnHighBlockSlab) {
      centerX = 3;
      centerZ = -12;
    } else if (isOnMiddleSlab) {
      centerX = 0;
      centerZ = 0;
    } else if (isOnStaircaseSlab1) {
      centerX = -10.625;
      centerZ = 1.5;
    } else if (isOnStaircaseSlab2) {
      centerX = -13.625;
      centerZ = 1.5;
    } else if (isOnStaircaseSlab3) {
      centerX = -13.625;
      centerZ = -1.5;
    } else if (isOnStaircaseSlab4) {
      centerX = -10.625;
      centerZ = -1.5;
    } else if (isOnStaircaseSlab5) {
      centerX = -7.625;
      centerZ = -1.5;
    } else if (isOnArtworkSlab) {
      centerX = 10.5;
      centerZ = 0;
    }
    
    const centerHeight = getHeightAtPosition(centerX, centerZ);
    positionRef.current = [centerX, centerHeight || 0.22, centerZ];
  };

  const teleportToLocation = (location: string) => {
    let targetPosition: [number, number, number] = [0, 0, 0];
    
    switch (location) {
      case 'transferable':
        // Transferable production - first staircase slab
        targetPosition = [-13.625, 4.22, 1.5];
        break;
      case 'conceptualize':
        // Conceptualize - second staircase slab
        targetPosition = [-10.625, 3.74, 1.5];
        break;
      case 'creative':
        // Creative iterations - third staircase slab
        targetPosition = [-13.625, 4.73, -1.5];
        break;
      case 'professional':
        // Professional standards - fourth staircase slab
        targetPosition = [-10.625, 5.23, -1.5];
        break;
      case 'leadership':
        // Personal leadership - fifth staircase slab
        targetPosition = [-7.625, 5.73, -1.5];
        break;
      case 'studio':
        // Studio - high block
        targetPosition = [3, 3.43, -12];
        break;
      case 'ironfilms':
        // IronFilms - smaller block
        targetPosition = [-1.5, 1.78, -10.4];
        break;
      case 'artwork':
        // Artwork - artwork platform
        targetPosition = [10.50, -1.90, -0.01];
        break;
      case 'projects':
        // Projects - 12x3 platform
        targetPosition = [0, -2.6, 15.9];
        break;
      default:
        // Default to center slab
        const centerHeight = getHeightAtPosition(0, 0);
        targetPosition = [0, centerHeight || 0.22, 0];
    }
    
    // Get the correct height at the target position
    const correctHeight = getHeightAtPosition(targetPosition[0], targetPosition[2]);
    if (correctHeight !== null) {
      targetPosition[1] = correctHeight;
    }
    
    // Fix elevator state when teleporting
    if (location === 'artwork') {
      shiftElevator.currentY = shiftElevator.bottomY;
      shiftElevator.wasOnElevator = false; 
    } else {
      // Reset elevator tracking for non-elevator teleports
      shiftElevator.wasOnElevator = false;
    }
    
    positionRef.current = targetPosition;
    
    // Validate position with collision system to prevent bugs
    const validated = constrainToPlatform(targetPosition[0], targetPosition[2], targetPosition[1], targetPosition[0], targetPosition[2]);
    if (validated.onPlatform) {
      positionRef.current = [validated.x, validated.y, validated.z];
    }
  };

  // Touch handler for mobile devices
  const handleTouch = (touch: Touch) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    
    // Determine direction based on touch position relative to center
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal movement
      if (deltaX > 0) {
        keysRef.current.right = true;
        keysRef.current.left = false;
      } else {
        keysRef.current.left = true;
        keysRef.current.right = false;
      }
      keysRef.current.forward = false;
      keysRef.current.backward = false;
    } else {
      // Vertical movement
      if (deltaY > 0) {
        keysRef.current.backward = true;
        keysRef.current.forward = false;
      } else {
        keysRef.current.forward = true;
        keysRef.current.backward = false;
      }
      keysRef.current.left = false;
      keysRef.current.right = false;
    }
  };

  const stopMovement = () => {
    keysRef.current.forward = false;
    keysRef.current.backward = false;
    keysRef.current.left = false;
    keysRef.current.right = false;
  };

  return {
    updateCharacter,
    getCharacterState,
    positionRef,
    rotationRef,
    isMovingRef,
    centerOnSlab,
    teleportToLocation,
    handleTouch,
    stopMovement,
    onNavigatePrev,
    onNavigateNext,
  };
};


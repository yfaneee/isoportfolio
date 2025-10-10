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

const VISUAL_OFFSET = 0.11; 

export const useCharacterControls = (initialPosition: [number, number, number] = [0, 0, 0], onSpacePress?: () => void, onNavigatePrev?: () => void, onNavigateNext?: () => void) => {
  let adjustedPosition: [number, number, number];
  if (initialPosition[1] !== 0) {
    adjustedPosition = initialPosition;
  } else {
    const platformHeight = getHeightAtPosition(initialPosition[0], initialPosition[2]);
    adjustedPosition = platformHeight !== null
      ? [initialPosition[0], platformHeight, initialPosition[2]]
      : initialPosition;
  }

  const positionRef = useRef<[number, number, number]>(adjustedPosition);
  const rotationRef = useRef(0);
  const isMovingRef = useRef(false);

  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false,
  });

  // Simple collision system
  const lastCollisionCheck = useRef(0);
  const targetHeight = useRef<number | null>(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Check if content is open 
      const isContentOpen = document.querySelector('.content-box.visible') !== null;
      
      if (isContentOpen) {
        if (key === 'arrowleft' || key === 'q') {
          e.preventDefault();
          console.log('Left arrow/Q pressed, onNavigatePrev:', onNavigatePrev);
          if (onNavigatePrev) {
            onNavigatePrev();
          }
          return;
        } else if (key === 'arrowright' || key === 'e') {
          e.preventDefault();
          console.log('Right arrow/E pressed, onNavigateNext:', onNavigateNext);
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
      } else if (key === 'shift') {
        keysRef.current.shift = true;
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
            
            // Check GitHub project slabs on 18x3 platform
            const isOnGithubSlab1 = x >= -1.45 && x <= -0.55 && z >= 8.7 && z <= 9.6;   
            const isOnGithubSlab2 = x >= -1.45 && x <= -0.55 && z >= 16.2 && z <= 17.1; 
            const isOnGithubSlab3 = x >= -1.45 && x <= -0.55 && z >= 23.7 && z <= 24.6; 
            
            if ((isOnSmallerBlockSlab || isOnHighBlockSlab || isOnMiddleSlab || 
                 isOnStaircaseSlab1 || isOnStaircaseSlab2 || isOnStaircaseSlab3 || 
                 isOnStaircaseSlab4 || isOnStaircaseSlab5 || isOnArtworkSlab ||
                 isOnGithubSlab1 || isOnGithubSlab2 || isOnGithubSlab3) && onSpacePress) {
              centerOnSlab();
              onSpacePress();
              if (isOnGithubSlab1 || isOnGithubSlab2 || isOnGithubSlab3) {
                keysRef.current.space = false;
              }
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
      } else if (key === 'shift') {
        keysRef.current.shift = false;
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

  // Fixed update character - consistent collision vs visual separation
  const updateCharacter = (delta: number) => {
    const [currentX, currentY, currentZ] = positionRef.current;
    
    // Always work with collision Y
    const collisionY = currentY - VISUAL_OFFSET;
    
    const hasInput = keysRef.current.forward || keysRef.current.backward || 
                     keysRef.current.left || keysRef.current.right;
    
    // Handle elevator logic using collision coordinates
    const onElevator = isOnElevator(currentX, currentZ);
    if (onElevator) {
      const elevatorY = getElevatorHeight();
      if (Math.abs(collisionY - elevatorY) > 0.05) {
        positionRef.current = [currentX, elevatorY + VISUAL_OFFSET, currentZ];
      }
      shiftElevator.wasOnElevator = true;
      
      if (!hasInput) {
        isMovingRef.current = false;
        return;
      }
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

    // Movement with collision detection using collision coordinates
    const baseSpeed = 3;
    const speedMultiplier = keysRef.current.shift ? 2 : 1; 
    const speed = baseSpeed * speedMultiplier;
    const newX = currentX + dx * speed * delta;
    const newZ = currentZ + dz * speed * delta;
    
    // Use collision Y for all collision calculations
    const constrained = constrainToPlatform(newX, newZ, collisionY, currentX, currentZ);
    
    if (constrained.onPlatform) {
      const now = performance.now();
      const shouldUpdateHeight = now - lastCollisionCheck.current > 50; 
      
      let finalCollisionY = collisionY;
      
      if (shouldUpdateHeight) {
        const heightDiff = Math.abs(collisionY - constrained.y);
        
        if (heightDiff > 0.05) {
          targetHeight.current = constrained.y;
          lastCollisionCheck.current = now;
        }
      }
      
      if (targetHeight.current !== null) {
        const heightDiff = Math.abs(collisionY - targetHeight.current);
        
        if (heightDiff > 0.1) {
          finalCollisionY = smoothHeightTransition(collisionY, targetHeight.current, delta);
        } else if (heightDiff > 0.02) {
          finalCollisionY = collisionY + (targetHeight.current - collisionY) * 0.08;
        }
      }
      
      // Always add visual offset to final position
      positionRef.current = [constrained.x, finalCollisionY + VISUAL_OFFSET, constrained.z];
    } else {
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
    positionRef.current = [centerX, (centerHeight || 0.22) + VISUAL_OFFSET, centerZ];
  };

  const teleportToLocation = (location: string) => {
    let targetPosition: [number, number, number] = [0, 0, 0];
    
    switch (location) {
      case 'transferable':
        targetPosition = [-13.625, 4.22, 1.5];
        break;
      case 'conceptualize':
        targetPosition = [-10.625, 3.74, 1.5];
        break;
      case 'creative':
        targetPosition = [-13.625, 4.73, -1.5];
        break;
      case 'professional':
        targetPosition = [-10.625, 5.23, -1.5];
        break;
      case 'leadership':
        targetPosition = [-7.625, 5.73, -1.5];
        break;
      case 'studio':
        targetPosition = [3, 3.43, -12];
        break;
      case 'ironfilms':
        targetPosition = [-1.5, 1.78, -10.4];
        break;
      case 'artwork':
        targetPosition = [10.50, -1.90, -0.01];
        break;
      case 'projects':
        targetPosition = [0, -2.6, 15.9];
        break;
      default:
        const centerHeight = getHeightAtPosition(0, 0);
        targetPosition = [0, centerHeight || 0.22, 0];
    }
    
    // Get the correct height at the target position with visual offset
    const correctHeight = getHeightAtPosition(targetPosition[0], targetPosition[2]);
    if (correctHeight !== null) {
      targetPosition[1] = correctHeight + VISUAL_OFFSET;
    } else {
      targetPosition[1] = targetPosition[1] + VISUAL_OFFSET;
    }
    
    // Fix elevator state when teleporting
    if (location === 'artwork') {
      shiftElevator.currentY = shiftElevator.bottomY;
      shiftElevator.wasOnElevator = false; 
    } else {
      shiftElevator.wasOnElevator = false;
    }
    
    positionRef.current = targetPosition;
    targetHeight.current = targetPosition[1] - VISUAL_OFFSET;
    
    // Validate position with collision system
    const validated = constrainToPlatform(targetPosition[0], targetPosition[2], targetPosition[1] - VISUAL_OFFSET, targetPosition[0], targetPosition[2]);
    if (validated.onPlatform) {
      positionRef.current = [validated.x, validated.y + VISUAL_OFFSET, validated.z];
      targetHeight.current = validated.y;
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
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Character from './Character';
import { useCharacterControls } from '../hooks/useCharacterControls';
import { isOnElevator } from '../utils/elevatorSystem';

interface CharacterControllerProps {
  onMovementChange: (moving: boolean) => void;
  introComplete: boolean;
  onSpacePress?: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  opacity?: number;
  scale?: number;
  rotationY?: number;
  positionOffset?: [number, number, number];
  modelPath: string;
  onPositionUpdate?: (position: { x: number; z: number }) => void;
  onSlabInteraction?: (isOnSlab: boolean, slabType?: string, githubUrl?: string) => void;
  disableMovement?: boolean;
}

const CharacterController = React.forwardRef<any, CharacterControllerProps>(({ 
  onMovementChange,
  introComplete,
  onSpacePress,
  onNavigatePrev,
  onNavigateNext,
  opacity = 1,
  scale = 1,
  rotationY = 0,
  positionOffset = [0, 0, 0],
  modelPath,
  onPositionUpdate,
  onSlabInteraction,
  disableMovement = false
}, ref) => {
  const { updateCharacter, positionRef, rotationRef, isMovingRef, teleportToLocation, handleTouch, stopMovement, resetMovementState } = useCharacterControls([0, 0.22 + 0.11, 0], onSpacePress, onNavigatePrev, onNavigateNext);
  const lastMoving = useRef(false);
  const introCompletedRef = useRef(false);
  const [position, setPosition] = React.useState<[number, number, number]>(positionRef.current);
  const [isMoving, setIsMoving] = React.useState(false);
  const [animationResetCounter] = React.useState(0);
  const lastResetRef = useRef(0);

  // Expose direct position access method
  React.useImperativeHandle(ref, () => ({
    getPosition: () => positionRef.current,
    getRotation: () => rotationRef.current,
    isMoving: () => isMovingRef.current,
    teleportToLocation: (location: string) => {
      const now = Date.now();
      if (now - lastResetRef.current > 1000) {
        teleportToLocation(location);
      } else {
        teleportToLocation(location);
      }
    },
    handleTouch: (touch: Touch) => handleTouch(touch),
    stopMovement: () => stopMovement(),
    resetMovementState: () => resetMovementState()
  }));

  useFrame((state, delta) => {
    // Early return if not ready
    if (!introComplete || disableMovement) return;
    
    // No need to add visual offset
    introCompletedRef.current = true;
      
      const oldPos = position;
      const oldMoving = isMoving;
      updateCharacter(delta);
      
      const newPos = positionRef.current;
      const newMoving = isMovingRef.current;
      
      if (oldPos[0] !== newPos[0] || oldPos[1] !== newPos[1] || oldPos[2] !== newPos[2]) {
        setPosition([...newPos]);
        
        if (onPositionUpdate) {
          onPositionUpdate({ x: newPos[0], z: newPos[2] });
        }

        // Check if character is on an interactive slab
        if (onSlabInteraction) {
          const isOnMainSlab = 
            newPos[0] >= -0.5 && newPos[0] <= 0.5 && 
            newPos[2] >= -0.5 && newPos[2] <= 0.5;
          
          // Check Learning Outcomes slabs 
          const learningOutcomesSlabs = [
            { x: -10.625, z: 1.5, id: 'lo1' },  
            { x: -13.625, z: 1.5, id: 'lo2' },  
            { x: -13.625, z: -1.5, id: 'lo3' }, 
            { x: -10.625, z: -1.5, id: 'lo4' }, 
            { x: -7.625, z: -1.5, id: 'lo5' }   
          ];
          
          const currentLOSlab = learningOutcomesSlabs.find(slab => 
            newPos[0] >= slab.x - 0.45 && newPos[0] <= slab.x + 0.45 && 
            newPos[2] >= slab.z - 0.45 && newPos[2] <= slab.z + 0.45
          );
          
          // Check Project & Studio slabs on 5x5 grid
          const projectStudioSlabs = [
            { x: 3, z: -12, id: 'project-studio' },    
            { x: -1.5, z: -10.4, id: 'smaller-block' } 
          ];
          
          const currentProjectStudioSlab = projectStudioSlabs.find(slab => 
            newPos[0] >= slab.x - 0.45 && newPos[0] <= slab.x + 0.45 && 
            newPos[2] >= slab.z - 0.45 && newPos[2] <= slab.z + 0.45
          );

          // Check Artwork slab (octagonal platform)
          const isOnArtworkSlab = 
            newPos[0] >= 10.05 && newPos[0] <= 10.95 && 
            newPos[2] >= -0.46 && newPos[2] <= 0.44;

          // Check GitHub project slabs on 18x3 platform 
          const githubProjectSlabs = [
            { x: 1.2, z: 9.15, id: 'github-castle', url: 'https://git.fhict.nl/I503826/castleportfolio' },
            { x: 1.2, z: 16.65, id: 'github-holleman', url: 'https://github.com/yfaneee/holleman' },
            { x: 1.2, z: 24.15, id: 'github-space', url: 'https://github.com/yfaneee/SpacePortfolio' },
            { x: 1.2, z: 31.65, id: 'github-spotify', url: 'https://github.com/yfaneee/SpotifyFolio' }
          ];
          
          // Check NEW OUTLINE BUTTON SLABS 
          const websiteButtonSlabs = [
            { x: -1, z: 9.15, id: 'website-castle', url: 'https://i503826.hera.fontysict.net/castle/' },
            { x: -1, z: 16.65, id: 'website-holleman', url: 'https://holleman.vercel.app/' },
            { x: -1, z: 24.15, id: 'website-space', url: 'https://space-portfolio-one-mu.vercel.app/' },
            { x: -1, z: 31.65, id: 'website-spotify', url: 'https://spotify-folio.vercel.app/' }
          ];
          
          const currentGithubSlab = githubProjectSlabs.find(slab => 
            newPos[0] >= slab.x - 0.45 && newPos[0] <= slab.x + 0.45 && 
            newPos[2] >= slab.z - 0.45 && newPos[2] <= slab.z + 0.45
          );
          
          const currentWebsiteButtonSlab = websiteButtonSlabs.find(slab => 
            newPos[0] >= slab.x - 0.45 && newPos[0] <= slab.x + 0.45 && 
            newPos[2] >= slab.z - 0.45 && newPos[2] <= slab.z + 0.45
          );
          
          // Check if on elevator
          const isOnElevatorPressurePlate = isOnElevator(newPos[0], newPos[2]);
          
          if (isOnMainSlab) {
            onSlabInteraction?.(true, 'main');
          } else if (currentLOSlab) {
            onSlabInteraction?.(true, currentLOSlab.id);
          } else if (currentProjectStudioSlab) {
            onSlabInteraction?.(true, currentProjectStudioSlab.id);
          } else if (isOnArtworkSlab) {
            onSlabInteraction?.(true, 'artwork');
          } else if (currentGithubSlab) {
            onSlabInteraction?.(true, currentGithubSlab.id, currentGithubSlab.url);
          } else if (currentWebsiteButtonSlab) {
            onSlabInteraction?.(true, currentWebsiteButtonSlab.id, currentWebsiteButtonSlab.url);
          } else if (isOnElevatorPressurePlate) {
            onSlabInteraction?.(true, 'elevator');
          } else {
            onSlabInteraction?.(false);
          }
        }
      }
      
      // Update isMoving state if it changed
      if (oldMoving !== newMoving) {
        setIsMoving(newMoving);
      }
      
      if (isMovingRef.current !== lastMoving.current) {
        onMovementChange(isMovingRef.current);
        lastMoving.current = isMovingRef.current;
      }
  });

  return (
    <Character
      position={[
        position[0] + positionOffset[0], 
        position[1] + positionOffset[1], 
        position[2] + positionOffset[2]
      ]}
      rotation={rotationRef.current}
      magicalRotationY={rotationY}
      isMoving={isMoving}
      opacity={opacity}
      scale={scale}
      modelPath={modelPath}
      forceAnimationReset={animationResetCounter}
    />
  );
});

export default CharacterController;

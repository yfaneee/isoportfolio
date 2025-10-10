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
  modelPath,
  onPositionUpdate,
  onSlabInteraction,
  disableMovement = false
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
    if (introComplete && !disableMovement) {
      // No need to add visual offset
      introCompletedRef.current = true;
      
      const oldPos = position;
      updateCharacter(delta);
      
      const newPos = positionRef.current;
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

          // Check GitHub project slabs on 18x3 platform (first 3 slabs)
          const githubProjectSlabs = [
            { x: -1, z: 9.15, id: 'github-holleman', url: 'https://github.com/yfaneee/holleman' },
            { x: -1, z: 16.65, id: 'github-castle', url: 'https://github.com/yfaneee/castle-portfolio' },
            { x: -1, z: 24.15, id: 'github-space', url: 'https://github.com/yfaneee/SpacePortfolio' }
          ];
          
          const currentGithubSlab = githubProjectSlabs.find(slab => 
            newPos[0] >= slab.x - 0.45 && newPos[0] <= slab.x + 0.45 && 
            newPos[2] >= slab.z - 0.45 && newPos[2] <= slab.z + 0.45
          );
          
          // Debug logging for GitHub slabs
          if (currentGithubSlab) {
            console.log('🎯 On GitHub slab:', currentGithubSlab.id, 'at position:', newPos);
          }
          
          if (isOnMainSlab) {
            onSlabInteraction(true, 'main');
          } else if (currentLOSlab) {
            onSlabInteraction(true, currentLOSlab.id);
          } else if (currentProjectStudioSlab) {
            onSlabInteraction(true, currentProjectStudioSlab.id);
          } else if (isOnArtworkSlab) {
            onSlabInteraction(true, 'artwork');
          } else if (currentGithubSlab) {
            onSlabInteraction(true, currentGithubSlab.id, currentGithubSlab.url);
          } else {
            onSlabInteraction(false);
          }
        }
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
      modelPath={modelPath}
    />
  );
});

export default CharacterController;
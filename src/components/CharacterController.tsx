import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Character from './Character';
import { useCharacterControls } from '../hooks/useCharacterControls';
import { isOnElevator } from '../utils/elevatorSystem';
import { SOCIAL_SLABS, WEBSITE_SLABS, findSlabAt } from '../data/InteractionZones';

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
  onSlabInteraction?: (isOnSlab: boolean, slabType?: string) => void;
  disableMovement?: boolean;
  isOnTrain?: boolean;
  trainPosition?: [number, number, number];
  trainRotation?: number;
}

// Learning Outcomes slabs on the impossible staircase
const LEARNING_OUTCOME_SLABS = [
  { x: -10.625, z: 1.5, id: 'lo1' },
  { x: -13.625, z: 1.5, id: 'lo2' },
  { x: -13.625, z: -1.5, id: 'lo3' },
  { x: -10.625, z: -1.5, id: 'lo4' },
  { x: -7.625, z: -1.5, id: 'lo5' }
];

// Content slabs on the 5x5 grid
const PROJECT_STUDIO_SLABS = [
  { x: -1.5, z: -10.4, id: 'smaller-block' }
];

const findSquareSlab = (slabs: typeof LEARNING_OUTCOME_SLABS, x: number, z: number) =>
  slabs.find(slab => x >= slab.x - 0.45 && x <= slab.x + 0.45 && z >= slab.z - 0.45 && z <= slab.z + 0.45);

// Which interactive slab (if any) is under the character
const getSlabUnder = (x: number, z: number): string | null => {
  if (x >= -0.5 && x <= 0.5 && z >= -0.5 && z <= 0.5) return 'main';
  const loSlab = findSquareSlab(LEARNING_OUTCOME_SLABS, x, z);
  if (loSlab) return loSlab.id;
  const studioSlab = findSquareSlab(PROJECT_STUDIO_SLABS, x, z);
  if (studioSlab) return studioSlab.id;
  const socialSlab = findSlabAt(SOCIAL_SLABS, x, z);
  if (socialSlab) return socialSlab.id;
  // Artwork slab (octagonal platform)
  if (x >= 10.05 && x <= 10.95 && z >= -0.46 && z <= 0.44) return 'artwork';
  const websiteSlab = findSlabAt(WEBSITE_SLABS, x, z);
  if (websiteSlab) return websiteSlab.id;
  if (isOnElevator(x, z)) return 'elevator';
  return null;
};

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
  disableMovement = false,
  isOnTrain = false,
  trainPosition = [0, 0, 0],
  trainRotation = 0
}, ref) => {
  const {
    updateCharacter,
    positionRef,
    rotationRef,
    isMovingRef,
    speedRef,
    teleportToLocation,
    teleportTo,
    handleTouch,
    stopMovement,
    resetMovementState,
    haltMotion,
    handleMobileInput
  } = useCharacterControls([0, 0.22 + 0.11, 0], onSpacePress, onNavigatePrev, onNavigateNext);

  const lastMoving = useRef(false);
  // Last position reported to the app, so callbacks only fire when the character actually moved
  const lastReportedRef = useRef<[number, number, number]>([...positionRef.current]);

  // Expose direct position access method
  React.useImperativeHandle(ref, () => ({
    getPosition: () => positionRef.current,
    getRotation: () => rotationRef.current,
    isMoving: () => isMovingRef.current,
    teleportToLocation: (location: string) => teleportToLocation(location),
    teleportTo: (position: [number, number, number]) => teleportTo(position),
    handleTouch: (touch: Touch) => handleTouch(touch),
    stopMovement: () => stopMovement(),
    resetMovementState: () => resetMovementState(),
    handleMobileInput: (direction: { x: number; y: number } | null, isRunning: boolean) => handleMobileInput(direction, isRunning)
  }));

  // Movement runs before the character is drawn (-1) and before the camera follows it (0),
  // so the camera and the model always agree on where the character is this frame.
  useFrame((_, delta) => {
    if (!introComplete) return;
    if (disableMovement && !isOnTrain) {
      haltMotion();
      return;
    }

    if (isOnTrain) {
      // Ride along with the train
      positionRef.current = [trainPosition[0], trainPosition[1] + 0.8, trainPosition[2]];
      rotationRef.current = trainRotation;
      isMovingRef.current = false;
    } else {
      updateCharacter(delta);
    }

    const pos = positionRef.current;
    const last = lastReportedRef.current;
    if (pos[0] !== last[0] || pos[1] !== last[1] || pos[2] !== last[2]) {
      last[0] = pos[0];
      last[1] = pos[1];
      last[2] = pos[2];

      onPositionUpdate?.({ x: pos[0], z: pos[2] });

      if (onSlabInteraction) {
        const slab = getSlabUnder(pos[0], pos[2]);
        if (slab) {
          onSlabInteraction(true, slab);
        } else {
          onSlabInteraction(false);
        }
      }
    }

    if (isMovingRef.current !== lastMoving.current) {
      lastMoving.current = isMovingRef.current;
      onMovementChange(isMovingRef.current);
    }
  }, -2);

  // Hide character completely when on train
  if (isOnTrain) {
    return null;
  }

  return (
    <Character
      positionRef={positionRef}
      rotationRef={rotationRef}
      isMovingRef={isMovingRef}
      speedRef={speedRef}
      positionOffset={positionOffset}
      magicalRotationY={rotationY}
      opacity={opacity}
      scale={scale}
      modelPath={modelPath}
    />
  );
});

export default CharacterController;

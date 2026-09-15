import React from 'react';
import { Box } from '@react-three/drei';
import InteractiveSlab from '../InteractiveSlab';

// ============================================================================
// STAIR SYSTEMS 
// ============================================================================
interface StairSystemsProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
}

const StairSystems = React.memo<StairSystemsProps>(({ onSlabHover, onSlabClick, introComplete, activeSlabId }) => {
  const floorSize = 1.5;
  const floorHeight = 0.3;
  const spacing = 1.5;
  const wallHeight = 3.2;
  
  return (
    <>
      {/* Left stairs to tall wall (10 steps) */}
      {Array.from({ length: 10 }, (_, step) => {
        const stairStartX = -2 * spacing;
        const stairStartZ = -1 * spacing - spacing * 3 - 1.2 * spacing;
        const stairSpacing = 0.3;
        return (
          <Box
            key={`wall-stair-${step + 1}`}
            position={[stairStartX, floorHeight * (step + 1), stairStartZ - (step + 1) * stairSpacing]}
            args={[floorSize, floorHeight, floorSize]}
          >
            <meshStandardMaterial color={'#C5A3FF'} />
        </Box>
      );
      })}

      {/* Middle stairs to second wall (5 steps) */}
      {Array.from({ length: 5 }, (_, step) => {
    const middleStairsStartX = 0;
        const middleStairsStartZ = -1 * spacing - spacing * 3 - 1.3 * spacing;
    const middleStairSpacing = 0.3;
        return (
      <Box
            key={`middle-stair-${step + 1}`}
            position={[middleStairsStartX, floorHeight * (step + 1), middleStairsStartZ - (step + 1) * middleStairSpacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
            <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
    );
      })}
      
      {/* Three sets of stairs going west (9 total steps) */}
      {Array.from({ length: 9 }, (_, step) => {
        const setNumber = Math.floor(step / 3);
        const stepInSet = step % 3;
        const totalStepsBeforeSet = setNumber * 3;
        
        return (
          <Box
            key={`stair-set${setNumber + 1}-${stepInSet + 1}`}
            position={[
              -1 * spacing - spacing * 0.4 - spacing * 0.3 * (totalStepsBeforeSet + stepInSet + 1),
              floorHeight * (totalStepsBeforeSet + stepInSet + 1),
              0
            ]}
        args={[floorSize, floorHeight, floorSize]}
      >
            <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
    );
      })}
      
      {/* 5 Staircase slabs */}
      {/* Interactive Learning Outcomes slabs */}
      <InteractiveSlab
        key="staircase-slab-1"
        position={[-10.625, wallHeight * 1 + 0.5, 1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo1"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo1'}
      />
      <InteractiveSlab
        key="staircase-slab-2"
        position={[-13.625, wallHeight * 1 + 1.01, 1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo2"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo2'}
      />
      <InteractiveSlab
        key="staircase-slab-3"
        position={[-13.625, wallHeight * 1 + 1.52, -1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo3"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo3'}
      />
      <InteractiveSlab
        key="staircase-slab-4"
        position={[-10.625, wallHeight * 1 + 2.02, -1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo4"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo4'}
      />
      <InteractiveSlab
        key="staircase-slab-5"
        position={[-7.625, wallHeight * 1 + 2.52, -1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo5"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo5'}
      />
    </>
  );
});

export default StairSystems;

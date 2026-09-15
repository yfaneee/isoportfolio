import React from 'react';
import { Box } from '@react-three/drei';
import InteractiveSlab from '../InteractiveSlab';

// ============================================================================
// WALL BLOCKS 
// ============================================================================
interface WallBlocksProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
}

const WallBlocks = React.memo<WallBlocksProps>(({ onSlabHover, onSlabClick, introComplete, activeSlabId }) => {
  const floorColor = '#641E68';
  const floorSize = 1.5;
  const wallHeight = 3.2; 
  const spacing = 1.5;
  const grid5x5BaseZ = -1 * spacing - spacing * 3;
    
  return (
    <>
      {/* Tall wall blocks */}
      {Array.from({ length: 5 }, (_, col) => {
      const x = (col - 2) * spacing;
      const z = grid5x5BaseZ - 4 * spacing; 
        return (
        <Box
          key={`wall-outer-${col}`}
          position={[x, wallHeight / 1.83, z]}
          args={[floorSize, wallHeight, floorSize]}
        >
          <meshStandardMaterial color={floorColor} />
        </Box>
      );
      })}
      
      {/* Second row of shorter wall blocks */}
      {Array.from({ length: 5 }, (_, col) => {
        const x = (col - 2) * spacing;
        const secondWallHeight = wallHeight / 2;
        const secondWallZ = grid5x5BaseZ - 3 * spacing;
        return (
          <Box
            key={`wall-second-${col}`}
            position={[x, secondWallHeight / 1.7, secondWallZ + 0.15]}
            args={[floorSize, secondWallHeight, floorSize * 1.2]}
          >
            <meshStandardMaterial color={floorColor} />
        </Box>
      );
      })}
      
      {/* High block slab - Interactive Project Studio */}
      <InteractiveSlab
        key="high-block-slab"
        position={[3, wallHeight / 1.83 + wallHeight/2 + 0.07, grid5x5BaseZ - 4 * spacing]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="project-studio"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'project-studio'}
      />
      
      {/* Smaller block slab - Interactive Project */}
      <InteractiveSlab
        key="smaller-block-slab"
        position={[-1.5, (wallHeight / 2) / 1.7 + (wallHeight / 2)/2 + 0.07, (grid5x5BaseZ - 3 * spacing) + 0.15]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="smaller-block"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'smaller-block'}
      />
    </>
  );
});

export default WallBlocks;

import React from 'react';
import { Box } from '@react-three/drei';
import InteractiveSlab from '../InteractiveSlab';
import SocialButton from './SocialButton';
import { SOCIAL_SLABS, SOCIAL_WALL_EXTENSION_DEPTH, SOCIAL_WALL_TOP_Y } from '../../data/InteractionZones';

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
      
      {/* Extension on the back side of the tall wall - room for the social links */}
      <Box
        key="wall-outer-extension"
        position={[0, (SOCIAL_WALL_TOP_Y - 0.15) / 2, grid5x5BaseZ - 4 * spacing - floorSize / 2 - SOCIAL_WALL_EXTENSION_DEPTH / 2]}
        args={[5 * floorSize, SOCIAL_WALL_TOP_Y + 0.15, SOCIAL_WALL_EXTENSION_DEPTH]}
      >
        <meshStandardMaterial color={floorColor} />
      </Box>

      {/* Social link buttons - left corner, center, right corner */}
      {SOCIAL_SLABS.map(social => (
        <SocialButton
          key={social.id}
          kind={social.kind}
          slabId={social.id}
          position={[social.x, SOCIAL_WALL_TOP_Y, social.z]}
          onSlabHover={onSlabHover}
          onSlabClick={onSlabClick}
          introComplete={introComplete}
          isActive={activeSlabId === social.id}
        />
      ))}

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

import React from 'react';
import { Box } from '@react-three/drei';

// ============================================================================
// LEARNING OUTCOMES PLATFORM 
// ============================================================================
interface LearningOutcomesPlatformProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
}

const LearningOutcomesPlatform = React.memo<LearningOutcomesPlatformProps>(({ onSlabHover, onSlabClick, introComplete }) => {
  const floorColor = '#641E68';
  const floorSize = 1.5;
  const floorHeight = 0.3;
  const spacing = 1.5;
  const platformLevel = floorHeight * 9 + floorHeight * 1;
  const platformCenterX = -1 * spacing - spacing * 0.4 - spacing * 0.28 * 9 - spacing * 3.18;
  const platformCenterZ = 0;
    
  // NEW 5x3 RECTANGULAR RAMP PLATFORM 
  const rampWidth = 5; 
  const rampDepth = 3;
  const maxRampHeight = 3;
  
  const rampFloors = [];
    
  // Create the rectangular ramp perimeter
  for (let x = 0; x < rampWidth; x++) {
    for (let z = 0; z < rampDepth; z++) {
      const isInHole = (x >= 1 && x <= 3) && (z >= 1 && z <= 1);
      if (isInHole) continue;
      
      const isLastRampPiece = (x === 0) && (z === 1);
      if (isLastRampPiece) continue;

       // Height increases as we go around the perimeter
       let rampHeight = 0;
       if (x === 0 || x === rampWidth - 1 || z === 0 || z === rampDepth - 1) {
         const perimeter = 2 * (rampWidth + rampDepth - 2);
         let perimeterIndex = 0;
         
         if (z === 0) {
           perimeterIndex = x;
         } else if (x === rampWidth - 1) {
           perimeterIndex = rampWidth + z - 1;
         } else if (z === rampDepth - 1) {
           perimeterIndex = rampWidth + rampDepth + (rampWidth - 1 - x) - 2;
         } else if (x === 0) {
           perimeterIndex = 2 * rampWidth + rampDepth + (rampDepth - 1 - z) - 3; 
         }
         
         rampHeight = (perimeterIndex / perimeter) * maxRampHeight;
       }
      
      const segmentKey = `ramp-segment-${x}-${z}`;
       const segmentX = platformCenterX - (x - rampWidth/2 + 0.5) * spacing;
       const segmentZ = platformCenterZ - (z - rampDepth/2 + 0.5) * spacing;
      const segmentY = platformLevel + rampHeight;
      
    rampFloors.push(
    <Box
          key={segmentKey}
          position={[segmentX, segmentY, segmentZ]}
          args={[floorSize, floorHeight, floorSize]}
    >
        <meshStandardMaterial color={floorColor} />
    </Box>
  );
    }
  }

  return (
    <>
      {/* Connecting blocks between stairs and tall wall */}
      <Box
        key="connecting-block-1"
        position={[-2 * spacing, 2.4 / 1.7, -1 * spacing - spacing * 3 - 3.4 * spacing]}
        args={[floorSize, 2.4, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
      
      <Box
        key="connecting-block-2"
        position={[-2 * spacing, 1.55 / 1.8, -1 * spacing - spacing * 3 - 2.4 * spacing]}
        args={[floorSize, 1.55, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
      
      {/* Connecting floor to platform */}
      <Box
        key="connecting-floor-to-platform"
        position={[-1 * spacing - spacing * 0.4 - spacing * 0.28 * 9 - spacing * 1.18, platformLevel, platformCenterZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={floorColor} />
      </Box>
      
      {/* Ramp platform floors */}
      {rampFloors}
    </>
  );
});

export default LearningOutcomesPlatform;

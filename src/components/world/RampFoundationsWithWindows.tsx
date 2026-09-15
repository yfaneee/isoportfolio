import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import AnimatedWindows from './AnimatedWindows';

// ============================================================================
// RAMP FOUNDATIONS WITH WINDOWS (only on visible north/west sides)
// ============================================================================
const RampFoundationsWithWindows: React.FC<{
  floorColor: string;
  spacing: number;
  floorHeight: number;
}> = ({ floorColor, spacing, floorHeight }) => {
  
  const floorSize = 1.5;
  const platformLevel = floorHeight * 9 + floorHeight * 1;
  const platformCenterX = -1 * spacing - spacing * 0.4 - spacing * 0.28 * 9 - spacing * 3.18;
  const platformCenterZ = 0;
  const rampWidth = 5;
  const rampDepth = 3;
  const maxRampHeight = 3;
  const rampFoundationHeight = 200;
  
  // Window settings
  const windowWidth = 1.1;
  const windowHeight = 1.7;
  const windowGapY = 2;
  const windowsPerColumn = 16;
  
  // Generate foundation data and window positions
  const { foundations, windowPositions } = useMemo(() => {
    const foundations: { key: string; position: [number, number, number]; hasEastWindows: boolean; hasSouthWindows: boolean; hasBigFaceWindows: boolean }[] = [];
    const windows: { pos: [number, number, number]; rotation: [number, number, number] }[] = [];
    
    for (let x = 0; x < rampWidth; x++) {
      for (let z = 0; z < rampDepth; z++) {
        const isInHole = (x >= 1 && x <= 3) && (z >= 1 && z <= 1);
        if (isInHole) continue;
        
        const isLastRampPiece = (x === 0) && (z === 1);
        if (isLastRampPiece) continue;

        if (x === 0 || x === rampWidth - 1 || z === 0 || z === rampDepth - 1) {
          let rampHeight = 0;
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
          
          const foundationX = platformCenterX - (x - rampWidth/2 + 0.5) * spacing;
          const foundationZ = platformCenterZ - (z - rampDepth/2 + 0.5) * spacing;
          const currentFloorY = platformLevel + rampHeight;
          const foundationY = currentFloorY - rampFoundationHeight/2 - 0.15;
          
          // Check which sides should have windows 
          const hasEastWindows = x === 0; 
          const hasSouthWindows = z === rampDepth - 1; 
          const hasBigFaceWindows = z === 0; 
          
          foundations.push({
            key: `ramp-foundation-${x}-${z}`,
            position: [foundationX, foundationY, foundationZ],
            hasEastWindows,
            hasSouthWindows,
            hasBigFaceWindows
          });
          
          // Generate windows for visible sides
          const startY = rampFoundationHeight / 2 - 3;
          
          if (hasEastWindows) {
            // Windows on east face (positive X)
            for (let row = 0; row < windowsPerColumn; row++) {
              const winY = foundationY + startY - row * (windowHeight + windowGapY);
              windows.push({
                pos: [foundationX + floorSize/2 + 0.02, winY, foundationZ],
                rotation: [0, Math.PI / 2, 0]
              });
            }
          }
          
          if (hasSouthWindows) {
            // Windows on south face (positive Z) - outer face of ramp
            for (let row = 0; row < windowsPerColumn; row++) {
              const winY = foundationY + startY - row * (windowHeight + windowGapY);
              windows.push({
                pos: [foundationX, winY, foundationZ + floorSize/2 + 0.02],
                rotation: [0, 0, 0]
              });
            }
          }
          
          if (hasBigFaceWindows) {
            // Windows on south face (+Z) of ALL north row foundations 
            for (let row = 0; row < windowsPerColumn; row++) {
              const winY = foundationY + startY - row * (windowHeight + windowGapY);
              windows.push({
                pos: [foundationX, winY, foundationZ + floorSize/2 + 0.02],
                rotation: [0, 0, 0]
              });
            }
          }
        }
      }
    }
    
    return { foundations, windowPositions: windows };
  }, [platformCenterX, platformCenterZ, platformLevel, rampFoundationHeight, floorSize, windowHeight, windowGapY, windowsPerColumn, spacing, rampWidth, rampDepth, maxRampHeight]);
  
  return (
    <>
      {/* Foundation boxes */}
      {foundations.map(f => (
        <Box
          key={f.key}
          position={f.position}
          args={[floorSize, rampFoundationHeight, floorSize]}
        >
          <meshStandardMaterial color={floorColor} />
        </Box>
      ))}
      
      {/* Windows on visible sides - one instanced draw call */}
      <AnimatedWindows windows={windowPositions} width={windowWidth} height={windowHeight} />
    </>
  );
};

export default RampFoundationsWithWindows;

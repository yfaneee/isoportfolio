import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import AnimatedWindows from './AnimatedWindows';

// ============================================================================
// SKYSCRAPER FOUNDATION WITH ANIMATED WINDOWS
// ============================================================================
const SkyscraperFoundation: React.FC<{
  position: [number, number, number];
  size: [number, number, number];
  baseColor: string;
}> = ({ position, size, baseColor }) => {
  
  // Window configuration 
  const windowsPerRow = 5;
  const windowsPerColumn = 16;
  
  const windowWidth = (size[0] - 1) / windowsPerRow - 0.3;
  const windowHeight = 2;
  const windowGapX = 0.4;
  const windowGapY = 2;
  const windowInset = 0.02;
  
  // Generate window positions for all 4 sides
  const windowPositions = useMemo(() => {
    const windows: { pos: [number, number, number]; rotation: [number, number, number] }[] = [];
    
    const startY = size[1] / 2 - 2.5;
    const totalWidthX = windowsPerRow * windowWidth + (windowsPerRow - 1) * windowGapX;
    const startX = -totalWidthX / 2 + windowWidth / 2;
    
    // Front and back faces
    for (let row = 0; row < windowsPerColumn; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const x = startX + col * (windowWidth + windowGapX);
        const y = startY - row * (windowHeight + windowGapY);
        
        // Front face
        windows.push({ pos: [x, y, size[2] / 2 + windowInset], rotation: [0, 0, 0] });
        
      }
    }
    
    // Left and right faces
    const totalWidthZ = windowsPerRow * windowWidth + (windowsPerRow - 1) * windowGapX;
    const startZ = -totalWidthZ / 2 + windowWidth / 2;
    
    for (let row = 0; row < windowsPerColumn; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const z = startZ + col * (windowWidth + windowGapX);
        const y = startY - row * (windowHeight + windowGapY);
        
        // Right face
        windows.push({ pos: [size[0] / 2 + windowInset, y, z], rotation: [0, Math.PI / 2, 0] });
        
      }
    }
    
    return windows;
  }, [size, windowsPerRow, windowsPerColumn, windowWidth, windowHeight, windowGapX, windowGapY, windowInset]);
  
  return (
    <group position={position}>
      {/* Main building structure */}
      <Box args={size}>
        <meshStandardMaterial color={baseColor} />
      </Box>
      
      {/* Windows - one instanced draw call */}
      <AnimatedWindows windows={windowPositions} width={windowWidth} height={windowHeight} />
    </group>
  );
};

export default SkyscraperFoundation;

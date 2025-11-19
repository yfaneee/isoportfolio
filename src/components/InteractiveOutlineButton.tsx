import React, { useState } from 'react';
import { Box } from '@react-three/drei';

interface InteractiveOutlineButtonProps {
  position: [number, number, number];
  index: number;
  z: number;
  slabId: string;
  characterPosition: [number, number, number];
  platform18x3Y: number;
  platform18x3StartZ: number;
  spacing: number;
  floorHeight: number;
  floorSize: number;
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
}

const InteractiveOutlineButton: React.FC<InteractiveOutlineButtonProps> = ({
  position,
  index,
  z,
  slabId,
  characterPosition,
  platform18x3Y,
  platform18x3StartZ,
  spacing,
  floorHeight,
  floorSize,
  onSlabHover,
  onSlabClick,
  introComplete
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Check if character is on this button
  const isCharacterOnButton = 
    characterPosition[0] >= -1 - 0.45 && characterPosition[0] <= -1 + 0.45 && 
    characterPosition[2] >= z - 0.45 && characterPosition[2] <= z + 0.45;
  
  const extrudeHeight = (isCharacterOnButton || (isHovered && introComplete)) ? 0.10 : 0.04;
  const extrudeY = platform18x3Y + floorHeight/2 + extrudeHeight;
  
  const buttonSize = floorSize * 0.75; 
  const outlineThickness = 0.06;

  const handlePointerOver = (e: any) => {
    if (!introComplete) return; 
    
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    
    if (onSlabHover) {
      const screenX = (e.clientX || window.innerWidth / 2);
      const screenY = (e.clientY || window.innerHeight / 2);
      onSlabHover(slabId, { x: screenX, y: screenY });
    }
  };

  const handlePointerOut = (e: any) => {
    if (!introComplete) return; 
    
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'default';
    
    if (onSlabHover) {
      onSlabHover(null);
    }
  };

  const handleClick = (e: any) => {
    if (!introComplete) return; 
    
    e.stopPropagation();
    if (onSlabClick) {
      onSlabClick(slabId);
    }
  };

  return (
    <group>
      {/* Top edge */}
      <Box
        position={[-1, extrudeY, platform18x3StartZ + index * spacing - 1.5 + buttonSize / 2 - outlineThickness/2]}
        args={[buttonSize, extrudeHeight, outlineThickness]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerOver}
      >
        <meshStandardMaterial 
          color={'#F5F5DC'} 
          emissive={isHovered ? '#FFE4B5' : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </Box>
      {/* Bottom edge */}
      <Box
        position={[-1, extrudeY, platform18x3StartZ + index * spacing - 1.5 - buttonSize / 2 + outlineThickness/2]}
        args={[buttonSize, extrudeHeight, outlineThickness]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerOver}
      >
        <meshStandardMaterial 
          color={'#F5F5DC'} 
          emissive={isHovered ? '#FFE4B5' : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </Box>
      {/* Left edge */}
      <Box
        position={[-1 - buttonSize / 2 + outlineThickness/2, extrudeY, platform18x3StartZ + index * spacing - 1.5]}
        args={[outlineThickness, extrudeHeight, buttonSize - outlineThickness * 2]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerOver}
      >
        <meshStandardMaterial 
          color={'#F5F5DC'} 
          emissive={isHovered ? '#FFE4B5' : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </Box>
      {/* Right edge */}
      <Box
        position={[-1 + buttonSize / 2 - outlineThickness/2, extrudeY, platform18x3StartZ + index * spacing - 1.5]}
        args={[outlineThickness, extrudeHeight, buttonSize - outlineThickness * 2]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerOver}
      >
        <meshStandardMaterial 
          color={'#F5F5DC'} 
          emissive={isHovered ? '#FFE4B5' : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </Box>
      
      {/* Invisible hitbox inside the outline for easier interaction */}
      <Box
        position={[-1, extrudeY, platform18x3StartZ + index * spacing - 1.5]}
        args={[buttonSize - outlineThickness * 2, extrudeHeight, buttonSize - outlineThickness * 2]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerOver}
      >
        <meshStandardMaterial 
          transparent={true}
          opacity={0}
          depthWrite={false}
        />
      </Box>
    </group>
  );
};

export default InteractiveOutlineButton;


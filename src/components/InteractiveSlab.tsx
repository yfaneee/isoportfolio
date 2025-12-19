import React, { useState, useEffect } from 'react';
import { Box } from '@react-three/drei';

interface InteractiveSlabProps {
  position: [number, number, number];
  args?: [number, number, number];
  color: string;
  hoverColor?: string;
  slabId: string;
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  isActive?: boolean;
}

const InteractiveSlab: React.FC<InteractiveSlabProps> = ({
  position,
  args = [0.9, 0.1, 0.9],
  color,
  hoverColor,
  slabId,
  onSlabHover,
  onSlabClick,
  introComplete,
  isActive = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const activeColor = '#E8A200';

  // Clear hover state when movement keys are pressed 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || 
          key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
        if (isHovered) {
          setIsHovered(false);
          document.body.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered]);

  const handlePointerOver = (e: any) => {
    if (!introComplete) return; 
    
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    
    // Get screen position for the interaction overlay
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

  const finalColor = (isActive || isHovered) ? activeColor : (hoverColor || color);
  const isTransparent = color === 'transparent';

  return (
    <Box
      position={position}
      args={args}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerMove={handlePointerOver} 
    >
      <meshStandardMaterial 
        color={isTransparent ? '#000000' : finalColor} 
        emissive={isHovered ? (isTransparent ? '#000000' : finalColor) : '#000000'}
        emissiveIntensity={isHovered ? 0.3 : 0}
        transparent={isTransparent}
        opacity={isTransparent ? 0 : 1}
        visible={!isTransparent}
      />
    </Box>
  );
};

export default InteractiveSlab;


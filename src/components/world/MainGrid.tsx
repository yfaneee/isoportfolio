import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import InteractiveSlab from '../InteractiveSlab';
import InstancedBoxes from './InstancedBoxes';
import type { InstanceData } from './InstancedBoxes';

// ============================================================================
// MAIN GRID - 3x3 GRID INSTANCED 
// ============================================================================
interface MainGridProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
}

const MainGrid = React.memo<MainGridProps>(({ onSlabHover, onSlabClick, introComplete, activeSlabId }) => {
  const floorColor = '#641E68';
  const floorSize = 1.5; 
  const floorHeight = 0.3; 
  const spacing = 1.5;

  // Generate 3x3 grid instances
  const gridInstances = useMemo(() => {
    const instances: InstanceData[] = [];
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = (col - 1) * spacing; 
      const z = (row - 1) * spacing;
      instances.push({ position: [x, 0, z] });
    }
    return instances;
  }, [spacing]);
    
  return (
    <>
      {/* 3x3 grid - INSTANCED */}
      <InstancedBoxes 
        instances={gridInstances}
        args={[floorSize, floorHeight, floorSize]}
        color={floorColor}
      />

      {/* Interactive bone white slab on middle floor - Main Menu */}
      <InteractiveSlab
        key="main-menu-slab"
        position={[0, floorHeight - 0.092, 0]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="main-slab"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'main-slab'}
      />

      {/* Extension floors  */}
      <Box
        key="extension-1"
        position={[0, 0, -1 * spacing - spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>

      <Box
        key="extension-2"
        position={[0, 0, -1 * spacing - spacing * 2]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
    </>
  );
});

export default MainGrid;

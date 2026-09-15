import React, { useMemo } from 'react';
import InstancedBoxes from './InstancedBoxes';
import type { InstanceData } from './InstancedBoxes';

// ============================================================================
// EXTENDED GRID - 5x5 GRID INSTANCED
// ============================================================================
interface ExtendedGridProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
}

const ExtendedGrid = React.memo<ExtendedGridProps>(({ onSlabHover, onSlabClick, introComplete }) => {
  const floorColor = '#641E68';
  const floorSize = 1.5;
  const floorHeight = 0.3;
  const spacing = 1.5;
  
  // Generate 5x5 grid instances
  const gridInstances = useMemo(() => {
    const instances: InstanceData[] = [];
    for (let i = 0; i < 25; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = (col - 2) * spacing; 
      const z = -1 * spacing - spacing * 3 - (row * spacing);
      instances.push({ position: [x, 0, z] });
    }
    return instances;
  }, [spacing]);
  
  return (
    <InstancedBoxes 
      instances={gridInstances}
      args={[floorSize, floorHeight, floorSize]}
      color={floorColor}
    />
  );
});

export default ExtendedGrid;

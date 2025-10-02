import React from 'react';
import { Line } from '@react-three/drei';
import { platforms } from '../utils/collisionSystem';

// Visual debug helper to see platform boundaries
const PlatformDebugger: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  if (!enabled) return null;

  return (
    <group>
      {platforms.map((platform, index) => {
        const { minX, maxX, minZ, maxZ, y } = platform;
        const height = y + 0.05; // Slightly above platform
        
        // Draw rectangle outline of platform boundary
        const points = [
          [minX, height, minZ],
          [maxX, height, minZ],
          [maxX, height, maxZ],
          [minX, height, maxZ],
          [minX, height, minZ],
        ] as [number, number, number][];

        return (
          <Line
            key={`platform-debug-${index}`}
            points={points}
            color={platform.type === 'stair' ? '#00ff00' : '#ff0000'}
            lineWidth={2}
          />
        );
      })}
    </group>
  );
};

export default PlatformDebugger;


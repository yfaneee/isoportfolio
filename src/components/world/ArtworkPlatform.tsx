import React from 'react';
import { Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import InteractiveSlab from '../InteractiveSlab';

// ============================================================================
// ARTWORK PLATFORM 
// ============================================================================
interface ArtworkPlatformProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
}

const ArtworkPlatform = React.memo<ArtworkPlatformProps>(({ onSlabHover, onSlabClick, introComplete, activeSlabId }) => {
  const floorSize = 1.5;
  const floorHeight = 0.3;
  const spacing = 1.5;
  const pillarHeight = floorHeight * 7;
  const lowerFloorY = -pillarHeight;
  const structureX = 1 * spacing + spacing * 2;
  const structureZ = 0;
  const octBaseX = structureX + spacing * 2; 
  const octBaseZ = structureZ;
  
  return (
    <>
      {/* Upper floors */}
      <Box
        key="floor-from-6-1"
        position={[1 * spacing + spacing, 0, 0]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>

      <Box
        key="floor-from-6-2"
        position={[1 * spacing + spacing * 2, 0, 0]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>

      {/* White pressure plate on upper floor */}
      <Plane
        key="white-plane-6"
        position={[1 * spacing + spacing * 2, floorHeight / 2 + 0.01, 0]}
        args={[floorSize * 0.75, floorSize * 0.75]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="#F5F5DC"
          transparent={true}
          opacity={0.9}
        />
      </Plane>

      {/* Corner pillars */}
      {[
      [structureX - floorSize * 0.4, lowerFloorY / 2, structureZ - floorSize * 0.4], 
      [structureX + floorSize * 0.4, lowerFloorY / 2, structureZ - floorSize * 0.4], 
      [structureX - floorSize * 0.4, lowerFloorY / 2, structureZ + floorSize * 0.4]  
      ].map((pos, index) => (
        <Box
          key={`pillar-${index}`}
          position={[pos[0], pos[1], pos[2]]}
          args={[0.1, pillarHeight, 0.1]}
        >
          <meshStandardMaterial color={'#C5A3FF'} />
        </Box>
      ))}

      {/* Lower floor */}
      <Box
        key="lower-floor"
        position={[structureX, lowerFloorY, structureZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>

      {/* White pressure plate on lower floor */}
      <Plane
        key="white-plane-lower"
        position={[structureX, lowerFloorY + floorHeight / 2 + 0.01, structureZ]}
        args={[floorSize * 0.75, floorSize * 0.75]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="#F5F5DC"
          transparent={true}
          opacity={0.9}
        />
      </Plane>

      {/* 2 more floors extending from the lower floor */}
      <Box
        key="lower-extension-1"
        position={[structureX + spacing, lowerFloorY, structureZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>

      <Box
        key="lower-extension-2"
        position={[structureX + spacing * 2, lowerFloorY, structureZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
      
      {/* Octagonal platform floors extending from octBaseX = 7.5 */}
      <Box
        key="oct-ext-1"
        position={[octBaseX + spacing, lowerFloorY, octBaseZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#641E68'} />
      </Box>
    
      <Box
        key="oct-ext-2"
        position={[octBaseX + spacing * 2, lowerFloorY, octBaseZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#641E68'} />
      </Box>
    
      <Box
        key="oct-ext-3"
        position={[octBaseX + spacing * 3, lowerFloorY, octBaseZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#641E68'} />
      </Box>

      {/* Two floors forming the X - extending from the middle floor (oct-ext-2) */}
      <Box
        key="oct-cross-1"
        position={[octBaseX + spacing * 2, lowerFloorY, octBaseZ + spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#641E68'} />
      </Box>
    
      <Box
        key="oct-cross-2"
        position={[octBaseX + spacing * 2, lowerFloorY, octBaseZ - spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={'#641E68'} />
      </Box>

      {/* 4 triangular pieces to fill the gaps and create octagon */}
      {[
      // Top-left gap (between oct-ext-1 and oct-cross-1)
      { x: octBaseX + spacing * 2.5, z: octBaseZ + spacing * 0.5, rotation: -Math.PI / 4 + 0.785, key: 'oct-tri-1' },
      // Bottom-left gap 
      { x: octBaseX + spacing * 2.5, z: octBaseZ - spacing * 0.5, rotation: Math.PI / 4 + 0.785, key: 'oct-tri-2' },
      // Top-right gap 
      { x: octBaseX + spacing * 1.5, z: octBaseZ + spacing * 0.5, rotation: -Math.PI / 2, key: 'oct-tri-3' },
      // Bottom-right gap 
      { x: octBaseX + spacing * 1.5, z: octBaseZ - spacing * 0.5, rotation: Math.PI / 1, key: 'oct-tri-4' },
      ].map(tri => {
      const triGeo = new THREE.BufferGeometry();
      const triVerts = new Float32Array([
        0, 0, 0, floorSize, 0, 0, 0, 0, floorSize,
        0, floorHeight, 0, floorSize, floorHeight, 0, 0, floorHeight, floorSize,
      ]);
      
      const triIndices = [0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0];
      
      triGeo.setAttribute('position', new THREE.BufferAttribute(triVerts, 3));
      triGeo.setIndex(triIndices);
      triGeo.computeVertexNormals();

        return (
        <mesh
          key={tri.key}
          position={[tri.x, lowerFloorY - floorHeight/2, tri.z]}
          rotation={[0, tri.rotation, 0]}
        >
          <primitive object={triGeo} attach="geometry" />
          <meshStandardMaterial
              color={'#641E68'}
            flatShading={true}
          />
        </mesh>
      );
      })}
      
      {/* Artwork platform slab - Interactive */}
      <InteractiveSlab
        key="artwork-platform-slab"
        position={[octBaseX + spacing * 2, lowerFloorY + floorHeight/2 + 0.07, octBaseZ]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="artwork"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'artwork'}
      />
    </>
  );
});

export default ArtworkPlatform;

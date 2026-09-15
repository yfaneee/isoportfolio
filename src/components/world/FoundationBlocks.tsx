import React from 'react';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import SkyscraperFoundation from './SkyscraperFoundation';
import RampFoundationsWithWindows from './RampFoundationsWithWindows';

// ============================================================================
// FOUNDATION BLOCKS 
// ============================================================================
const FoundationBlocks = React.memo(() => {
  const floorColor = '#641E68';
  const spacing = 1.5;
  const foundationHeight = 200;
  const floorHeight = 0.3;
  const pillarHeight = floorHeight * 7;
  const lowerFloorY = -pillarHeight;
  const structureX = 1 * spacing + spacing * 2;
  const structureZ = 0;
  const octBaseX = structureX + spacing * 2;
  const octBaseZ = structureZ;
  const platform18x3Y = -floorHeight * 9;
  const platform18x3StartZ = 1 * spacing + spacing * 1.4 + spacing * 0.3 * 9;
  
  return (
    <>
      {/* Main 3x3 foundation */}
      <Box
        key="foundation-block"
        position={[0, -foundationHeight/2 - 0.15, 0]}
        args={[3 * spacing, foundationHeight, 3 * spacing]}
      >
        <meshStandardMaterial color={floorColor} />
      </Box>
      
      {/* 5x5 foundation - Skyscraper with animated windows */}
      <SkyscraperFoundation
        position={[0, -foundationHeight/2 - 0.15, -1 * spacing - spacing * 3 - (2 * spacing)]}
        size={[5 * spacing, foundationHeight, 5 * spacing]}
        baseColor={floorColor}
      />

      {/* ELEVATOR FOUNDATION */}
      <Box
        key="elevator-foundation"
        position={[structureX, -foundationHeight/2 + lowerFloorY - floorHeight/2, structureZ]}
        args={[1.5, foundationHeight, 1.5]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

      {/* ARTWORK PLATFORM FOUNDATIONS */}
      {[
        // The 3 main octagon floors
        { x: octBaseX + spacing, z: octBaseZ },
        { x: octBaseX + spacing * 2, z: octBaseZ },
        { x: octBaseX + spacing * 3, z: octBaseZ },
        // Cross pieces
        { x: octBaseX + spacing * 2, z: octBaseZ + spacing },
        { x: octBaseX + spacing * 2, z: octBaseZ - spacing }, 
      ].map((block, index) => (
        <Box
          key={`artwork-foundation-${index}`}
          position={[block.x, -foundationHeight/2 + lowerFloorY - floorHeight/2, block.z]}
          args={[1.5, foundationHeight, 1.5]}
        >
          <meshStandardMaterial color='#641E68' />
        </Box>
      ))}

      {/* Triangular foundation pieces for the 4 gaps */}
      {[
        { x: octBaseX + spacing * 2.5, z: octBaseZ + spacing * 0.5, rotation: -Math.PI / 4 + 0.785 },
        { x: octBaseX + spacing * 2.5, z: octBaseZ - spacing * 0.5, rotation: Math.PI / 4 + 0.785 },
        { x: octBaseX + spacing * 1.5, z: octBaseZ + spacing * 0.5, rotation: -Math.PI / 2 },
        { x: octBaseX + spacing * 1.5, z: octBaseZ - spacing * 0.5, rotation: Math.PI / 1 },
      ].map((tri, index) => {
        const triFoundationGeometry = new THREE.BufferGeometry();
        const triFoundationVerts = new Float32Array([
          0, 0, 0, 1.5, 0, 0, 0, 0, 1.5,
          0, -foundationHeight, 0, 1.5, -foundationHeight, 0, 0, -foundationHeight, 1.5,
        ]);
        const triFoundationIndices = [
          0, 1, 2, 0, 2, 1,
          3, 5, 4, 3, 4, 5,
          0, 3, 4, 0, 4, 1, 0, 4, 3, 0, 1, 4,
          1, 4, 5, 1, 5, 2, 1, 5, 4, 1, 2, 5,
          2, 5, 3, 2, 3, 0, 2, 3, 5, 2, 0, 3
        ];
        triFoundationGeometry.setAttribute('position', new THREE.BufferAttribute(triFoundationVerts, 3));
        triFoundationGeometry.setIndex(triFoundationIndices);
        triFoundationGeometry.computeVertexNormals();
        
        return (
          <mesh
            key={`oct-foundation-tri-${index}`}
            position={[tri.x, lowerFloorY - floorHeight/2, tri.z]}
            rotation={[0, tri.rotation, 0]}
          >
            <primitive object={triFoundationGeometry} attach="geometry" />
            <meshStandardMaterial color="#641E68" flatShading={true} />
          </mesh>
        );
      })}

      {/* FOUNDATION for the 18x3 platform */}
      <Box
        key="platform-18x3-foundation-big"
        position={[0, platform18x3Y - foundationHeight/2 - 0.15, platform18x3StartZ + (18 * spacing) / 2 - spacing/2]}
        args={[3 * spacing, foundationHeight, 18 * spacing]}
      >
        <meshStandardMaterial color={floorColor} />
      </Box>

      {/* Foundation for the extension floor */}
      <Box
        key="platform-18x3-row2-extension-foundation"
        position={[-2.5 * spacing, platform18x3Y - foundationHeight/2 - 0.15, platform18x3StartZ + 1 * spacing]}
        args={[1.5, foundationHeight, 1.5]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>

      {/* Triangular foundation pieces for extensions */}
      {[
        { x: -2.5 * spacing + spacing * 0.5, z: platform18x3StartZ + 1 * spacing + spacing * 0.5, rotation: -Math.PI / 2 },
        { x: -2.5 * spacing + spacing * 0.5, z: platform18x3StartZ + 1 * spacing - spacing * 0.5, rotation: Math.PI / 1 },
      ].map((tri, index) => {
        const triFoundationGeometry = new THREE.BufferGeometry();
        const triFoundationSize = 1.5 * 0.75;
        const triFoundationVerts = new Float32Array([
          0, 0, 0, triFoundationSize, 0, 0, 0, 0, triFoundationSize,
          0, -foundationHeight, 0, triFoundationSize, -foundationHeight, 0, 0, -foundationHeight, triFoundationSize,
        ]);
        const triFoundationIndices = [
          0, 1, 2, 0, 2, 1,
          3, 5, 4, 3, 4, 5,
          0, 3, 4, 0, 4, 1, 0, 4, 3, 0, 1, 4,
          1, 4, 5, 1, 5, 2, 1, 5, 4, 1, 2, 5,
          2, 5, 3, 2, 3, 0, 2, 3, 5, 2, 0, 3
        ];
        triFoundationGeometry.setAttribute('position', new THREE.BufferAttribute(triFoundationVerts, 3));
        triFoundationGeometry.setIndex(triFoundationIndices);
        triFoundationGeometry.computeVertexNormals();

        return (
          <mesh
            key={`ext-tri-foundation-${index}`}
            position={[tri.x, platform18x3Y - floorHeight/2, tri.z]}
            rotation={[0, tri.rotation, 0]}
          >
            <primitive object={triFoundationGeometry} attach="geometry" />
            <meshStandardMaterial color={'#C5A3FF'} flatShading={true} />
          </mesh>
        );
      })}

      {/* Additional billboard extension foundations for rows 7, 12, 17 */}
      {[
        { row: 7, key: 'billboard-ext-7' },
        { row: 12, key: 'billboard-ext-12' },
        { row: 17, key: 'billboard-ext-17' }
      ].map(billboard => (
        <React.Fragment key={billboard.key}>
          {/* Main extension floor foundation */}
          <Box
            key={`${billboard.key}-foundation`}
            position={[-2.5 * spacing, platform18x3Y - foundationHeight/2 - 0.15, platform18x3StartZ + (billboard.row - 1) * spacing]}
            args={[1.5, foundationHeight, 1.5]}
          >
            <meshStandardMaterial color={'#C5A3FF'} />
          </Box>

          {/* Triangular foundation pieces for this row */}
          {[
            { x: -2.5 * spacing + spacing * 0.5, z: platform18x3StartZ + (billboard.row - 1) * spacing + spacing * 0.5, rotation: -Math.PI / 2 },
            { x: -2.5 * spacing + spacing * 0.5, z: platform18x3StartZ + (billboard.row - 1) * spacing - spacing * 0.5, rotation: Math.PI / 1 },
          ].map((tri, triIndex) => {
            const triFoundationGeometry = new THREE.BufferGeometry();
            const triFoundationSize = 1.5 * 0.75;
            const triFoundationVerts = new Float32Array([
              0, 0, 0, triFoundationSize, 0, 0, 0, 0, triFoundationSize,
              0, -foundationHeight, 0, triFoundationSize, -foundationHeight, 0, 0, -foundationHeight, triFoundationSize,
            ]);
            const triFoundationIndices = [
              0, 1, 2, 0, 2, 1,
              3, 5, 4, 3, 4, 5,
              0, 3, 4, 0, 4, 1, 0, 4, 3, 0, 1, 4,
              1, 4, 5, 1, 5, 2, 1, 5, 4, 1, 2, 5,
              2, 5, 3, 2, 3, 0, 2, 3, 5, 2, 0, 3
            ];
            triFoundationGeometry.setAttribute('position', new THREE.BufferAttribute(triFoundationVerts, 3));
            triFoundationGeometry.setIndex(triFoundationIndices);
            triFoundationGeometry.computeVertexNormals();

            return (
              <mesh
                key={`${billboard.key}-tri-foundation-${triIndex}`}
                position={[tri.x, platform18x3Y - floorHeight/2, tri.z]}
                rotation={[0, tri.rotation, 0]}
              >
                <primitive object={triFoundationGeometry} attach="geometry" />
                <meshStandardMaterial color={'#C5A3FF'} flatShading={true} />
              </mesh>
            );
          })}
        </React.Fragment>
      ))}

      {/* FOUNDATION for the Learning Outcomes ramp platform - with windows on visible sides */}
      <RampFoundationsWithWindows floorColor={floorColor} spacing={spacing} floorHeight={floorHeight} />
    </>
  );
});

export default FoundationBlocks;

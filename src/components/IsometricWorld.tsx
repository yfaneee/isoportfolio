import React, { useState } from 'react';
import { Box, Plane, Edges, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

const IsometricWorld: React.FC = () => {
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  // Main color for the floors
  const floorColor = '#FAA32B';
  const hoverColor = '#FFB84D'; 

  const CentralFloors = () => {
    const floors = [];
    const floorSize = 1.5; 
    const floorHeight = 0.3; 
     const spacing = 1.5;
    
    // 3x3 grid 
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = (col - 1) * spacing; 
        const z = (row - 1) * spacing; 
        const floorId = `floor-${row}-${col}`;
        
        floors.push(
          <Box
            key={floorId}
            position={[x, 0, z]}
            args={[floorSize, floorHeight, floorSize]}
            onPointerOver={() => setHoveredObject(floorId)}
            onPointerOut={() => setHoveredObject(null)}
          >
            <meshStandardMaterial 
              color={hoveredObject === floorId ? hoverColor : floorColor}
            />
            <Edges color="#D27E17" linewidth={2} />
          </Box>
        );
      }
    }

    floors.push(
      <Box
        key="extension-1"
        position={[0, 0, -1 * spacing - spacing]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('extension-1')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'extension-1' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // Second extension floor
    floors.push(
      <Box
        key="extension-2"
        position={[0, 0, -1 * spacing - spacing * 2]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('extension-2')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'extension-2' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // 5x5 extension grid
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const x = (col - 2) * spacing; 
        const z = -1 * spacing - spacing * 3 - (row * spacing); 
        const floorId = `extension-grid-${row}-${col}`;
        
        floors.push(
          <Box
            key={floorId}
            position={[x, 0, z]}
            args={[floorSize, floorHeight, floorSize]}
            onPointerOver={() => setHoveredObject(floorId)}
            onPointerOut={() => setHoveredObject(null)}
          >
            <meshStandardMaterial 
              color={hoveredObject === floorId ? hoverColor : floorColor}
            />
            <Edges color="#D27E17" linewidth={2} />
          </Box>
        );
      }
    }

    // First set of stairs (original)
    for (let step = 1; step <= 3; step++) {
      floors.push(
        <Box
          key={`stair-set1-${step}`}
          position={[-1 * spacing - spacing * 0.4 - spacing * 0.3 * step, floorHeight * step, 0]}
          args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(`stair-set1-${step}`)}
          onPointerOut={() => setHoveredObject(null)}
        >
          <meshStandardMaterial 
            color={hoveredObject === `stair-set1-${step}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
    }

    // Second set of stairs 
    for (let step = 1; step <= 3; step++) {
      floors.push(
        <Box
          key={`stair-set2-${step}`}
          position={[-1 * spacing - spacing * 0.4 - spacing * 0.3 * 3 - spacing * 0.3 * step, floorHeight * (3 + step), 0]}
          args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(`stair-set2-${step}`)}
          onPointerOut={() => setHoveredObject(null)}
        >
          <meshStandardMaterial 
            color={hoveredObject === `stair-set2-${step}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
    }

    // Third set of stairs 
    for (let step = 1; step <= 3; step++) {
      floors.push(
        <Box
          key={`stair-set3-${step}`}
          position={[-1 * spacing - spacing * 0.4 - spacing * 0.3 * 6 - spacing * 0.3 * step, floorHeight * (6 + step), 0]}
          args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(`stair-set3-${step}`)}
          onPointerOut={() => setHoveredObject(null)}
        >
          <meshStandardMaterial 
            color={hoveredObject === `stair-set3-${step}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
    }

    // Two floor extensions in front of the stairs 
    const topStairLevel = floorHeight * 9;
    const stairEndX = -1 * spacing - spacing * 0.4 - spacing * 0.28 * 9; 
    const platformLevel = topStairLevel + floorHeight * 1; 
    
    // Platform floors - numbered for reference
    // Floor 1 (closest to stairs)
    floors.push(
      <Box
        key="floor-1"
        position={[stairEndX - spacing * 0.8, platformLevel, 0]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('floor-1')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'floor-1' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // Floor 2 (center/middle floor)
    floors.push(
      <Box
        key="floor-2"
        position={[stairEndX - spacing * 0.8 - spacing, platformLevel, 0]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('floor-2')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'floor-2' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // Floor 3 (left side)
    floors.push(
      <Box
        key="floor-3"
        position={[stairEndX - spacing * 0.8 - spacing, platformLevel, -spacing]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('floor-3')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'floor-3' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // Floor 4 (right side)
    floors.push(
      <Box
        key="floor-4"
        position={[stairEndX - spacing * 0.8 - spacing, platformLevel, spacing]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('floor-4')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'floor-4' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // Add visible number labels for each floor
    floors.push(
      <Text
        key="label-1"
        position={[stairEndX - spacing * 0.8, platformLevel + floorHeight/2 + 0.1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        1
      </Text>
    );

    floors.push(
      <Text
        key="label-2"
        position={[stairEndX - spacing * 0.8 - spacing, platformLevel + floorHeight/2 + 0.1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        2
      </Text>
    );

    floors.push(
      <Text
        key="label-3"
        position={[stairEndX - spacing * 0.8 - spacing, platformLevel + floorHeight/2 + 0.1, -spacing]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        3
      </Text>
    );

    floors.push(
      <Text
        key="label-4"
        position={[stairEndX - spacing * 0.8 - spacing, platformLevel + floorHeight/2 + 0.1, spacing]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        4
      </Text>
    );

    // Add visible number labels for triangles
    floors.push(
      <Text
        key="label-triangle-4-1"
        position={[stairEndX - spacing * 0.8 - spacing * 0.5, platformLevel + floorHeight/2 + 0.1, spacing * 0.5]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        T1
      </Text>
    );

    floors.push(
      <Text
        key="label-triangle-3-1"
        position={[stairEndX - spacing * 0.8 - spacing * 0.5, platformLevel + floorHeight/2 + 0.1, -spacing * 0.5]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        T2
      </Text>
    );

    floors.push(
      <Text
        key="label-triangle-left-4"
        position={[stairEndX - spacing * 0.8 - spacing * 1.5, platformLevel + floorHeight/2 + 0.1, spacing + spacing * 0.5]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        T3
      </Text>
    );

    // Right triangle between Floor 4 and Floor 1
    const rightTriangleGeometry = new THREE.BufferGeometry();
    const triangleVertices = new Float32Array([
      // Bottom triangle
      0, 0, 0,                    // right angle corner
      floorSize, 0, 0,           // cathetus 1 
      0, 0, floorSize,           // cathetus 2 
      // Top triangle
      0, floorHeight, 0,          
      floorSize, floorHeight, 0,  // cathetus 1 (top)
      0, floorHeight, floorSize,  // cathetus 2 (top)
    ]);
    
    const triangleIndices = [
      // Bottom face
      0, 1, 2,
      // Top face  
      3, 5, 4,
      // Side faces
      0, 3, 4, 0, 4, 1,  // front face
      1, 4, 5, 1, 5, 2,  // right face
      2, 5, 3, 2, 3, 0   // left face
    ];
    
    rightTriangleGeometry.setIndex(triangleIndices);
    rightTriangleGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3));
    rightTriangleGeometry.computeVertexNormals();

    floors.push(
      <mesh
        key="triangle-4-1"
        position={[stairEndX - spacing * 0.8 - spacing * 0.5, platformLevel - floorHeight/2, spacing * 0.5]}
        geometry={rightTriangleGeometry}
        rotation={[0, -Math.PI / 4 + 0.785, 0]}
        onPointerOver={() => setHoveredObject('triangle-4-1')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'triangle-4-1' ? hoverColor : floorColor}
          flatShading={true}
        />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );

    // Second right triangle between Floor 3 and Floor 1, 90-degree angle facing Floor 2 (mirrored)
    floors.push(
      <mesh
        key="triangle-3-1"
        position={[stairEndX - spacing * 0.8 - spacing * 0.5, platformLevel - floorHeight/2, -spacing * 0.5]}
        geometry={rightTriangleGeometry}
        rotation={[0, Math.PI / 4 + 0.785, 0]}
        onPointerOver={() => setHoveredObject('triangle-3-1')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'triangle-3-1' ? hoverColor : floorColor}
          flatShading={true}
        />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );

    // Third triangle to the left of Floor 4
    floors.push(
      <mesh
        key="triangle-left-4"
        position={[stairEndX - spacing * 0.8 - spacing * 1.5, platformLevel - floorHeight/2, spacing + spacing * 0.5]}
        geometry={rightTriangleGeometry}
        rotation={[0, 0, 0]}
        onPointerOver={() => setHoveredObject('triangle-left-4')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'triangle-left-4' ? hoverColor : floorColor}
          flatShading={true}
        />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );

    // Fourth triangle opposed to T3 
    floors.push(
      <mesh
        key="triangle-opposed-T3"
        position={[stairEndX - spacing * 0.8 - spacing * 1.5, platformLevel - floorHeight/2, spacing + spacing * 0.5]}
        geometry={rightTriangleGeometry}
        rotation={[0, Math.PI, 0]}
        onPointerOver={() => setHoveredObject('triangle-opposed-T3')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'triangle-opposed-T3' ? hoverColor : floorColor}
          flatShading={true}
        />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );

    // Add label for T4
    floors.push(
      <Text
        key="label-triangle-opposed-T3"
        position={[stairEndX - spacing * 0.8 - spacing * 2.5, platformLevel + floorHeight/2 + 0.1, spacing + spacing * 0.5]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        T4
      </Text>
    );

    // Fifth triangle (T5) next to T2, similar to how T3 is next to T1
    floors.push(
      <mesh
        key="triangle-T5"
        position={[stairEndX - spacing * 0.8 - spacing * 1.5, platformLevel - floorHeight/2, -spacing - spacing * 0.5]}
        geometry={rightTriangleGeometry}
        rotation={[0, Math.PI / 2, 0]}
        onPointerOver={() => setHoveredObject('triangle-T5')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'triangle-T5' ? hoverColor : floorColor}
          flatShading={true}
        />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );

    // Add label for T5
    floors.push(
      <Text
        key="label-triangle-T5"
        position={[stairEndX - spacing * 0.8 - spacing * 1.5, platformLevel + floorHeight/2 + 0.1, -spacing - spacing * 0.5]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        T5
      </Text>
    );

    // Sixth triangle (T6) opposed to T5
    floors.push(
      <mesh
        key="triangle-T6"
        position={[stairEndX - spacing * 0.8 - spacing * 1.5, platformLevel - floorHeight/2, -spacing - spacing * 0.5]}
        geometry={rightTriangleGeometry}
        rotation={[0, -Math.PI / 2, 0]}
        onPointerOver={() => setHoveredObject('triangle-T6')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'triangle-T6' ? hoverColor : floorColor}
          flatShading={true}
        />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );

    // Add label for T6
    floors.push(
      <Text
        key="label-triangle-T6"
        position={[stairEndX - spacing * 0.8 - spacing * 2.5, platformLevel + floorHeight/2 + 0.1, -spacing - spacing * 0.5]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        T6
      </Text>
    );

    // Seventh triangle (T7) next to T3 and T1
    floors.push(
      <mesh
        key="triangle-T7"
        position={[stairEndX - spacing * 0.8 - spacing * 2.5, platformLevel - floorHeight/2, spacing * 2.5]}
        geometry={rightTriangleGeometry}
        rotation={[0, -Math.PI / 4 + 0.785, 0]}
        onPointerOver={() => setHoveredObject('triangle-T7')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'triangle-T7' ? hoverColor : floorColor}
          flatShading={true}
        />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );

    // Add label for T7
    floors.push(
      <Text
        key="label-triangle-T7"
        position={[stairEndX - spacing * 0.8 - spacing * 2.5, platformLevel + floorHeight/2 + 0.1, spacing * 2.5]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        T7
      </Text>
    );

    // Eighth triangle (T8) next to T2 and T5, mirroring the T1-T3-T7 pattern
    floors.push(
      <mesh
        key="triangle-T8"
        position={[stairEndX - spacing * 0.8 - spacing * 2.5, platformLevel - floorHeight/2, -spacing * 2.5]}
        geometry={rightTriangleGeometry}
        rotation={[0, Math.PI / 4 + 0.785, 0]}
        onPointerOver={() => setHoveredObject('triangle-T8')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'triangle-T8' ? hoverColor : floorColor}
          flatShading={true}
        />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );

    // Add label for T8
    floors.push(
      <Text
        key="label-triangle-T8"
        position={[stairEndX - spacing * 0.8 - spacing * 2.5, platformLevel + floorHeight/2 + 0.1, -spacing * 2.5]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        T8
      </Text>
    );

    // Floor for the gap on the T4-T3-T7 side
    floors.push(
      <Box
        key="fill-floor-right"
        position={[stairEndX - spacing * 0.8 - spacing * 2, platformLevel, spacing * 2]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('fill-floor-right')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'fill-floor-right' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // Floor for the gap on the T6-T5-T8 side
    floors.push(
      <Box
        key="fill-floor-left"
        position={[stairEndX - spacing * 0.8 - spacing * 2, platformLevel, -spacing * 2]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('fill-floor-left')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'fill-floor-left' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // 2 floors next to T7 and T4 
    floors.push(
      <Box
        key="extension-floor-1"
        position={[stairEndX - spacing * 0.8 - spacing * 3, platformLevel, spacing * 3]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('extension-floor-1')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'extension-floor-1' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    floors.push(
      <Box
        key="extension-floor-2"
        position={[stairEndX - spacing * 0.8 - spacing * 3, platformLevel, spacing * 2]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('extension-floor-2')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'extension-floor-2' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // 2 floors next to T6 and T8 (left side extension)
    floors.push(
      <Box
        key="extension-floor-3"
        position={[stairEndX - spacing * 0.8 - spacing * 3, platformLevel, -spacing * 3]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('extension-floor-3')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'extension-floor-3' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    floors.push(
      <Box
        key="extension-floor-4"
        position={[stairEndX - spacing * 0.8 - spacing * 3, platformLevel, -spacing * 2]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('extension-floor-4')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'extension-floor-4' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );


    floors.push(
      <Box
        key="floor-from-6-1"
        position={[1 * spacing + spacing, 0, 0]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('floor-from-6-1')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'floor-from-6-1' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    floors.push(
      <Box
        key="floor-from-6-2"
        position={[1 * spacing + spacing * 2, 0, 0]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('floor-from-6-2')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'floor-from-6-2' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // white plane 
    floors.push(
      <Plane
        key="white-plane-6"
        position={[1 * spacing + spacing * 2, floorHeight / 2 + 0.01, 0]}
        args={[floorSize * 0.75, floorSize * 0.75]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="white"
          transparent={true}
          opacity={0.9}
        />
      </Plane>
    );

    const pillarHeight = floorHeight * 7;
    const lowerFloorY = -pillarHeight;
    const structureX = 1 * spacing + spacing * 2;
    const structureZ = 0;

    // corner pillars
    const pillarPositions = [
      [structureX - floorSize * 0.4, 0, structureZ - floorSize * 0.4], 
      [structureX + floorSize * 0.4, 0, structureZ - floorSize * 0.4], 
      [structureX - floorSize * 0.4, 0, structureZ + floorSize * 0.4]  
    ];

    pillarPositions.forEach((pos, index) => {
      floors.push(
        <Box
          key={`pillar-${index}`}
          position={[pos[0], lowerFloorY / 2, pos[2]]}
          args={[0.1, pillarHeight, 0.1]}
          onPointerOver={() => setHoveredObject(`pillar-${index}`)}
          onPointerOut={() => setHoveredObject(null)}
        >
          <meshStandardMaterial 
            color={hoveredObject === `pillar-${index}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
    });

    // lower floor
    floors.push(
      <Box
        key="lower-floor"
        position={[structureX, lowerFloorY, structureZ]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('lower-floor')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'lower-floor' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // white pressure plate on the lower floor
    floors.push(
      <Plane
        key="white-plane-lower"
        position={[structureX, lowerFloorY + floorHeight / 2 + 0.01, structureZ]}
        args={[floorSize * 0.75, floorSize * 0.75]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="white"
          transparent={true}
          opacity={0.9}
        />
      </Plane>
    );

    // 2 more floors extending from the lower floor
    floors.push(
      <Box
        key="lower-extension-1"
        position={[structureX + spacing, lowerFloorY, structureZ]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('lower-extension-1')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'lower-extension-1' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    floors.push(
      <Box
        key="lower-extension-2"
        position={[structureX + spacing * 2, lowerFloorY, structureZ]}
        args={[floorSize, floorHeight, floorSize]}
        onPointerOver={() => setHoveredObject('lower-extension-2')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'lower-extension-2' ? hoverColor : floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // First set of downward stairs
    for (let step = 1; step <= 3; step++) {
      floors.push(
        <Box
          key={`down-stair-set1-${step}`}
          position={[0, -floorHeight * step, 1 * spacing + spacing * 0.4 + spacing * 0.3 * step]}
          args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(`down-stair-set1-${step}`)}
          onPointerOut={() => setHoveredObject(null)}
        >
          <meshStandardMaterial 
            color={hoveredObject === `down-stair-set1-${step}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
    }

    // Second set of downward stairs
    for (let step = 1; step <= 3; step++) {
      floors.push(
        <Box
          key={`down-stair-set2-${step}`}
          position={[0, -floorHeight * (3 + step), 1 * spacing + spacing * 0.4 + spacing * 0.3 * 3 + spacing * 0.3 * step]}
          args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(`down-stair-set2-${step}`)}
          onPointerOut={() => setHoveredObject(null)}
        >
          <meshStandardMaterial 
            color={hoveredObject === `down-stair-set2-${step}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
    }

    // Third set of downward stairs
    for (let step = 1; step <= 3; step++) {
      floors.push(
        <Box
          key={`down-stair-set3-${step}`}
          position={[0, -floorHeight * (6 + step), 1 * spacing + spacing * 0.4 + spacing * 0.3 * 6 + spacing * 0.3 * step]}
          args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(`down-stair-set3-${step}`)}
          onPointerOut={() => setHoveredObject(null)}
        >
          <meshStandardMaterial 
            color={hoveredObject === `down-stair-set3-${step}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
    }
    
    return <>{floors}</>;
  };
   
  return (
    <group>
      <CentralFloors />
    </group>
  );
};

export default IsometricWorld;

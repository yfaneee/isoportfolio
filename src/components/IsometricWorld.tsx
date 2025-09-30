import React, { useState, useCallback, useMemo } from 'react';
import { Box, Plane, Edges, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

const IsometricWorld: React.FC = () => {
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  // Main color for the floors
  const floorColor = '#FAA32B';
  const hoverColor = '#FFB84D'; 
  
  // Smooth hover handler with useCallback to prevent recreating functions
  const handlePointerOver = useCallback((id: string) => (e: any) => {
    e.stopPropagation(); 
    if (hoveredObject !== id) { 
      setHoveredObject(id);
    }
  }, [hoveredObject]);
  
  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation();
    setHoveredObject(null);
  }, []);

  const CentralFloors = () => {
    const floors = [];
    const floorSize = 1.5; 
    const floorHeight = 0.3; 
     const spacing = 1.5;
    
    // Massive foundation block underneath the 3x3 grid
    const gridWidth = 3 * spacing; 
    const foundationHeight = 200; 
    
    floors.push(
      <Box
        key="foundation-block"
        position={[0, -foundationHeight/2 - 0.15, 0]} 
        args={[gridWidth, foundationHeight, gridWidth]}
      >
        <meshStandardMaterial 
          color={floorColor}
        />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );

    // 3x3 grid (keeping exact same positions)
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

    // Massive foundation block underneath the 5x5 grid
    const grid5x5Width = 5 * spacing; 
    const grid5x5CenterX = 0; 
    const grid5x5CenterZ = -1 * spacing - spacing * 3 - (2 * spacing); 
    
    floors.push(
      <Box
        key="foundation-block-5x5"
        position={[grid5x5CenterX, -foundationHeight/2 - 0.15, grid5x5CenterZ]} 
        args={[grid5x5Width, foundationHeight, grid5x5Width]}
      >
        <meshStandardMaterial 
          color={floorColor}
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

    // Tall blocks on the outer edge of 5x5 grid (opposite from 3x3 grid)
    const wallHeight = 3; 
    const grid5x5BaseZ = -1 * spacing - spacing * 3;
    
    // Bottom/outer edge only (row 4) - 5 blocks
    for (let col = 0; col < 5; col++) {
      const x = (col - 2) * spacing;
      const z = grid5x5BaseZ - 4 * spacing; 
      floors.push(
        <Box
          key={`wall-outer-${col}`}
          position={[x, wallHeight / 1.8, z]}
          args={[floorSize, wallHeight, floorSize]}
          onPointerOver={handlePointerOver(`wall-outer-${col}`)}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial 
            color={hoveredObject === `wall-outer-${col}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
    }

    // Stairs going up to the tall wall blocks
    const numStairs = 10; 
    const stairStartX = -2 * spacing; // Start from the left side
    const stairStartZ = grid5x5BaseZ - 1.2 * spacing; // Start from within the grid
    const stairSpacing = 0.3;   
    
    for (let step = 1; step <= numStairs; step++) {
      floors.push(
        <Box
          key={`wall-stair-${step}`}
          position={[stairStartX, floorHeight * step, stairStartZ - step * stairSpacing]}
          args={[floorSize, floorHeight, floorSize]}
          onPointerOver={handlePointerOver(`wall-stair-${step}`)}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial 
            color={hoveredObject === `wall-stair-${step}` ? hoverColor : floorColor}
          />
          <Edges color="#D27E17" linewidth={2} />
        </Box>
      );
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
    
    // LEARNING OUTCOMES PLATFORM - Parametric Generation System
    const platformCenterX = stairEndX - spacing * 0.8;
    const platformCenterZ = 0;
    
    // Core platform structure - defined as data
    const learningOutcomesPlatform = {
      coreFloors: [
        { x: 0, z: 0, key: 'floor-1' },           // Closest to stairs
        { x: -spacing, z: 0, key: 'floor-2' },    // Center
        { x: -spacing, z: -spacing, key: 'floor-3' }, // Left
        { x: -spacing, z: spacing, key: 'floor-4' },  // Right
      ],
      
      // Triangular connectors (with rotation in radians)
      triangles: [
        { x: -spacing * 0.5, z: spacing * 0.5, rotation: -Math.PI / 4 + 0.785, key: 'triangle-4-1' },
        { x: -spacing * 0.5, z: -spacing * 0.5, rotation: Math.PI / 4 + 0.785, key: 'triangle-3-1' },
        { x: -spacing * 1.5, z: spacing + spacing * 0.5, rotation: 0, key: 'triangle-left-4' },
        { x: -spacing * 1.5, z: spacing + spacing * 0.5, rotation: Math.PI, key: 'triangle-opposed-T3' },
        { x: -spacing * 1.5, z: -spacing - spacing * 0.5, rotation: Math.PI / 2, key: 'triangle-T5' },
        { x: -spacing * 1.5, z: -spacing - spacing * 0.5, rotation: -Math.PI / 2, key: 'triangle-T6' },
        { x: -spacing * 2.5, z: spacing * 2.5, rotation: -Math.PI / 4 + 0.785, key: 'triangle-T7' },
        { x: -spacing * 2.5, z: -spacing * 2.5, rotation: Math.PI / 4 + 0.785, key: 'triangle-T8' },
      ],
      
      // Fill floors (completing the octagonal pattern)
      fillFloors: [
        { x: -spacing * 2, z: spacing * 2, key: 'fill-floor-right' },
        { x: -spacing * 2, z: -spacing * 2, key: 'fill-floor-left' },
      ],
      
      // Extension floors (outer ring)
      extensionFloors: [
        { x: -spacing * 3, z: spacing * 3, key: 'extension-floor-1' },
        { x: -spacing * 3, z: spacing * 2, key: 'extension-floor-2' },
        { x: -spacing * 3, z: -spacing * 3, key: 'extension-floor-3' },
        { x: -spacing * 3, z: -spacing * 2, key: 'extension-floor-4' },
      ],
      
      // Continuation pattern (extended wing)
      continuationPattern: [
        { type: 'triangle', x: -spacing * 3.5, z: spacing * 2.5, rotation: -Math.PI / 2, key: 'triangle-T9' },
        { type: 'floor', x: -spacing * 4, z: spacing * 2, key: 'extension-floor-5' },
        { type: 'triangle', x: -spacing * 4.5, z: spacing * 1.5, rotation: -Math.PI / 2, key: 'triangle-T10' },
        { type: 'floor', x: -spacing * 5, z: spacing * 1, key: 'extension-floor-6' },
        { type: 'triangle', x: -spacing * 5.5, z: spacing * 0.5, rotation: -Math.PI / 2, key: 'triangle-T11' },
        { type: 'triangle', x: -spacing * 4.5, z: spacing + spacing * 0.5, rotation: Math.PI / 2, key: 'triangle-T12' },
        { type: 'floor', x: -spacing * 5, z: 0, key: 'extension-floor-7' },
        { type: 'floor', x: -spacing * 6, z: 0, key: 'extension-floor-8' },
        { type: 'floor', x: -spacing * 5, z: -spacing, key: 'extension-floor-9' },
        { type: 'triangle', x: -spacing * 5.5, z: -spacing * 0.5, rotation: Math.PI, key: 'triangle-T13' },
        { type: 'triangle', x: -spacing * 4.5, z: -spacing * 1.5, rotation: Math.PI, key: 'triangle-T14' },
        { type: 'triangle', x: -spacing * 3.5, z: -spacing * 2.5, rotation: Math.PI, key: 'triangle-T15' },
        { type: 'floor', x: -spacing * 4, z: -spacing * 2, key: 'extension-floor-10' },
        { type: 'triangle', x: -spacing * 4.5, z: -spacing * 1.5, rotation: -Math.PI / 4 + 0.785, key: 'triangle-T16' },
      ],
    };
    
    // Triangle geometry (shared)
    const rightTriangleGeometry = new THREE.BufferGeometry();
    const triangleVertices = new Float32Array([
      0, 0, 0, floorSize, 0, 0, 0, 0, floorSize,
      0, floorHeight, 0, floorSize, floorHeight, 0, 0, floorHeight, floorSize,
    ]);
    const triangleIndices = [0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0];
    rightTriangleGeometry.setIndex(triangleIndices);
    rightTriangleGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3));
    rightTriangleGeometry.computeVertexNormals();

    // Generate core floors
    learningOutcomesPlatform.coreFloors.forEach(floor => {
    floors.push(
        <Box
          key={floor.key}
          position={[platformCenterX + floor.x, platformLevel, platformCenterZ + floor.z]}
          args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(floor.key)}
        onPointerOut={() => setHoveredObject(null)}
      >
          <meshStandardMaterial color={hoveredObject === floor.key ? hoverColor : floorColor} />
        <Edges color="#D27E17" linewidth={2} />
        </Box>
    );
    });

    // Generate triangles
    learningOutcomesPlatform.triangles.forEach(tri => {
    floors.push(
      <mesh
          key={tri.key}
          position={[platformCenterX + tri.x, platformLevel - floorHeight/2, platformCenterZ + tri.z]}
        geometry={rightTriangleGeometry}
          rotation={[0, tri.rotation, 0]}
          onPointerOver={() => setHoveredObject(tri.key)}
        onPointerOut={() => setHoveredObject(null)}
      >
          <meshStandardMaterial color={hoveredObject === tri.key ? hoverColor : floorColor} flatShading={true} />
        <Edges color="#D27E17" linewidth={2} />
      </mesh>
    );
    });
    
    // Generate fill floors
    learningOutcomesPlatform.fillFloors.forEach(floor => {
    floors.push(
      <Box
          key={floor.key}
          position={[platformCenterX + floor.x, platformLevel, platformCenterZ + floor.z]}
        args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(floor.key)}
        onPointerOut={() => setHoveredObject(null)}
      >
          <meshStandardMaterial color={hoveredObject === floor.key ? hoverColor : floorColor} />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );
    });

    // Generate extension floors
    learningOutcomesPlatform.extensionFloors.forEach(floor => {
    floors.push(
      <Box
          key={floor.key}
          position={[platformCenterX + floor.x, platformLevel, platformCenterZ + floor.z]}
        args={[floorSize, floorHeight, floorSize]}
          onPointerOver={() => setHoveredObject(floor.key)}
        onPointerOut={() => setHoveredObject(null)}
      >
          <meshStandardMaterial color={hoveredObject === floor.key ? hoverColor : floorColor} />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );
    });

    // Generate continuation pattern
    learningOutcomesPlatform.continuationPattern.forEach(piece => {
      if (piece.type === 'floor') {
    floors.push(
      <Box
            key={piece.key}
            position={[platformCenterX + piece.x, platformLevel, platformCenterZ + piece.z]}
        args={[floorSize, floorHeight, floorSize]}
            onPointerOver={() => setHoveredObject(piece.key)}
        onPointerOut={() => setHoveredObject(null)}
      >
            <meshStandardMaterial color={hoveredObject === piece.key ? hoverColor : floorColor} />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );
      } else {
    floors.push(
          <mesh
            key={piece.key}
            position={[platformCenterX + piece.x, platformLevel - floorHeight/2, platformCenterZ + piece.z]}
            geometry={rightTriangleGeometry}
            rotation={[0, piece.rotation || 0, 0]}
            onPointerOver={() => setHoveredObject(piece.key)}
        onPointerOut={() => setHoveredObject(null)}
      >
            <meshStandardMaterial color={hoveredObject === piece.key ? hoverColor : floorColor} flatShading={true} />
        <Edges color="#D27E17" linewidth={2} />
          </mesh>
        );
      }
    });

    // MASSIVE FOUNDATION FOR LEARNING OUTCOMES PLATFORM
    const platformFoundationHeight = 200;
    const platformFoundationY = -platformFoundationHeight/2 + 2.85; 
    
    const foundationBlocks = [
      // Row 1 (top, around extension floors)
      { x: -spacing * 3, z: spacing * 3, width: floorSize, depth: floorSize },
      { x: -spacing * 3, z: spacing * 2, width: floorSize, depth: floorSize },
      { x: -spacing * 3, z: -spacing * 2, width: floorSize, depth: floorSize },
      { x: -spacing * 3, z: -spacing * 3, width: floorSize, depth: floorSize },
      
      // Row 2 (fill floors level)
      { x: -spacing * 2, z: spacing * 2, width: floorSize, depth: floorSize },
      { x: -spacing * 2, z: -spacing * 2, width: floorSize, depth: floorSize },
      
      // Row 3 (core + triangles)
      { x: -spacing, z: spacing, width: floorSize, depth: floorSize },
      { x: -spacing, z: 0, width: floorSize, depth: floorSize },
      { x: -spacing, z: -spacing, width: floorSize, depth: floorSize },
      
      // Row 4 (floor 1)
      { x: 0, z: 0, width: floorSize, depth: floorSize },
      
      // Extended wing foundations
      { x: -spacing * 4, z: spacing * 2, width: floorSize, depth: floorSize },
      { x: -spacing * 4, z: -spacing * 2, width: floorSize, depth: floorSize },
      { x: -spacing * 5, z: spacing, width: floorSize, depth: floorSize },
      { x: -spacing * 5, z: 0, width: floorSize, depth: floorSize },
      { x: -spacing * 5, z: -spacing, width: floorSize, depth: floorSize },
      { x: -spacing * 6, z: 0, width: floorSize, depth: floorSize },
    ];
    
    foundationBlocks.forEach((block, index) => {
    floors.push(
      <Box
          key={`platform-foundation-${index}`}
          position={[platformCenterX + block.x, platformFoundationY, platformCenterZ + block.z]}
          args={[block.width, platformFoundationHeight, block.depth]}
        >
          <meshStandardMaterial color={floorColor} />
        <Edges color="#D27E17" linewidth={2} />
      </Box>
    );
    });
    
    // Add triangular foundation pieces to complete the octagonal walls
    const triangleFoundationGeometry = new THREE.BufferGeometry();
    const triFoundationVertices = new Float32Array([
      // Top triangle (at platform level)
      0, 0, 0,                    
      floorSize, 0, 0,           // vertex 1
      0, 0, floorSize,           // vertex 2
      // Bottom triangle (deep underground)
      0, -platformFoundationHeight, 0,          // vertex 3
      floorSize, -platformFoundationHeight, 0,  // vertex 4
      0, -platformFoundationHeight, floorSize,  // vertex 5
    ]);
    
    const triFoundationIndices = [
      // Top face (both sides for double-sided rendering)
      0, 1, 2,
      0, 2, 1,
      // Bottom face (both sides)
      3, 5, 4,
      3, 4, 5,
      // Side wall 1 (front) - both sides
      0, 3, 4,  0, 4, 1,
      0, 4, 3,  0, 1, 4,
      // Side wall 2 (hypotenuse - the angled face) - both sides
      1, 4, 5,  1, 5, 2,
      1, 5, 4,  1, 2, 5,
      // Side wall 3 (back) - both sides
      2, 5, 3,  2, 3, 0,
      2, 3, 5,  2, 0, 3
    ];
    
    triangleFoundationGeometry.setIndex(triFoundationIndices);
    triangleFoundationGeometry.setAttribute('position', new THREE.BufferAttribute(triFoundationVertices, 3));
    triangleFoundationGeometry.computeVertexNormals();
    
    // Add all the triangular foundation pieces matching the platform triangles
    learningOutcomesPlatform.triangles.forEach(tri => {
    floors.push(
        <mesh
          key={`${tri.key}-foundation`}
          position={[platformCenterX + tri.x, platformLevel - floorHeight/2, platformCenterZ + tri.z]}
          geometry={triangleFoundationGeometry}
          rotation={[0, tri.rotation, 0]}
        >
          <meshStandardMaterial color={floorColor} flatShading={true} />
        <Edges color="#D27E17" linewidth={2} />
        </mesh>
      );
    });
    
    // Add triangular foundations from the continuation pattern
    learningOutcomesPlatform.continuationPattern.forEach(piece => {
      if (piece.type === 'triangle') {
        floors.push(
          <mesh
            key={`${piece.key}-foundation`}
            position={[platformCenterX + piece.x, platformLevel - floorHeight/2, platformCenterZ + piece.z]}
            geometry={triangleFoundationGeometry}
            rotation={[0, piece.rotation || 0, 0]}
          >
            <meshStandardMaterial color={floorColor} flatShading={true} />
            <Edges color="#D27E17" linewidth={2} />
          </mesh>
        );
      }
    });

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

    // corner pillars (positioned below the upper floor, extending down to lower floor)
    const pillarPositions = [
      [structureX - floorSize * 0.4, lowerFloorY / 2, structureZ - floorSize * 0.4], 
      [structureX + floorSize * 0.4, lowerFloorY / 2, structureZ - floorSize * 0.4], 
      [structureX - floorSize * 0.4, lowerFloorY / 2, structureZ + floorSize * 0.4]  
    ];

    pillarPositions.forEach((pos, index) => {
      floors.push(
        <Box
          key={`pillar-${index}`}
          position={[pos[0], pos[1], pos[2]]}
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

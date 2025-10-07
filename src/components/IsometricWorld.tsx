import React from 'react';
import { Box, Plane, Edges } from '@react-three/drei';
import * as THREE from 'three';

const IsometricWorld: React.FC = () => {
  // Main color for the floors
  const floorColor = '#641E68';

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
          color="#641E68"
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
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
          >
            <meshStandardMaterial 
              color={floorColor}
            />
            {/* <Edges color="#D27E17" linewidth={2} /> */}
          </Box>
        );
      }
    }

    // Bone white slab on top of the middle floor 
    floors.push(
      <Box
        key="bone-white-slab"
        position={[0, floorHeight - 0.092, 0]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
      >
        <meshStandardMaterial 
          color={'#F5F5DC'} 
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    floors.push(
      <Box
        key="extension-1"
        position={[0, 0, -1 * spacing - spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    // Second extension floor
    floors.push(
      <Box
        key="extension-2"
        position={[0, 0, -1 * spacing - spacing * 2]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
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
          color="#641E68"
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
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
          >
            <meshStandardMaterial 
              color={floorColor}
            />
            {/* <Edges color="#D27E17" linewidth={2} /> */}
          </Box>
        );
      }
    }

    // Tall blocks on the outer edge of 5x5 grid (opposite from 3x3 grid)
    const wallHeight = 3.2; 
    const grid5x5BaseZ = -1 * spacing - spacing * 3;
    
    // Bottom/outer edge only (row 4) - 5 blocks
    for (let col = 0; col < 5; col++) {
      const x = (col - 2) * spacing;
      const z = grid5x5BaseZ - 4 * spacing; 
      floors.push(
        <Box
          key={`wall-outer-${col}`}
          position={[x, wallHeight / 1.83, z]}
          args={[floorSize, wallHeight, floorSize]}
        >
          <meshStandardMaterial 
            color={floorColor}
          />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
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
        >
          <meshStandardMaterial 
            color={'#C5A3FF'}
          />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
        </Box>
      );
    }

    // Connecting blocks between stairs and tall wall
    const connectingBlockHeight1 = 2.4; // First block height
    const connectingBlockHeight2 = 1.55; // Second block height 
    const connectingBlockX = -2 * spacing;
    
    // First taller block
      floors.push(
        <Box
        key="connecting-block-1"
        position={[connectingBlockX, connectingBlockHeight1 / 1.8, grid5x5BaseZ - 3.4 * spacing]}
        args={[floorSize, connectingBlockHeight1, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
    
    // Second shorter block 
    floors.push(
      <Box
        key="connecting-block-2"
        position={[connectingBlockX, connectingBlockHeight2 / 1.8, grid5x5BaseZ - 2.4 * spacing]}
        args={[floorSize, connectingBlockHeight2, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    // Second row of shorter wall blocks (half height of the tall wall)
    const secondWallHeight = wallHeight / 2;
    const secondWallDepth = floorSize * 1.2; 
    const secondWallZ = grid5x5BaseZ - 3 * spacing;
    
    for (let col = 0; col < 5; col++) {
      const x = (col - 2) * spacing;
      floors.push(
        <Box
          key={`wall-second-${col}`}
          position={[x, secondWallHeight / 1.7, secondWallZ + 0.15]}
          args={[floorSize, secondWallHeight, secondWallDepth]}
        >
          <meshStandardMaterial 
            color={floorColor}
          />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
        </Box>
      );
    }

    // Stairs leading up to the second wall blocks (middle area)
    const middleStairsCount = 5;
    const middleStairsStartX = 0;
    const middleStairsStartZ = grid5x5BaseZ - 1.3 * spacing;
    const middleStairSpacing = 0.3;
    
    for (let step = 1; step <= middleStairsCount; step++) {
    floors.push(
      <Box
          key={`middle-stair-${step}`}
          position={[middleStairsStartX, floorHeight * step, middleStairsStartZ - step * middleStairSpacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
            color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
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
      >
        <meshStandardMaterial 
            color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
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
      >
        <meshStandardMaterial 
            color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
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
      >
        <meshStandardMaterial 
            color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
    }

    // Two floor extensions in front of the stairs 
    const topStairLevel = floorHeight * 9;
    const stairEndX = -1 * spacing - spacing * 0.4 - spacing * 0.28 * 9; 
    const platformLevel = topStairLevel + floorHeight * 1; 
    
    // NEW LEARNING OUTCOMES PLATFORM - Square Ramp Structure
    const platformCenterX = stairEndX - spacing * 3.18;
    const platformCenterZ = 0;
    
    // NEW 5x3 RECTANGULAR RAMP PLATFORM - The ramp IS the structure  
    const rampWidth = 5; 
    const rampDepth = 3;
    const maxRampHeight = 3;
    
    // Create the rectangular ramp perimeter
    for (let x = 0; x < rampWidth; x++) {
      for (let z = 0; z < rampDepth; z++) {
        const isInHole = (x >= 1 && x <= 3) && (z >= 1 && z <= 1);
        if (isInHole) continue;
        
        const isLastRampPiece = (x === 0) && (z === 1);
        if (isLastRampPiece) continue;

         // Height increases as we go around the perimeter
         let rampHeight = 0;
         if (x === 0 || x === rampWidth - 1 || z === 0 || z === rampDepth - 1) {
           const perimeter = 2 * (rampWidth + rampDepth - 2);
           let perimeterIndex = 0;
           
           if (z === 0) {
             perimeterIndex = x;
           } else if (x === rampWidth - 1) {
             perimeterIndex = rampWidth + z - 1;
           } else if (z === rampDepth - 1) {
             perimeterIndex = rampWidth + rampDepth + (rampWidth - 1 - x) - 2;
           } else if (x === 0) {
             perimeterIndex = 2 * rampWidth + rampDepth + (rampDepth - 1 - z) - 3; 
           }
           
           rampHeight = (perimeterIndex / perimeter) * maxRampHeight;
         }
        
        const segmentKey = `ramp-segment-${x}-${z}`;
         const segmentX = platformCenterX - (x - rampWidth/2 + 0.5) * spacing;
         const segmentZ = platformCenterZ - (z - rampDepth/2 + 0.5) * spacing;
        const segmentY = platformLevel + rampHeight;
        
    floors.push(
      <Box
            key={segmentKey}
            position={[segmentX, segmentY, segmentZ]}
            args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
              color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
      }
    }

    // FOUNDATION for the ramp structure 
    const rampFoundationHeight = 200;
    
    for (let x = 0; x < rampWidth; x++) {
      for (let z = 0; z < rampDepth; z++) {
        const isInHole = (x >= 1 && x <= 3) && (z >= 1 && z <= 1);
        if (isInHole) continue;
        
        // Skip the very last piece of the ramp foundation too
        const isLastRampPiece = (x === 0) && (z === 1);
        if (isLastRampPiece) continue;

        // Only create foundation for perimeter pieces
        if (x === 0 || x === rampWidth - 1 || z === 0 || z === rampDepth - 1) {
          const foundationKey = `ramp-foundation-${x}-${z}`;
          const foundationX = platformCenterX - (x - rampWidth/2 + 0.5) * spacing;
          const foundationZ = platformCenterZ - (z - rampDepth/2 + 0.5) * spacing;
          
          let rampHeight = 0;
          if (x === 0 || x === rampWidth - 1 || z === 0 || z === rampDepth - 1) {
            const perimeter = 2 * (rampWidth + rampDepth - 2);
            let perimeterIndex = 0;
            
            if (z === 0) {
              perimeterIndex = x;
            } else if (x === rampWidth - 1) {
              perimeterIndex = rampWidth + z - 1;
            } else if (z === rampDepth - 1) {
              perimeterIndex = rampWidth + rampDepth + (rampWidth - 1 - x) - 2;
            } else if (x === 0) {
              perimeterIndex = 2 * rampWidth + rampDepth + (rampDepth - 1 - z) - 3; 
            }
            
            rampHeight = (perimeterIndex / perimeter) * maxRampHeight;
          }
          
          const currentFloorY = platformLevel + rampHeight;
          const foundationY = currentFloorY - rampFoundationHeight/2 - 0.15;
          
    floors.push(
      <Box
              key={foundationKey}
              position={[foundationX, foundationY, foundationZ]}
              args={[floorSize, rampFoundationHeight, floorSize]}
      >
        <meshStandardMaterial 
                color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
        }
      }
    }

    // CONNECTING FLOOR - Bridge between stairs and learning outcomes platform
    const connectingFloorX = stairEndX - spacing * 1.18; 
    const connectingFloorZ = platformCenterZ;
    const connectingFloorY = platformLevel; 
    
    floors.push(
      <Box
        key="connecting-floor-to-platform"
        position={[connectingFloorX, connectingFloorY, connectingFloorZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    // SLAB ON HIGH BLOCKS 
    floors.push(
      <Box
        key="high-block-slab"
        position={[3, wallHeight / 1.83 + wallHeight/2 + 0.07, grid5x5BaseZ - 4 * spacing]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
      >
        <meshStandardMaterial 
          color={'#F5F5DC'} 
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    // 5 SLABS STAIRCASE 
    const staircaseSlabs = [
      { x: -10.625, y: wallHeight * 1 + 0.5, z: 1.5, key: 'staircase-slab-1' },
      { x: -13.625, y: wallHeight * 1 + 1.01, z: 1.5, key: 'staircase-slab-2' },
      { x: -13.625, y: wallHeight * 1 + 1.52, z: -1.5, key: 'staircase-slab-3' },
      { x: -10.625, y: wallHeight * 1 + 2.02, z: -1.5, key: 'staircase-slab-4' },
      { x: -7.625, y: wallHeight * 1 + 2.52, z: -1.5, key: 'staircase-slab-5' }
    ];

    staircaseSlabs.forEach(slab => {
    floors.push(
      <Box
          key={slab.key}
          position={[slab.x, slab.y, slab.z]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
      >
        <meshStandardMaterial 
            color={'#F5F5DC'} 
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
    });

    // SLAB ON SMALLER BLOCKS ROW 
    floors.push(
      <Box
        key="smaller-block-slab"
        position={[-1.5, secondWallHeight / 1.7 + secondWallHeight/2 + 0.07, secondWallZ + 0.15]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
      >
        <meshStandardMaterial 
          color={'#F5F5DC'} 
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    floors.push(
      <Box
        key="floor-from-6-1"
        position={[1 * spacing + spacing, 0, 0]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    floors.push(
      <Box
        key="floor-from-6-2"
        position={[1 * spacing + spacing * 2, 0, 0]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
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
          color="#F5F5DC"
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
        >
          <meshStandardMaterial 
            color={'#C5A3FF'}
          />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
        </Box>
      );
    });

    // lower floor
    floors.push(
      <Box
        key="lower-floor"
        position={[structureX, lowerFloorY, structureZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
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
          color="#F5F5DC"
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
      >
        <meshStandardMaterial 
          color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    floors.push(
      <Box
        key="lower-extension-2"
        position={[structureX + spacing * 2, lowerFloorY, structureZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={'#C5A3FF'}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    // Octagon platform extension
    const octBaseX = structureX + spacing * 2; // Start from lower-extension-2
    const octBaseZ = structureZ;
    
    // SLAB ON ARTWORK PLATFORM (octagonal platform middle)
    floors.push(
      <Box
        key="artwork-platform-slab"
        position={[octBaseX + spacing * 2, lowerFloorY + floorHeight/2 + 0.07, octBaseZ]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
      >
        <meshStandardMaterial 
          color={'#F5F5DC'} 
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
    
    // 3 floors extending in X direction
    floors.push(
      <Box
        key="oct-ext-1"
        position={[octBaseX + spacing, lowerFloorY, octBaseZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
    
    floors.push(
      <Box
        key="oct-ext-2"
        position={[octBaseX + spacing * 2, lowerFloorY, octBaseZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
    
    floors.push(
      <Box
        key="oct-ext-3"
        position={[octBaseX + spacing * 3, lowerFloorY, octBaseZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    // Two floors forming the X - extending from the middle floor (oct-ext-2)
    const middleX = octBaseX + spacing * 2;
    
    // One perpendicular floor in +Z direction
    floors.push(
      <Box
        key="oct-cross-1"
        position={[middleX, lowerFloorY, octBaseZ + spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
    
    // One perpendicular floor in -Z direction
    floors.push(
      <Box
        key="oct-cross-2"
        position={[middleX, lowerFloorY, octBaseZ - spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial 
          color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    // 4 triangular pieces to fill the gaps and create octagon
    const octTriangles = [
      // Top-left gap (between oct-ext-1 and oct-cross-1)
      { x: octBaseX + spacing * 2.5, z: octBaseZ + spacing * 0.5, rotation: -Math.PI / 4 + 0.785, key: 'oct-tri-1' },
      // Bottom-left gap 
      { x: octBaseX + spacing * 2.5, z: octBaseZ - spacing * 0.5, rotation: Math.PI / 4 + 0.785, key: 'oct-tri-2' },
      // Top-right gap 
      { x: octBaseX + spacing * 1.5, z: octBaseZ + spacing * 0.5, rotation: -Math.PI / 2, key: 'oct-tri-3' },
      // Bottom-right gap 
      { x: octBaseX + spacing * 1.5, z: octBaseZ - spacing * 0.5, rotation: Math.PI / 1, key: 'oct-tri-4' },
    ];

    octTriangles.forEach(tri => {
      const triGeo = new THREE.BufferGeometry();
      const triVerts = new Float32Array([
        0, 0, 0, floorSize, 0, 0, 0, 0, floorSize,
        0, floorHeight, 0, floorSize, floorHeight, 0, 0, floorHeight, floorSize,
      ]);
      
      const triIndices = [0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0];
      
      triGeo.setAttribute('position', new THREE.BufferAttribute(triVerts, 3));
      triGeo.setIndex(triIndices);
      triGeo.computeVertexNormals();

      floors.push(
        <mesh
          key={tri.key}
          position={[tri.x, lowerFloorY - floorHeight/2, tri.z]}
          rotation={[0, tri.rotation, 0]}
        >
          <primitive object={triGeo} attach="geometry" />
          <meshStandardMaterial
            color={floorColor}
            flatShading={true}
          />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
        </mesh>
      );
    });

    // Octagonal foundation matching the platform shape
    const octFoundationHeight = 200;
    const octFoundationY = -octFoundationHeight/2 + lowerFloorY - floorHeight/2;
    
    // ELEVATOR FOUNDATION 
    floors.push(
      <Box
        key="elevator-foundation"
        position={[structureX, octFoundationY, structureZ]}
        args={[floorSize, octFoundationHeight, floorSize]}
      >
        <meshStandardMaterial color='#C5A3FF' />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );

    // ARTWORK PLATFORM FOUNDATIONS (keep original color)
    const artworkFoundationBlocks = [
      // The 3 main octagon floors
      { x: octBaseX + spacing, z: octBaseZ },
      { x: octBaseX + spacing * 2, z: octBaseZ },
      { x: octBaseX + spacing * 3, z: octBaseZ },
      // Cross pieces
      { x: octBaseX + spacing * 2, z: octBaseZ + spacing }, // Cross piece top
      { x: octBaseX + spacing * 2, z: octBaseZ - spacing }, // Cross piece bottom
    ];
    
    artworkFoundationBlocks.forEach((block, index) => {
      floors.push(
        <Box
          key={`artwork-foundation-${index}`}
          position={[block.x, octFoundationY, block.z]}
          args={[floorSize, octFoundationHeight, floorSize]}
        >
          <meshStandardMaterial color='#641E68' />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
        </Box>
      );
    });
    
    // Triangular foundation pieces for the 4 gaps
    const octFoundationTriGeometry = new THREE.BufferGeometry();
    const octFoundationTriVerts = new Float32Array([
      0, 0, 0, floorSize, 0, 0, 0, 0, floorSize,
      0, -octFoundationHeight, 0, floorSize, -octFoundationHeight, 0, 0, -octFoundationHeight, floorSize,
    ]);
    const octFoundationTriIndices = [
      0, 1, 2, 0, 2, 1,
      3, 5, 4, 3, 4, 5,
      0, 3, 4, 0, 4, 1, 0, 4, 3, 0, 1, 4,
      1, 4, 5, 1, 5, 2, 1, 5, 4, 1, 2, 5,
      2, 5, 3, 2, 3, 0, 2, 3, 5, 2, 0, 3
    ];
    octFoundationTriGeometry.setAttribute('position', new THREE.BufferAttribute(octFoundationTriVerts, 3));
    octFoundationTriGeometry.setIndex(octFoundationTriIndices);
    octFoundationTriGeometry.computeVertexNormals();
    
    const octFoundationTris = [
      { x: octBaseX + spacing * 2.5, z: octBaseZ + spacing * 0.5, rotation: -Math.PI / 4 + 0.785 },
      { x: octBaseX + spacing * 2.5, z: octBaseZ - spacing * 0.5, rotation: Math.PI / 4 + 0.785 },
      { x: octBaseX + spacing * 1.5, z: octBaseZ + spacing * 0.5, rotation: -Math.PI / 2 },
      { x: octBaseX + spacing * 1.5, z: octBaseZ - spacing * 0.5, rotation: Math.PI / 1 },
    ];
    
    octFoundationTris.forEach((tri, index) => {
      floors.push(
        <mesh
          key={`oct-foundation-tri-${index}`}
          position={[tri.x, lowerFloorY - floorHeight/2, tri.z]}
          rotation={[0, tri.rotation, 0]}
        >
          <primitive object={octFoundationTriGeometry} attach="geometry" />
          <meshStandardMaterial color="#641E68" flatShading={true} />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
        </mesh>
      );
    });

    // First set of downward stairs
    for (let step = 1; step <= 3; step++) {
      floors.push(
        <Box
          key={`down-stair-set1-${step}`}
          position={[0, -floorHeight * step, 1 * spacing + spacing * 0.4 + spacing * 0.3 * step]}
          args={[floorSize, floorHeight, floorSize]}
        >
          <meshStandardMaterial 
            color={'#C5A3FF'}
          />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
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
        >
          <meshStandardMaterial 
            color={'#C5A3FF'}
          />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
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
        >
          <meshStandardMaterial 
            color={'#C5A3FF'}
          />
          {/* <Edges color="#D27E17" linewidth={2} /> */}
        </Box>
      );
    }

    // 12x3 PLATFORM 
    const platform12x3StartZ = 1 * spacing + spacing * 1.4 + spacing * 0.3 * 9; 
    const platform12x3Y = -floorHeight * 9; 
    
    // Create the simple 12x3 platform 
    for (let x = 0; x < 3; x++) {
      for (let z = 0; z < 12; z++) {
        const platformKey = `platform-12x3-${x}-${z}`;
        const platformX = (x - 1) * spacing; 
        const platformZ = platform12x3StartZ + z * spacing; 
        const platformY = platform12x3Y;
        
        floors.push(
          <Box
            key={platformKey}
            position={[platformX, platformY, platformZ]}
            args={[floorSize, floorHeight, floorSize]}
          >
            <meshStandardMaterial 
              color={floorColor}
            />
            {/* <Edges color="#D27E17" linewidth={2} /> */}
          </Box>
        );
      }
    }

    // FOUNDATION for the 12x3 platform 
    const platform12x3FoundationHeight = 200;
    const platform12x3FoundationWidth = 3 * spacing; 
    const platform12x3FoundationDepth = 12 * spacing;
    const platform12x3FoundationCenterZ = platform12x3StartZ + (12 * spacing) / 2 - spacing/2; 
    const foundationY = platform12x3Y - platform12x3FoundationHeight/2 - 0.15;
    
    floors.push(
      <Box
        key="platform-12x3-foundation-big"
        position={[0, foundationY, platform12x3FoundationCenterZ]}
        args={[platform12x3FoundationWidth, platform12x3FoundationHeight, platform12x3FoundationDepth]}
      >
        <meshStandardMaterial 
          color={floorColor}
        />
        {/* <Edges color="#D27E17" linewidth={2} /> */}
      </Box>
    );
    return <>{floors}</>;
  };
   
  return (
    <group>
      <CentralFloors />
    </group>
  );
};

export default IsometricWorld;

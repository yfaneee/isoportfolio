import React, { useState } from 'react';
import { Box, Plane, Edges } from '@react-three/drei';

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

    // First set of stairs (original)
    for (let step = 1; step <= 3; step++) {
      floors.push(
        <Box
          key={`stair-set1-${step}`}
          position={[-1 * spacing - spacing * 0.4 - spacing * 0.3 * step, floorHeight * step, 0]}
          args={[floorSize * 0.8, floorHeight, floorSize * 0.8]}
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
          args={[floorSize * 0.8, floorHeight, floorSize * 0.8]}
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
          args={[floorSize * 0.8, floorHeight, floorSize * 0.8]}
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
          args={[floorSize * 0.8, floorHeight, floorSize * 0.8]}
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
          args={[floorSize * 0.8, floorHeight, floorSize * 0.8]}
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
          args={[floorSize * 0.8, floorHeight, floorSize * 0.8]}
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

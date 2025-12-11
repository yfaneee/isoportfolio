import React, { useRef, useEffect, useMemo } from 'react';
import { Box, Plane } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import InteractiveBillboard from './InteractiveBillboard';
import InteractiveSlab from './InteractiveSlab';
import InteractiveOutlineButton from './InteractiveOutlineButton';

// ============================================================================
// SKYSCRAPER FOUNDATION WITH ANIMATED WINDOWS
// ============================================================================
const SkyscraperFoundation: React.FC<{
  position: [number, number, number];
  size: [number, number, number];
  baseColor: string;
}> = ({ position, size, baseColor }) => {
  const windowMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const windowStatesRef = useRef<{ brightness: number; targetBrightness: number; timer: number }[]>([]);
  const initializedRef = useRef(false);
  
  // Window configuration 
  const windowsPerRow = 5;
  const windowsPerColumn = 16;
  
  const windowWidth = (size[0] - 1) / windowsPerRow - 0.3;
  const windowHeight = 2;
  const windowGapX = 0.4;
  const windowGapY = 2;
  const windowInset = 0.02;
  
  // Generate window positions for all 4 sides
  const windowPositions = useMemo(() => {
    const windows: { pos: [number, number, number]; rotation: [number, number, number] }[] = [];
    
    const startY = size[1] / 2 - 2.5;
    const totalWidthX = windowsPerRow * windowWidth + (windowsPerRow - 1) * windowGapX;
    const startX = -totalWidthX / 2 + windowWidth / 2;
    
    // Front and back faces
    for (let row = 0; row < windowsPerColumn; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const x = startX + col * (windowWidth + windowGapX);
        const y = startY - row * (windowHeight + windowGapY);
        
        // Front face
        windows.push({ pos: [x, y, size[2] / 2 + windowInset], rotation: [0, 0, 0] });
        
      }
    }
    
    // Left and right faces
    const totalWidthZ = windowsPerRow * windowWidth + (windowsPerRow - 1) * windowGapX;
    const startZ = -totalWidthZ / 2 + windowWidth / 2;
    
    for (let row = 0; row < windowsPerColumn; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        const z = startZ + col * (windowWidth + windowGapX);
        const y = startY - row * (windowHeight + windowGapY);
        
        // Right face
        windows.push({ pos: [size[0] / 2 + windowInset, y, z], rotation: [0, Math.PI / 2, 0] });
        
      }
    }
    
    return windows;
  }, [size, windowsPerRow, windowsPerColumn, windowWidth, windowHeight, windowGapX, windowGapY, windowInset]);
  
  // Initialize window states
  useEffect(() => {
    if (!initializedRef.current) {
      windowStatesRef.current = windowPositions.map(() => {
        const isOn = Math.random() > 0.5;
        return {
          brightness: isOn ? 0.7 + Math.random() * 0.3 : 0.05 + Math.random() * 0.1,
          targetBrightness: isOn ? 0.7 + Math.random() * 0.3 : 0.05 + Math.random() * 0.1,
          timer: Math.random() * 10
        };
      });
      initializedRef.current = true;
    }
  }, [windowPositions]);
  
  // Animate windows
  useFrame((_, delta) => {
    windowMaterialsRef.current.forEach((material, index) => {
      if (!material || !windowStatesRef.current[index]) return;
      
      const state = windowStatesRef.current[index];
      
      // Update timer
      state.timer -= delta;
      
      // When timer expires, change state
      if (state.timer <= 0) {
        state.timer = 1.5 + Math.random() * 8;
        
        // 60% chance to toggle state
        if (Math.random() < 0.6) {
          const isCurrentlyOn = state.targetBrightness > 0.5;
          if (isCurrentlyOn) {
            // Turn off
            state.targetBrightness = 0.05 + Math.random() * 0.1;
          } else {
            // Turn on
            state.targetBrightness = 0.7 + Math.random() * 0.3;
          }
        }
      }
      
      // Smooth interpolation
      state.brightness += (state.targetBrightness - state.brightness) * delta * 3;
      
      // Update material emissive
      material.emissiveIntensity = state.brightness * 3;
    });
  });
  
  return (
    <group position={position}>
      {/* Main building structure */}
      <Box args={size}>
        <meshStandardMaterial color={baseColor} />
      </Box>
      
      {/* Windows */}
      {windowPositions.map((window, index) => (
        <mesh
          key={`window-${index}`}
          position={window.pos}
          rotation={window.rotation}
        >
          <planeGeometry args={[windowWidth, windowHeight]} />
          <meshStandardMaterial
            ref={(el) => { if (el) windowMaterialsRef.current[index] = el; }}
            color="#2a1a0a"
            emissive="#E8A200"
            emissiveIntensity={Math.random() > 0.5 ? 2.5 : 0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// ============================================================================
// RAMP FOUNDATIONS WITH WINDOWS (only on visible north/west sides)
// ============================================================================
const RampFoundationsWithWindows: React.FC<{
  floorColor: string;
  spacing: number;
  floorHeight: number;
}> = ({ floorColor, spacing, floorHeight }) => {
  const windowMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const windowStatesRef = useRef<{ brightness: number; targetBrightness: number; timer: number }[]>([]);
  const initializedRef = useRef(false);
  
  const floorSize = 1.5;
  const platformLevel = floorHeight * 9 + floorHeight * 1;
  const platformCenterX = -1 * spacing - spacing * 0.4 - spacing * 0.28 * 9 - spacing * 3.18;
  const platformCenterZ = 0;
  const rampWidth = 5;
  const rampDepth = 3;
  const maxRampHeight = 3;
  const rampFoundationHeight = 200;
  
  // Window settings
  const windowWidth = 1.1;
  const windowHeight = 1.7;
  const windowGapY = 2;
  const windowsPerColumn = 16;
  
  // Generate foundation data and window positions
  const { foundations, windowPositions } = useMemo(() => {
    const foundations: { key: string; position: [number, number, number]; hasEastWindows: boolean; hasSouthWindows: boolean; hasBigFaceWindows: boolean }[] = [];
    const windows: { pos: [number, number, number]; rotation: [number, number, number] }[] = [];
    
    for (let x = 0; x < rampWidth; x++) {
      for (let z = 0; z < rampDepth; z++) {
        const isInHole = (x >= 1 && x <= 3) && (z >= 1 && z <= 1);
        if (isInHole) continue;
        
        const isLastRampPiece = (x === 0) && (z === 1);
        if (isLastRampPiece) continue;

        if (x === 0 || x === rampWidth - 1 || z === 0 || z === rampDepth - 1) {
          let rampHeight = 0;
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
          
          const foundationX = platformCenterX - (x - rampWidth/2 + 0.5) * spacing;
          const foundationZ = platformCenterZ - (z - rampDepth/2 + 0.5) * spacing;
          const currentFloorY = platformLevel + rampHeight;
          const foundationY = currentFloorY - rampFoundationHeight/2 - 0.15;
          
          // Check which sides should have windows 
          const hasEastWindows = x === 0; 
          const hasSouthWindows = z === rampDepth - 1; 
          const hasBigFaceWindows = z === 0; 
          
          foundations.push({
            key: `ramp-foundation-${x}-${z}`,
            position: [foundationX, foundationY, foundationZ],
            hasEastWindows,
            hasSouthWindows,
            hasBigFaceWindows
          });
          
          // Generate windows for visible sides
          const startY = rampFoundationHeight / 2 - 3;
          
          if (hasEastWindows) {
            // Windows on east face (positive X)
            for (let row = 0; row < windowsPerColumn; row++) {
              const winY = foundationY + startY - row * (windowHeight + windowGapY);
              windows.push({
                pos: [foundationX + floorSize/2 + 0.02, winY, foundationZ],
                rotation: [0, Math.PI / 2, 0]
              });
            }
          }
          
          if (hasSouthWindows) {
            // Windows on south face (positive Z) - outer face of ramp
            for (let row = 0; row < windowsPerColumn; row++) {
              const winY = foundationY + startY - row * (windowHeight + windowGapY);
              windows.push({
                pos: [foundationX, winY, foundationZ + floorSize/2 + 0.02],
                rotation: [0, 0, 0]
              });
            }
          }
          
          if (hasBigFaceWindows) {
            // Windows on south face (+Z) of ALL north row foundations 
            for (let row = 0; row < windowsPerColumn; row++) {
              const winY = foundationY + startY - row * (windowHeight + windowGapY);
              windows.push({
                pos: [foundationX, winY, foundationZ + floorSize/2 + 0.02],
                rotation: [0, 0, 0]
              });
            }
          }
        }
      }
    }
    
    return { foundations, windowPositions: windows };
  }, [platformCenterX, platformCenterZ, platformLevel, rampFoundationHeight, floorSize, windowHeight, windowGapY, windowsPerColumn, spacing, rampWidth, rampDepth, maxRampHeight]);
  
  // Initialize window states
  useEffect(() => {
    if (!initializedRef.current && windowPositions.length > 0) {
      windowStatesRef.current = windowPositions.map(() => {
        const isOn = Math.random() > 0.5;
        return {
          brightness: isOn ? 0.7 + Math.random() * 0.3 : 0.05 + Math.random() * 0.1,
          targetBrightness: isOn ? 0.7 + Math.random() * 0.3 : 0.05 + Math.random() * 0.1,
          timer: Math.random() * 10
        };
      });
      initializedRef.current = true;
    }
  }, [windowPositions]);
  
  // Animate windows
  useFrame((_, delta) => {
    windowMaterialsRef.current.forEach((material, index) => {
      if (!material || !windowStatesRef.current[index]) return;
      
      const state = windowStatesRef.current[index];
      state.timer -= delta;
      
      if (state.timer <= 0) {
        state.timer = 1.5 + Math.random() * 8;
        if (Math.random() < 0.6) {
          const isCurrentlyOn = state.targetBrightness > 0.5;
          state.targetBrightness = isCurrentlyOn ? 0.05 + Math.random() * 0.1 : 0.7 + Math.random() * 0.3;
        }
      }
      
      state.brightness += (state.targetBrightness - state.brightness) * delta * 3;
      material.emissiveIntensity = state.brightness * 3;
    });
  });
  
  return (
    <>
      {/* Foundation boxes */}
      {foundations.map(f => (
        <Box
          key={f.key}
          position={f.position}
          args={[floorSize, rampFoundationHeight, floorSize]}
        >
          <meshStandardMaterial color={floorColor} />
        </Box>
      ))}
      
      {/* Windows on visible sides */}
      {windowPositions.map((window, index) => (
        <mesh
          key={`ramp-window-${index}`}
          position={window.pos}
          rotation={window.rotation}
        >
          <planeGeometry args={[windowWidth, windowHeight]} />
          <meshStandardMaterial
            ref={(el) => { if (el) windowMaterialsRef.current[index] = el; }}
            color="#2a1a0a"
            emissive="#E8A200"
            emissiveIntensity={Math.random() > 0.5 ? 2.5 : 0.3}
          />
        </mesh>
      ))}
    </>
  );
};

// ============================================================================
// INSTANCED MESH COMPONENT 
// ============================================================================
interface InstanceData {
  position: [number, number, number];
}

const InstancedBoxes: React.FC<{
  instances: InstanceData[];
  args: [number, number, number];
  color: string;
}> = ({ instances, args, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();

    instances.forEach((instance, i) => {
      tempObject.position.set(...instance.position);
      tempObject.scale.set(1, 1, 1);
      tempObject.rotation.set(0, 0, 0);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    instances.forEach(instance => {
      const [x, y, z] = instance.position;
      const [width, height, depth] = args;
      
      minX = Math.min(minX, x - width / 2);
      maxX = Math.max(maxX, x + width / 2);
      minY = Math.min(minY, y - height / 2);
      maxY = Math.max(maxY, y + height / 2);
      minZ = Math.min(minZ, z - depth / 2);
      maxZ = Math.max(maxZ, z + depth / 2);
    });
    
    // Calculate center and radius of bounding sphere
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    const radius = Math.sqrt(
      Math.pow(maxX - centerX, 2) +
      Math.pow(maxY - centerY, 2) +
      Math.pow(maxZ - centerZ, 2)
    );
    
    // Set the bounding sphere to prevent frustum culling glitches
    const safeRadius = radius * 1.5;
    meshRef.current.geometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(centerX, centerY, centerZ),
      safeRadius
    );
    
    // Also update bounding box
    meshRef.current.geometry.boundingBox = new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    );
    
    // Disable frustum culling entirely to prevent any visual glitches
    meshRef.current.frustumCulled = false;
  }, [instances, args]);

  const geometry = useMemo(() => new THREE.BoxGeometry(...args), [args]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color }), [color]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, instances.length]} />
  );
};

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

// ============================================================================
// WALL BLOCKS 
// ============================================================================
interface WallBlocksProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
}

const WallBlocks = React.memo<WallBlocksProps>(({ onSlabHover, onSlabClick, introComplete, activeSlabId }) => {
  const floorColor = '#641E68';
  const floorSize = 1.5;
  const wallHeight = 3.2; 
  const spacing = 1.5;
  const grid5x5BaseZ = -1 * spacing - spacing * 3;
    
  return (
    <>
      {/* Tall wall blocks */}
      {Array.from({ length: 5 }, (_, col) => {
      const x = (col - 2) * spacing;
      const z = grid5x5BaseZ - 4 * spacing; 
        return (
        <Box
          key={`wall-outer-${col}`}
          position={[x, wallHeight / 1.83, z]}
          args={[floorSize, wallHeight, floorSize]}
        >
          <meshStandardMaterial color={floorColor} />
        </Box>
      );
      })}
      
      {/* Second row of shorter wall blocks */}
      {Array.from({ length: 5 }, (_, col) => {
        const x = (col - 2) * spacing;
        const secondWallHeight = wallHeight / 2;
        const secondWallZ = grid5x5BaseZ - 3 * spacing;
        return (
          <Box
            key={`wall-second-${col}`}
            position={[x, secondWallHeight / 1.7, secondWallZ + 0.15]}
            args={[floorSize, secondWallHeight, floorSize * 1.2]}
          >
            <meshStandardMaterial color={floorColor} />
        </Box>
      );
      })}
      
      {/* High block slab - Interactive Project Studio */}
      <InteractiveSlab
        key="high-block-slab"
        position={[3, wallHeight / 1.83 + wallHeight/2 + 0.07, grid5x5BaseZ - 4 * spacing]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="project-studio"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'project-studio'}
      />
      
      {/* Smaller block slab - Interactive Project */}
      <InteractiveSlab
        key="smaller-block-slab"
        position={[-1.5, (wallHeight / 2) / 1.7 + (wallHeight / 2)/2 + 0.07, (grid5x5BaseZ - 3 * spacing) + 0.15]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="smaller-block"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'smaller-block'}
      />
    </>
  );
});

// ============================================================================
// STAIR SYSTEMS 
// ============================================================================
interface StairSystemsProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
}

const StairSystems = React.memo<StairSystemsProps>(({ onSlabHover, onSlabClick, introComplete, activeSlabId }) => {
  const floorSize = 1.5;
  const floorHeight = 0.3;
  const spacing = 1.5;
  const wallHeight = 3.2;
  
  return (
    <>
      {/* Left stairs to tall wall (10 steps) */}
      {Array.from({ length: 10 }, (_, step) => {
        const stairStartX = -2 * spacing;
        const stairStartZ = -1 * spacing - spacing * 3 - 1.2 * spacing;
        const stairSpacing = 0.3;
        return (
          <Box
            key={`wall-stair-${step + 1}`}
            position={[stairStartX, floorHeight * (step + 1), stairStartZ - (step + 1) * stairSpacing]}
            args={[floorSize, floorHeight, floorSize]}
          >
            <meshStandardMaterial color={'#C5A3FF'} />
        </Box>
      );
      })}

      {/* Middle stairs to second wall (5 steps) */}
      {Array.from({ length: 5 }, (_, step) => {
    const middleStairsStartX = 0;
        const middleStairsStartZ = -1 * spacing - spacing * 3 - 1.3 * spacing;
    const middleStairSpacing = 0.3;
        return (
      <Box
            key={`middle-stair-${step + 1}`}
            position={[middleStairsStartX, floorHeight * (step + 1), middleStairsStartZ - (step + 1) * middleStairSpacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
            <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
    );
      })}
      
      {/* Three sets of stairs going west (9 total steps) */}
      {Array.from({ length: 9 }, (_, step) => {
        const setNumber = Math.floor(step / 3);
        const stepInSet = step % 3;
        const totalStepsBeforeSet = setNumber * 3;
        
        return (
          <Box
            key={`stair-set${setNumber + 1}-${stepInSet + 1}`}
            position={[
              -1 * spacing - spacing * 0.4 - spacing * 0.3 * (totalStepsBeforeSet + stepInSet + 1),
              floorHeight * (totalStepsBeforeSet + stepInSet + 1),
              0
            ]}
        args={[floorSize, floorHeight, floorSize]}
      >
            <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
    );
      })}
      
      {/* 5 Staircase slabs */}
      {/* Interactive Learning Outcomes slabs */}
      <InteractiveSlab
        key="staircase-slab-1"
        position={[-10.625, wallHeight * 1 + 0.5, 1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo1"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo1'}
      />
      <InteractiveSlab
        key="staircase-slab-2"
        position={[-13.625, wallHeight * 1 + 1.01, 1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo2"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo2'}
      />
      <InteractiveSlab
        key="staircase-slab-3"
        position={[-13.625, wallHeight * 1 + 1.52, -1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo3"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo3'}
      />
      <InteractiveSlab
        key="staircase-slab-4"
        position={[-10.625, wallHeight * 1 + 2.02, -1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo4"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo4'}
      />
      <InteractiveSlab
        key="staircase-slab-5"
        position={[-7.625, wallHeight * 1 + 2.52, -1.5]}
        args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
        color="#F5F5DC"
        hoverColor="#FFE4B5"
        slabId="lo5"
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        isActive={activeSlabId === 'lo5'}
      />
    </>
  );
});

// ============================================================================
// LEARNING OUTCOMES PLATFORM 
// ============================================================================
interface LearningOutcomesPlatformProps {
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
}

const LearningOutcomesPlatform = React.memo<LearningOutcomesPlatformProps>(({ onSlabHover, onSlabClick, introComplete }) => {
  const floorColor = '#641E68';
  const floorSize = 1.5;
  const floorHeight = 0.3;
  const spacing = 1.5;
  const platformLevel = floorHeight * 9 + floorHeight * 1;
  const platformCenterX = -1 * spacing - spacing * 0.4 - spacing * 0.28 * 9 - spacing * 3.18;
  const platformCenterZ = 0;
    
  // NEW 5x3 RECTANGULAR RAMP PLATFORM 
  const rampWidth = 5; 
  const rampDepth = 3;
  const maxRampHeight = 3;
  
  const rampFloors = [];
    
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
      
    rampFloors.push(
    <Box
          key={segmentKey}
          position={[segmentX, segmentY, segmentZ]}
          args={[floorSize, floorHeight, floorSize]}
    >
        <meshStandardMaterial color={floorColor} />
    </Box>
  );
    }
  }

  return (
    <>
      {/* Connecting blocks between stairs and tall wall */}
      <Box
        key="connecting-block-1"
        position={[-2 * spacing, 2.4 / 1.7, -1 * spacing - spacing * 3 - 3.4 * spacing]}
        args={[floorSize, 2.4, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
      
      <Box
        key="connecting-block-2"
        position={[-2 * spacing, 1.55 / 1.8, -1 * spacing - spacing * 3 - 2.4 * spacing]}
        args={[floorSize, 1.55, floorSize]}
      >
        <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
      
      {/* Connecting floor to platform */}
      <Box
        key="connecting-floor-to-platform"
        position={[-1 * spacing - spacing * 0.4 - spacing * 0.28 * 9 - spacing * 1.18, platformLevel, platformCenterZ]}
        args={[floorSize, floorHeight, floorSize]}
      >
        <meshStandardMaterial color={floorColor} />
      </Box>
      
      {/* Ramp platform floors */}
      {rampFloors}
    </>
  );
});

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

// ============================================================================
// PROJECT PLATFORMS 
// ============================================================================
interface ProjectPlatformsProps {
  onBillboardInteraction?: (isHovering: boolean, billboardKey?: string) => void;
  onBillboardFullscreenStart?: () => void;
  onBillboardFullscreenEnd?: () => void;
  onShowWebsite?: (websiteUrl: string, billboardKey: string) => void;
  onHideWebsite?: () => void;
  triggerBillboardExit?: boolean;
  onBillboardExitComplete?: () => void;
  characterPosition?: [number, number, number];
  onBillboardRef?: (key: string, ref: any) => void;
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
}

const ProjectPlatforms = React.memo<ProjectPlatformsProps>(({ 
  onBillboardInteraction,
  onBillboardFullscreenStart, 
  onBillboardFullscreenEnd,
  onShowWebsite,
  onHideWebsite,
  triggerBillboardExit,
  onBillboardExitComplete,
  characterPosition = [0, 0, 0],
  onBillboardRef,
  onSlabHover,
  onSlabClick,
  introComplete,
  activeSlabId
}) => {
  const floorColor = '#641E68';
  const floorSize = 1.5;
  const floorHeight = 0.3;
  const spacing = 1.5;
  const platform18x3Y = -floorHeight * 9;
  const platform18x3StartZ = 1 * spacing + spacing * 1.4 + spacing * 0.3 * 9;
  
  // Billboard/Screen structure dimensions
  const billboardPillarHeight = 2;

  // Generate 18x3 platform instances (54 boxes)
  const platform18x3Instances = useMemo(() => {
    const instances: InstanceData[] = [];
    for (let i = 0; i < 54; i++) {
      const x = Math.floor(i / 18);
      const z = i % 18;
      const platformX = (x - 1) * spacing; 
      const platformZ = platform18x3StartZ + z * spacing;
      instances.push({ position: [platformX, platform18x3Y, platformZ] });
    }
    return instances;
  }, [spacing, platform18x3Y, platform18x3StartZ]);
  
  return (
    <>
      {/* Downward stairs  */}
      {Array.from({ length: 9 }, (_, step) => {
        const y = -floorHeight * (step + 1);
        const z = 1 * spacing + spacing * 0.4 + spacing * 0.3 * (step + 1);
        
        return (
          <Box
            key={`down-stair-${step + 1}`}
            position={[0, y, z]}
          args={[floorSize, floorHeight, floorSize]}
        >
            <meshStandardMaterial color={'#C5A3FF'} />
        </Box>
      );
      })}
      
      {/* 18x3 Platform - INSTANCED */}
      <InstancedBoxes 
        instances={platform18x3Instances}
        args={[floorSize, floorHeight, floorSize]}
        color={floorColor}
      />
      
      {/* Project slabs on 18x3 platform - Interactive GitHub buttons */}
      {[
        { index: 2, key: 'project-slab-1', slabId: 'github-castle' },
        { index: 7, key: 'project-slab-2', slabId: 'github-holleman' },
        { index: 12, key: 'project-slab-3', slabId: 'github-space' },
        { index: 17, key: 'project-slab-4', slabId: 'github-spotify' }
      ].map((slab) => (
        <InteractiveSlab
          key={slab.key}
          position={[1.2, platform18x3Y + floorHeight/2 + 0.07, platform18x3StartZ + slab.index * spacing - 1.5]}
          args={[floorSize * 0.6, 0.1, floorSize * 0.6]}
          color="#F5F5DC"
          hoverColor="#FFE4B5"
          slabId={slab.slabId}
          onSlabHover={onSlabHover}
          onSlabClick={onSlabClick}
          introComplete={introComplete}
        isActive={activeSlabId === slab.slabId}
        />
      ))}

      {/* NEW OUTLINE BUTTON SLABS for website interaction - with hover effect */}
      {[
        { index: 2, key: 'outline-button-1', z: 9.15, slabId: 'website-castle' },
        { index: 7, key: 'outline-button-2', z: 16.65, slabId: 'website-holleman' },
        { index: 12, key: 'outline-button-3', z: 24.15, slabId: 'website-space' },
        { index: 17, key: 'outline-button-4', z: 31.65, slabId: 'website-spotify' }
      ].map((button) => (
        <InteractiveOutlineButton
          key={button.key}
          position={[-1, 0, 0]}
          index={button.index}
          z={button.z}
          slabId={button.slabId}
          characterPosition={characterPosition}
          platform18x3Y={platform18x3Y}
          platform18x3StartZ={platform18x3StartZ}
          spacing={spacing}
          floorHeight={floorHeight}
          floorSize={floorSize}
          onSlabHover={onSlabHover}
          onSlabClick={onSlabClick}
          introComplete={introComplete}
          activeSlabId={activeSlabId}
        />
      ))}

      {/* Extensions for billboard */}
      {[
        { row: 2, key: 'platform-18x3-row2-extension' },
        { row: 7, key: 'platform-18x3-row7-extension' },
        { row: 12, key: 'platform-18x3-row12-extension' },
        { row: 17, key: 'platform-18x3-row17-extension' }
      ].map(extension => (
        <Box
          key={extension.key}
          position={[-2.5 * spacing, platform18x3Y, platform18x3StartZ + (extension.row - 1) * spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
          <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
      ))}

      {/* Triangular pieces for all billboard extension rows */}
      {(() => {
        const triSize = floorSize * 0.75;
        return [
          { row: 2, keyPrefix: 'ext-tri-row2' },
          { row: 7, keyPrefix: 'ext-tri-row7' },
          { row: 12, keyPrefix: 'ext-tri-row12' },
          { row: 17, keyPrefix: 'ext-tri-row17' }
        ].map(rowData => [
        // Right triangle 
          { x: -2.5 * spacing + spacing * 0.5, z: platform18x3StartZ + (rowData.row - 1) * spacing + spacing * 0.5, rotation: -Math.PI / 2, key: `${rowData.keyPrefix}-right` },
        // Left triangle 
          { x: -2.5 * spacing + spacing * 0.5, z: platform18x3StartZ + (rowData.row - 1) * spacing - spacing * 0.5, rotation: Math.PI / 1, key: `${rowData.keyPrefix}-left` },
        ]).flat().map(tri => {
        const triGeo = new THREE.BufferGeometry();
        const triVerts = new Float32Array([
          0, 0, 0, triSize, 0, 0, 0, 0, triSize,
          0, floorHeight, 0, triSize, floorHeight, 0, 0, floorHeight, triSize,
        ]);
        
        const triIndices = [0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0];
        
        triGeo.setAttribute('position', new THREE.BufferAttribute(triVerts, 3));
        triGeo.setIndex(triIndices);
        triGeo.computeVertexNormals();

          return (
          <mesh
            key={tri.key}
            position={[tri.x, platform18x3Y - floorHeight/2, tri.z]}
            rotation={[0, tri.rotation, 0]}
          >
            <primitive object={triGeo} attach="geometry" />
            <meshStandardMaterial
              color={'#C5A3FF'}
              flatShading={true}
            />
          </mesh>
        );
        });
      })()}

      {/* Interactive Billboard/Screen structures */}
      {[
        { row: 2, key: 'billboard1', websiteUrl: 'https://castle-portfolio.vercel.app/' },
        { row: 7, key: 'billboard2', websiteUrl: 'https://holleman.vercel.app/' },
        { row: 12, key: 'billboard3', websiteUrl: 'https://space-portfolio-one-mu.vercel.app/' },
        { row: 17, key: 'billboard4', websiteUrl: 'https://spotify-folio.vercel.app/' }
      ].map(billboard => {
        const billboardX = -2.5 * spacing + spacing * 0.5 - 0.7;
        const billboardZ = platform18x3StartZ + (billboard.row - 1) * spacing;
        // EXACT ORIGINAL FORMULA 
        const billboardY = platform18x3Y + billboardPillarHeight/2;
        
        return (
          <InteractiveBillboard
            key={billboard.key}
            position={[billboardX, billboardY, billboardZ]}
        rotation={[0, Math.PI / 4, 0]} 
            billboardKey={billboard.key}
            websiteUrl={billboard.websiteUrl}
            onBillboardInteraction={onBillboardInteraction}
            onCameraAnimationStart={onBillboardFullscreenStart}
            onCameraAnimationEnd={onBillboardFullscreenEnd}
            onShowWebsite={onShowWebsite}
            onHideWebsite={onHideWebsite}
            triggerBillboardExit={triggerBillboardExit}
            onBillboardExitComplete={onBillboardExitComplete}
            onRef={(ref) => onBillboardRef?.(billboard.key, ref)}
            introComplete={introComplete}
          />
        );
      })}
    </>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
interface IsometricWorldProps {
  onBillboardInteraction?: (isHovering: boolean, billboardKey?: string) => void;
  onBillboardFullscreenStart?: () => void;
  onBillboardFullscreenEnd?: () => void;
  onShowWebsite?: (websiteUrl: string, billboardKey: string) => void;
  onHideWebsite?: () => void;
  triggerBillboardExit?: boolean;
  onBillboardExitComplete?: () => void;
  characterPosition?: [number, number, number];
  onBillboardRef?: (key: string, ref: any) => void;
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
  introProgress?: number;
}

const IsometricWorld: React.FC<IsometricWorldProps> = ({ 
  onBillboardInteraction,
  onBillboardFullscreenStart, 
  onBillboardFullscreenEnd,
  onShowWebsite,
  onHideWebsite,
  triggerBillboardExit,
  onBillboardExitComplete,
  characterPosition = [0, 0, 0],
  onBillboardRef,
  onSlabHover,
  onSlabClick,
  introComplete,
  activeSlabId,
  introProgress = 0
}) => {
  return (
    <group>
      <FoundationBlocks />
      <MainGrid onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} activeSlabId={activeSlabId} />
      <ExtendedGrid onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} />
      <WallBlocks onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} activeSlabId={activeSlabId} />
      <StairSystems onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} activeSlabId={activeSlabId} />
      <LearningOutcomesPlatform onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} />
      <ArtworkPlatform onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} activeSlabId={activeSlabId} />
      <ProjectPlatforms 
        onBillboardInteraction={onBillboardInteraction}
        onBillboardFullscreenStart={onBillboardFullscreenStart}
        onBillboardFullscreenEnd={onBillboardFullscreenEnd}
        onShowWebsite={onShowWebsite}
        onHideWebsite={onHideWebsite}
        triggerBillboardExit={triggerBillboardExit}
        onBillboardExitComplete={onBillboardExitComplete}
        characterPosition={characterPosition}
        onBillboardRef={onBillboardRef}
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        activeSlabId={activeSlabId}
      />
      {/* Intro light beam */}
      <spotLight
        position={[0, 12, 0]}
        angle={0.6}
        penumbra={0.6}
        intensity={2 * Math.max(0, Math.min(Math.max((introProgress - 0.35) / 0.25, 0), 1)) * (1 - Math.min(Math.max((introProgress - 0.85) / 0.15, 0), 1))}
        color={'#ffdca8'}
        castShadow={false}
      />
    </group>
  );
};

export default IsometricWorld;


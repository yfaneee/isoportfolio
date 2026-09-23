import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import type { SocialKind } from '../../data/InteractionZones';

// Interactive surfaces stay clear of snow and rain, so you can always see what can be used
// (see sky/worldMaterials.ts). Stable, so React doesn't hand over a new object each render.
const NO_WEATHER = { noWeather: true };

// ============================================================================
// SOCIAL BUTTON
// A rounded tile in the brand color with the logo extruded on top.
// Rotated 45° so the logo reads upright from the isometric camera.
// ============================================================================

// Icons are stacked layers of 24x24 paths (SVG coordinates, y down), each extruded to its own height.
// 'light' layers are white and turn amber when highlighted; 'dark' layers stay black (outlines).
interface IconLayer {
  path: string;
  tone: 'light' | 'dark';
  depth: number;
}

const ICON_LAYERS: Record<SocialKind, IconLayer[]> = {
  github: [
    { tone: 'light', depth: 0.04, path: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' }
  ],
  linkedin: [
    { tone: 'light', depth: 0.04, path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z' }
  ],
  email: [
    // White envelope body (inset so its sides sit under the outline, no z-fighting)
    { tone: 'light', depth: 0.04, path: 'M3 5h18v14H3z' },
    // Thin black frame (rounded outer edge, rectangular hole), raised above the body
    { tone: 'dark', depth: 0.06, path: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM3.2 5.2v13.6h17.6V5.2z' },
    // Thin black V flap
    { tone: 'dark', depth: 0.06, path: 'M3.2 5.2L12 11.6L20.8 5.2V6.8L12 13.2L3.2 6.8z' }
  ]
};

const TILE_COLORS: Record<SocialKind, string> = {
  github: '#24292F',
  linkedin: '#0A66C2',
  email: '#C62828'
};

const TILE_SIZE = 0.8;
const TILE_RADIUS = 0.16;
const TILE_HEIGHT = 0.12;
const ICON_SIZE = 0.5;
const HOVER_LIFT = 0.08;
const ACTIVE_COLOR = '#E8A200';

// Geometries are identical for every instance of a kind, so build them once
let tileGeometry: THREE.ExtrudeGeometry | null = null;
const iconGeometries: Partial<Record<SocialKind, THREE.ExtrudeGeometry[]>> = {};

function getTileGeometry(): THREE.ExtrudeGeometry {
  if (!tileGeometry) {
    const half = TILE_SIZE / 2;
    const r = TILE_RADIUS;
    const shape = new THREE.Shape();
    shape.moveTo(-half + r, -half);
    shape.lineTo(half - r, -half);
    shape.quadraticCurveTo(half, -half, half, -half + r);
    shape.lineTo(half, half - r);
    shape.quadraticCurveTo(half, half, half - r, half);
    shape.lineTo(-half + r, half);
    shape.quadraticCurveTo(-half, half, -half, half - r);
    shape.lineTo(-half, -half + r);
    shape.quadraticCurveTo(-half, -half, -half + r, -half);

    tileGeometry = new THREE.ExtrudeGeometry(shape, { depth: TILE_HEIGHT, bevelEnabled: false, curveSegments: 6 });
    tileGeometry.rotateX(-Math.PI / 2); // lie flat, extruded upwards from y=0
  }
  return tileGeometry;
}

function getIconGeometries(kind: SocialKind): THREE.ExtrudeGeometry[] {
  let geometries = iconGeometries[kind];
  if (!geometries) {
    geometries = ICON_LAYERS[kind].map(layer => {
      const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${layer.path}"/></svg>`);
      const shapes = svg.paths.flatMap(path => SVGLoader.createShapes(path));
      const geometry = new THREE.ExtrudeGeometry(shapes, { depth: layer.depth, bevelEnabled: false, curveSegments: 8 });
      // Center the 24x24 icon and scale it to world size (still in SVG orientation; the mesh transform lays it flat)
      geometry.translate(-12, -12, 0);
      geometry.scale(ICON_SIZE / 24, ICON_SIZE / 24, 1);
      return geometry;
    });
    iconGeometries[kind] = geometries;
  }
  return geometries;
}

interface SocialButtonProps {
  kind: SocialKind;
  slabId: string;
  position: [number, number, number]; // x, top of the surface it sits on, z
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  isActive?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  kind,
  slabId,
  position,
  onSlabHover,
  onSlabClick,
  introComplete,
  isActive = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const highlighted = isActive || (isHovered && introComplete);

  // Clear hover state when movement keys are pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (isHovered && ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered]);

  // Ease the lift in and out
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const targetY = position[1] + (highlighted ? HOVER_LIFT : 0);
    group.position.y += (targetY - group.position.y) * Math.min(1, delta * 12);
  });

  const handlePointerOver = (e: any) => {
    if (!introComplete) return;
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    onSlabHover?.(slabId, { x: e.clientX || window.innerWidth / 2, y: e.clientY || window.innerHeight / 2 });
  };

  const handlePointerOut = (e: any) => {
    if (!introComplete) return;
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'default';
    onSlabHover?.(null);
  };

  const handleClick = (e: any) => {
    if (!introComplete) return;
    e.stopPropagation();
    onSlabClick?.(slabId);
  };

  const tileColor = TILE_COLORS[kind];

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, Math.PI / 4, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerMove={handlePointerOver}
    >
      <mesh geometry={getTileGeometry()}>
        <meshStandardMaterial userData={NO_WEATHER}
          color={tileColor}
          emissive={tileColor}
          emissiveIntensity={highlighted ? 0.35 : 0}
        />
      </mesh>

      {/* Logo layers: rotated to lie flat on the tile, z mirrored so SVG "down" points toward the camera and the extrusion points up */}
      {getIconGeometries(kind).map((geometry, i) => {
        const isDark = ICON_LAYERS[kind][i].tone === 'dark';
        const lightColor = highlighted ? ACTIVE_COLOR : '#FFFFFF';
        return (
          <mesh
            key={i}
            geometry={geometry}
            position={[0, TILE_HEIGHT, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1, 1, -1]}
          >
            <meshStandardMaterial userData={NO_WEATHER}
              color={isDark ? '#111111' : lightColor}
              emissive={!isDark && highlighted ? ACTIVE_COLOR : '#000000'}
              emissiveIntensity={!isDark && highlighted ? 0.4 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default SocialButton;

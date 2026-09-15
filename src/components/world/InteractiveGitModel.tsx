import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// INTERACTIVE GIT MODEL
// ============================================================================
interface InteractiveGitModelProps {
  position: [number, number, number];
  slabId: string;
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  isActive?: boolean;
}

// Global movement key listener - shared by all InteractiveGitModel instances
let gitModelHoverClearCallbacks: (() => void)[] = [];
let gitModelKeyListenerAttached = false;

const setupGitModelKeyListener = () => {
  if (gitModelKeyListenerAttached) return;
  gitModelKeyListenerAttached = true;
  
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd' || 
        key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
      gitModelHoverClearCallbacks.forEach(cb => cb());
    }
  });
};

const InteractiveGitModel: React.FC<InteractiveGitModelProps> = ({
  position,
  slabId,
  onSlabHover,
  onSlabClick,
  introComplete,
  isActive = false
}) => {
  const { scene } = useGLTF('/models/git.glb');
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  // Register hover clear callback once on mount
  useEffect(() => {
    setupGitModelKeyListener();
    
    const clearHover = () => {
      setIsHovered(false);
      document.body.style.cursor = 'default';
    };
    
    gitModelHoverClearCallbacks.push(clearHover);
    return () => {
      gitModelHoverClearCallbacks = gitModelHoverClearCallbacks.filter(cb => cb !== clearHover);
    };
  }, []);

  const handlePointerOver = (e: any) => {
    if (!introComplete) return;
    
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    
    if (onSlabHover) {
      const screenX = (e.clientX || window.innerWidth / 2);
      const screenY = (e.clientY || window.innerHeight / 2);
      onSlabHover(slabId, { x: screenX, y: screenY });
    }
  };

  const handlePointerOut = (e: any) => {
    if (!introComplete) return;
    
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'default';
    
    if (onSlabHover) {
      onSlabHover(null);
    }
  };

  const handleClick = (e: any) => {
    if (!introComplete) return;
    
    e.stopPropagation();
    if (onSlabClick) {
      onSlabClick(slabId);
    }
  };

  // Clone the scene and its materials to avoid sharing
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    // Deep clone materials so each instance has its own
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(mat => mat.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
        }
      }
    });
    
    return cloned;
  }, [scene]);

  // Apply emissive effect when hovered or active
  useEffect(() => {
    if (!clonedScene) return;
    
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material: any) => {
            if (material.emissive !== undefined) {
              if (isHovered || isActive) {
                material.emissive = new THREE.Color('#E8A200');
                material.emissiveIntensity = 0.4;
              } else {
                material.emissive = new THREE.Color('#000000');
                material.emissiveIntensity = 0;
              }
            }
          });
        }
      }
    });
  }, [isHovered, isActive, clonedScene]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[0.3, 0.3, 0.3]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerMove={handlePointerOver}
    >
      <primitive object={clonedScene} />
    </group>
  );
};

export default InteractiveGitModel;

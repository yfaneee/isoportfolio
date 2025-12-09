import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface CharacterProps {
  position: [number, number, number];
  rotation: number;
  magicalRotationY?: number;
  isMoving: boolean;
  opacity?: number;
  scale?: number;
  modelPath: string;
  forceAnimationReset?: number;
}

const Character: React.FC<CharacterProps> = ({ 
  position, 
  rotation, 
  magicalRotationY = 0,
  isMoving, 
  opacity = 1,
  scale = 1,
  modelPath,
  forceAnimationReset = 0
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  
  const clonedSceneRef = useRef<THREE.Object3D>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const lastOpacityRef = useRef<number>(opacity);
  
  // Clone the scene to avoid sharing between instances 
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    const materials: THREE.Material[] = [];
    
    // Create a name-to-object mapping for animation tracks
    const objectMap = new Map<string, THREE.Object3D>();
    
    cloned.traverse((child) => {
      if (child.name) {
        objectMap.set(child.name, child);
      }
      
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // Clone material to avoid sharing and cache it
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => {
              const clonedMat = mat.clone();
              clonedMat.transparent = true;
              materials.push(clonedMat);
              return clonedMat;
            });
          } else {
            child.material = child.material.clone();
            child.material.transparent = true;
            materials.push(child.material);
          }
        }
      }
    });
    
    materialsRef.current = materials;
    (cloned as any).__animationObjectMap = objectMap;
    
    return cloned;
  }, [scene]); 

  const { actions, mixer } = useAnimations(animations, clonedScene);
  
  // Animation state
  const walkCycleRef = useRef(0);
  const idleTimeRef = useRef(0);
  const currentActionRef = useRef<string>('');
  const lastPositionRef = useRef<[number, number, number]>(position);

  // Detect teleportation 
  useEffect(() => {
    const [lastX, lastY, lastZ] = lastPositionRef.current;
    const [newX, newY, newZ] = position;
    
    const distance = Math.sqrt(
      Math.pow(newX - lastX, 2) + 
      Math.pow(newY - lastY, 2) + 
      Math.pow(newZ - lastZ, 2)
    );
    
    if (distance > 5 && mixer) {
      // Reset animation system
      mixer.stopAllAction();
      currentActionRef.current = '';
      
      // Force re-evaluation of animations
      setTimeout(() => {
        if (mixer) {
          mixer.update(0);
        }
      }, 50);
    }
    
    lastPositionRef.current = position;
  }, [position, mixer]);

  // Force animation reset when requested
  useEffect(() => {
    if (forceAnimationReset > 0 && mixer && actions) {
      // Complete animation system reset
      mixer.stopAllAction();
      mixer.uncacheRoot(mixer.getRoot());
      
      // Reset all actions
      Object.values(actions).forEach(action => {
        if (action) {
          action.stop();
          action.reset();
          action.enabled = false;
        }
      });
      
      currentActionRef.current = '';
      
      // Wait for a few frames then reinitialize
      setTimeout(() => {
        if (mixer && actions) {
          // Re-enable actions
          Object.values(actions).forEach(action => {
            if (action) {
              action.enabled = true;
              action.weight = 1;
              action.timeScale = 1;
            }
          });
          
          mixer.update(0);
          
          // Force re-evaluation of current animation state
          const currentlyMoving = isMoving;
          const availableActions = Object.keys(actions);
          const walkAction = availableActions.find(name => 
            name.toLowerCase().includes('walk')
          ) || '';
          const idleAction = availableActions.find(name => 
            name.toLowerCase().includes('static')
          ) || availableActions[0] || '';
          
          const targetAction = currentlyMoving ? walkAction : idleAction;
          
          if (targetAction && actions[targetAction]) {
            const action = actions[targetAction];
            if (action) {
              action.reset();
              action.setLoop(THREE.LoopRepeat, Infinity);
              action.play();
              currentActionRef.current = targetAction;
              mixer.update(0);
            }
          }
        }
      }, 100);
    }
  }, [forceAnimationReset, mixer, actions, isMoving]);

  useEffect(() => {
    clonedSceneRef.current = clonedScene;
  }, [clonedScene]);

  // Optimized: Update material opacity only when it actually changes
  useEffect(() => {
    if (Math.abs(opacity - lastOpacityRef.current) < 0.01) {
      return;
    }
    
    lastOpacityRef.current = opacity;
    
    // Use cached materials instead of traversing the entire scene
    materialsRef.current.forEach(mat => {
      mat.opacity = opacity;
      mat.needsUpdate = true;
    });
  }, [opacity]);

  // Optimized animation handling with memoized action names
  const animationNames = useMemo(() => {
    if (!actions) return { walkAction: '', idleAction: '' };
    
    const availableActions = Object.keys(actions);
    
    const walkAction = availableActions.find(name => 
      name.toLowerCase().includes('walk') || 
      name.toLowerCase().includes('run') ||
      name.toLowerCase().includes('move') ||
      name.toLowerCase().includes('walking')
    ) || '';

    const idleAction = availableActions.find(name => 
      name.toLowerCase().includes('static')
    ) || availableActions.find(name => 
      name.toLowerCase().includes('idle') || 
      name.toLowerCase().includes('stand') ||
      name.toLowerCase().includes('default') ||
      name.toLowerCase().includes('rest')
    ) || availableActions[0] || '';
    
    return { walkAction, idleAction };
  }, [actions]);

  // Handle animations
  useEffect(() => {
    if (!actions || !mixer) return;

    const { walkAction, idleAction } = animationNames;
    const targetAction = isMoving ? walkAction : idleAction;
    
    // Only update if animation needs to change
    if (targetAction && targetAction !== currentActionRef.current) {
      // Stop current animation only if running
      const currentAction = currentActionRef.current ? actions[currentActionRef.current] : null;
      if (currentAction && currentAction.isRunning()) {
        currentAction.stop();
      }
      
      // Start new animation with optimized setup
      const newAction = actions[targetAction];
      if (newAction) {
        newAction.reset();
        newAction.setLoop(THREE.LoopRepeat, Infinity);
        newAction.clampWhenFinished = false;
        newAction.enabled = true;
        newAction.weight = 1;
        newAction.timeScale = 1;
        newAction.play();
        currentActionRef.current = targetAction;
      }
    }

    return () => {
      // Cleanup only current action
      if (currentActionRef.current && actions[currentActionRef.current]) {
        actions[currentActionRef.current]?.stop();
      }
    };
  }, [actions, isMoving, mixer, animationNames]);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Dispose of cloned materials
      materialsRef.current.forEach(mat => {
        mat.dispose();
      });
      materialsRef.current = [];
      
      // Dispose of mixer if it exists
      if (mixer) {
        mixer.stopAllAction();
      }
      
      // Dispose of geometries in cloned scene
      if (clonedSceneRef.current) {
        clonedSceneRef.current.traverse((child: any) => {
          if (child.geometry) {
            child.geometry.dispose();
          }
          // Dispose materials too (in case we missed any)
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: THREE.Material) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [mixer]);

  // Optimized animation frame updates
  useFrame((state, delta) => {
    // Early return if no updates needed
    if (!groupRef.current && !mixer) return;
    
    // Update position and rotation
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      // If magicalRotationY is set use it as override
      groupRef.current.rotation.y = magicalRotationY !== 0 ? magicalRotationY : rotation;
      
      const isMagicalTransition = scale !== 1;
      
      if (isMagicalTransition) {
        groupRef.current.scale.set(scale, scale, scale);
      } else {
        groupRef.current.scale.set(1, 1, 1);
      }
    }
    
    // Update animation mixer only if it exists and has an action
    if (mixer && currentActionRef.current) {
      mixer.update(delta);
    }

    // Fallback animation if no animations are available
    if (!animations.length && groupRef.current) {
      if (isMoving) {
        walkCycleRef.current += delta * 8;
        groupRef.current.position.y = position[1] + Math.sin(walkCycleRef.current * 2) * 0.02;
      } else {
        idleTimeRef.current += delta;
        // Only apply idle scale animation when not in magical transition
        if (scale === 1 && groupRef.current.scale) {
          groupRef.current.scale.y = 1 + Math.sin(idleTimeRef.current * 2) * 0.01;
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive 
        ref={clonedSceneRef}
        object={clonedScene} 
        scale={[0.35, 0.35, 0.35]} 
        position={[0, 0, 0]}
      />
    </group>
  );
};

// Preload all character models
export const preloadCharacterModels = () => {
  const models = [
    '/models/character-d.glb',
    '/models/character-h.glb',
    '/models/character-l.glb',
    '/models/character-r.glb'
  ];
  
  models.forEach(modelPath => {
    useGLTF.preload(modelPath);
  });
};

export default Character;
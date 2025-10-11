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
  
  // Clone the scene to avoid sharing between instances
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    // Create a name-to-object mapping for animation tracks
    const objectMap = new Map<string, THREE.Object3D>();
    
    cloned.traverse((child) => {
      if (child.name) {
        objectMap.set(child.name, child);
      }
      
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // Clone material to avoid sharing
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => {
              const clonedMat = mat.clone();
              clonedMat.transparent = true;
              return clonedMat;
            });
          } else {
            child.material = child.material.clone();
            child.material.transparent = true;
          }
        }
      }
    });
    
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
  }, [forceAnimationReset, mixer, actions]);

  useEffect(() => {
    clonedSceneRef.current = clonedScene;
  }, [clonedScene]);

  // Update material opacity when it changes
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.opacity = opacity;
              mat.needsUpdate = true;
            });
          } else {
            child.material.opacity = opacity;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [opacity, clonedScene]);

  // Handle animations
  useEffect(() => {
    if (!actions || !mixer) return;

    // Find available animations
    const availableActions = Object.keys(actions);
    
    let walkAction = '';
    let idleAction = '';

    // Try to find walk/run animation
    walkAction = availableActions.find(name => 
      name.toLowerCase().includes('walk') || 
      name.toLowerCase().includes('run') ||
      name.toLowerCase().includes('move') ||
      name.toLowerCase().includes('walking')
    ) || '';

    // Try to find idle animation 
    idleAction = availableActions.find(name => 
      name.toLowerCase().includes('static')
    ) || availableActions.find(name => 
      name.toLowerCase().includes('idle') || 
      name.toLowerCase().includes('stand') ||
      name.toLowerCase().includes('default') ||
      name.toLowerCase().includes('rest')
    ) || '';

    if (!idleAction && availableActions.length > 0) {
      idleAction = availableActions[0];
    }

    // Play appropriate animation
    const targetAction = isMoving ? walkAction : idleAction;
    
    if (targetAction && targetAction !== currentActionRef.current) {
      // Stop all current animations
      Object.values(actions).forEach(action => {
        if (action && action.isRunning()) {
          action.stop();
        }
      });
      
      // Reset mixer to clear any corrupted state
      mixer.stopAllAction();
      mixer.update(0);
      
      // Start new animation with proper setup
      if (actions[targetAction]) {
        const action = actions[targetAction];
        if (action) {
          action.reset();
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.clampWhenFinished = false;
          action.enabled = true;
          action.weight = 1;
          action.timeScale = 1;
          action.play();
          currentActionRef.current = targetAction;
          
          mixer.update(0);
        }
      } else if (targetAction && actions[targetAction]) {
        // Try to force start again
        const action = actions[targetAction] as THREE.AnimationAction;
        if (action) {
          action.play();
          mixer.update(0);
        }
      }
    }

    // Special handling for idle state 
    if (!isMoving && !idleAction) {
      Object.values(actions).forEach(action => {
        if (action && action.isRunning()) {
          action.stop();
        }
      });
      mixer.stopAllAction();
      currentActionRef.current = '';
    }

    return () => {
      // Cleanup animations
      Object.values(actions).forEach(action => action?.stop());
    };
  }, [actions, isMoving, mixer, animations]);

  // Animation frame updates
  useFrame((state, delta) => {
    // Update position and rotation
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.y = rotation + magicalRotationY;
      
      const isMagicalTransition = scale !== 1;
      
      if (isMagicalTransition) {
        groupRef.current.scale.set(scale, scale, scale);
      } else {
        groupRef.current.scale.set(1, 1, 1);
      }
    }
    
    // Update animation mixer
    if (mixer) {
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
        if (scale === 1) {
          if (groupRef.current.scale) {
            groupRef.current.scale.y = 1 + Math.sin(idleTimeRef.current * 2) * 0.01;
          }
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
    '/models/character-a.glb',
    '/models/character-b.glb',
    '/models/character-c.glb',
    '/models/character-e.glb',
    '/models/character-i.glb',
    '/models/character-j.glb',
    '/models/character-k.glb',
    '/models/character-r.glb'
  ];
  
  models.forEach(modelPath => {
    useGLTF.preload(modelPath);
  });
};

export default Character;
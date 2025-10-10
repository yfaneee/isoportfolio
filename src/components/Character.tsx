import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface CharacterProps {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  opacity?: number;
  modelPath: string;
}

const Character: React.FC<CharacterProps> = ({ 
  position, 
  rotation, 
  isMoving, 
  opacity = 1,
  modelPath 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  
  const clonedSceneRef = useRef<THREE.Object3D>(null);
  const { actions, mixer } = useAnimations(animations, clonedSceneRef);
  
  // Animation state
  const walkCycleRef = useRef(0);
  const idleTimeRef = useRef(0);
  const currentActionRef = useRef<string>('');

  // Clone the scene to avoid sharing between instances
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // Clone material to avoid sharing
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => {
              const clonedMat = mat.clone();
              clonedMat.transparent = true;
              clonedMat.opacity = opacity;
              return clonedMat;
            });
          } else {
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = opacity;
          }
        }
      }
    });
    
    
    return cloned;
  }, [scene, opacity, modelPath]);

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
    if (!actions) return;

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
      Object.values(actions).forEach(action => {
        if (action && action.isRunning()) {
          action.stop();
        }
      });
      
      // Start new animation
      if (actions[targetAction]) {
        const action = actions[targetAction];
        if (action) {
          action.reset();
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
          currentActionRef.current = targetAction;
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
      currentActionRef.current = '';
    }

    return () => {
      // Cleanup animations
      Object.values(actions).forEach(action => action?.stop());
    };
  }, [actions, isMoving]);

  // Animation frame updates
  useFrame((state, delta) => {
    // Update position and rotation
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.y = rotation;
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
        if (groupRef.current.scale) {
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
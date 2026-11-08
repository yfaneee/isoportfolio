import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { WALK_SPEED } from '../hooks/useCharacterControls';

interface CharacterProps {
  // Live movement state from the character controller, read every frame (no React re-renders)
  positionRef: React.MutableRefObject<[number, number, number]>;
  rotationRef: React.MutableRefObject<number>;
  isMovingRef: React.MutableRefObject<boolean>;
  speedRef: React.MutableRefObject<number>;
  positionOffset?: [number, number, number];
  magicalRotationY?: number;
  opacity?: number;
  scale?: number;
  modelPath: string;
}

// drei's useAnimations advances the mixer once per frame. The clips have always played at
// twice their authored speed here, so that look is kept as the base playback rate.
const BASE_ANIMATION_SPEED = 2;
// Walk <-> idle blend rate (1/s); about a quarter second to fully switch
const BLEND_RATE = 12;
// How fast the character turns to face its movement direction (1/s)
const TURN_RATE = 15;
// The walk cycle speeds up and slows down with the actual movement speed, within these limits
const MIN_WALK_PLAYBACK = 0.6;
const MAX_WALK_PLAYBACK = 1.5;
// A jump bigger than this between frames is a teleport: snap instead of blending
const TELEPORT_DISTANCE_SQ = 5 * 5;

const TWO_PI = Math.PI * 2;
const wrapAngle = (angle: number) => {
  let a = (angle + Math.PI) % TWO_PI;
  if (a < 0) a += TWO_PI;
  return a - Math.PI;
};
const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

const findAnimationNames = (names: string[]) => {
  const walkAction = names.find(name => {
    const n = name.toLowerCase();
    return n.includes('walk') || n.includes('run') || n.includes('move');
  }) || '';

  const idleAction = names.find(name => name.toLowerCase().includes('static'))
    || names.find(name => {
      const n = name.toLowerCase();
      return n.includes('idle') || n.includes('stand') || n.includes('default') || n.includes('rest');
    })
    || names[0]
    || '';

  return { walkAction, idleAction };
};

const Character: React.FC<CharacterProps> = ({
  positionRef,
  rotationRef,
  isMovingRef,
  speedRef,
  positionOffset = [0, 0, 0],
  magicalRotationY = 0,
  opacity = 1,
  scale = 1,
  modelPath,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);

  // Clone the scene so each character gets its own materials (for fading) without touching the cached model
  const { clonedScene, materials, baseOpacities } = useMemo(() => {
    const cloned = scene.clone();
    const mats: THREE.Material[] = [];

    const prepare = (mat: THREE.Material) => {
      const clonedMat = mat.clone();
      clonedMat.transparent = true;
      clonedMat.side = THREE.FrontSide;
      clonedMat.depthWrite = true;
      clonedMat.depthTest = true;
      mats.push(clonedMat);
      return clonedMat;
    };

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.computeVertexNormals();
        }
        if (child.material) {
          child.material = Array.isArray(child.material)
            ? child.material.map(prepare)
            : prepare(child.material);
        }
        child.frustumCulled = true;
      }
    });

    return { clonedScene: cloned, materials: mats, baseOpacities: mats.map(m => m.opacity) };
  }, [scene]);

  // Free this clone's materials when the model changes or the character unmounts.
  // Geometry is shared with the cached model, so it is left alone.
  useEffect(() => () => materials.forEach(mat => mat.dispose()), [materials]);

  // Fading only changes a uniform, so no shader recompile (needsUpdate) is needed
  useEffect(() => {
    materials.forEach((mat, i) => {
      mat.opacity = baseOpacities[i] * opacity;
    });
  }, [opacity, materials, baseOpacities]);

  const { actions, names } = useAnimations(animations, clonedScene);
  const { walkAction, idleAction } = useMemo(() => findAnimationNames(names), [names]);

  const walkWeightRef = useRef(0);
  const facingRef = useRef(rotationRef.current);
  const lastPositionRef = useRef<[number, number, number] | null>(null);
  const fallbackTimeRef = useRef(0);

  // Both clips loop the whole time; every frame only their weights are blended
  useEffect(() => {
    const walk = walkAction ? actions[walkAction] : null;
    const idle = idleAction ? actions[idleAction] : null;
    const clips = walk === idle ? [walk] : [walk, idle];

    walkWeightRef.current = isMovingRef.current ? 1 : 0;
    clips.forEach(action => {
      if (!action) return;
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.timeScale = BASE_ANIMATION_SPEED;
      action.play();
    });

    if (walk && idle && walk !== idle) {
      walk.setEffectiveWeight(walkWeightRef.current);
      idle.setEffectiveWeight(1 - walkWeightRef.current);
    } else {
      (walk || idle)?.setEffectiveWeight(1);
    }

    return () => {
      clips.forEach(action => action?.stop());
    };
  }, [actions, walkAction, idleAction, isMovingRef]);

  // Runs after the controller has moved (priority -2) and before the camera follows (0)
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const position = positionRef.current;
    const last = lastPositionRef.current;
    const teleported = !last || (
      (position[0] - last[0]) ** 2 + (position[1] - last[1]) ** 2 + (position[2] - last[2]) ** 2 > TELEPORT_DISTANCE_SQ
    );
    // The controller replaces the array whenever it moves, so keeping the reference is safe
    lastPositionRef.current = position;

    group.position.set(
      position[0] + positionOffset[0],
      position[1] + positionOffset[1],
      position[2] + positionOffset[2]
    );

    // Facing: an override (menu pose, slab-navigation spin) wins; otherwise turn smoothly
    if (magicalRotationY !== 0) {
      facingRef.current = magicalRotationY;
    } else if (teleported) {
      facingRef.current = rotationRef.current;
    } else {
      const turn = wrapAngle(rotationRef.current - facingRef.current);
      facingRef.current = wrapAngle(facingRef.current + turn * damp(TURN_RATE, delta));
    }
    group.rotation.y = facingRef.current;
    group.scale.setScalar(scale);

    const moving = isMovingRef.current;

    // Blend between idle and walk
    const walk = walkAction ? actions[walkAction] : null;
    const idle = idleAction ? actions[idleAction] : null;
    if (walk && idle && walk !== idle) {
      const target = moving ? 1 : 0;
      let weight = walkWeightRef.current;

      // Start every walk from the beginning of the stride
      if (moving && weight < 0.05) walk.time = 0;

      weight = teleported ? target : weight + (target - weight) * damp(BLEND_RATE, delta);
      if (Math.abs(target - weight) < 0.001) weight = target;
      walkWeightRef.current = weight;

      walk.setEffectiveWeight(weight);
      idle.setEffectiveWeight(1 - weight);
    }

    // Match the stride to the actual speed (slower while speeding up, faster when running)
    if (walk && moving) {
      const pace = Math.min(MAX_WALK_PLAYBACK, Math.max(MIN_WALK_PLAYBACK, speedRef.current / WALK_SPEED));
      walk.timeScale = BASE_ANIMATION_SPEED * pace;
    }

    // Fallback animation if the model has no clips
    if (!animations.length) {
      if (moving) {
        fallbackTimeRef.current += delta * 8;
        group.position.y += Math.sin(fallbackTimeRef.current * 2) * 0.02;
      } else if (scale === 1) {
        fallbackTimeRef.current += delta;
        group.scale.y = 1 + Math.sin(fallbackTimeRef.current * 2) * 0.01;
      }
    }
  }, -1);

  return (
    <group ref={groupRef}>
      <primitive
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

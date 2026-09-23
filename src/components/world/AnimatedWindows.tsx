import React, { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================================
// ANIMATED WINDOWS (INSTANCED)
// All windows of a building share one geometry/material and render in a single
// draw call. Brightness is a per-instance attribute that scales the emissive term.
// ============================================================================
export type WindowPlacement = { pos: [number, number, number]; rotation: [number, number, number] };

const AnimatedWindows: React.FC<{
  windows: WindowPlacement[];
  width: number;
  height: number;
}> = ({ windows, width, height }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#2a1a0a',
      emissive: '#E8A200',
      emissiveIntensity: 1
    });
    mat.userData.nightWindows = true; // brighter at night (see sky/worldMaterials.ts)
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float windowBrightness;\nvarying float vWindowBrightness;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vWindowBrightness = windowBrightness;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vWindowBrightness;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance *= vWindowBrightness;');
    };
    return mat;
  }, []);

  // Per-window flicker state (same behaviour as the old per-material animation)
  const states = useMemo(() => windows.map(() => {
    const isOn = Math.random() > 0.5;
    return {
      brightness: isOn ? 0.7 + Math.random() * 0.3 : 0.05 + Math.random() * 0.1,
      targetBrightness: isOn ? 0.7 + Math.random() * 0.3 : 0.05 + Math.random() * 0.1,
      timer: Math.random() * 10
    };
  }), [windows]);

  const brightnessAttribute = useMemo(() => {
    const attr = new THREE.InstancedBufferAttribute(new Float32Array(windows.length), 1);
    attr.setUsage(THREE.DynamicDrawUsage);
    states.forEach((state, i) => { attr.setX(i, state.brightness * 3); });
    return attr;
  }, [windows.length, states]);

  // Layout effects so matrices/brightness are in place before the first frame renders
  useLayoutEffect(() => {
    geometry.setAttribute('windowBrightness', brightnessAttribute);
  }, [geometry, brightnessAttribute]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const temp = new THREE.Object3D();
    windows.forEach((w, i) => {
      temp.position.set(w.pos[0], w.pos[1], w.pos[2]);
      temp.rotation.set(w.rotation[0], w.rotation[1], w.rotation[2]);
      temp.updateMatrix();
      mesh.setMatrixAt(i, temp.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [windows]);

  useEffect(() => () => {
    geometry.dispose();
  }, [geometry]);

  useEffect(() => () => {
    material.dispose();
  }, [material]);

  useFrame((_, delta) => {
    let changed = false;
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      state.timer -= delta;

      if (state.timer <= 0) {
        state.timer = 1.5 + Math.random() * 8;
        // 60% chance to toggle state
        if (Math.random() < 0.6) {
          const isCurrentlyOn = state.targetBrightness > 0.5;
          state.targetBrightness = isCurrentlyOn ? 0.05 + Math.random() * 0.1 : 0.7 + Math.random() * 0.3;
        }
      }

      state.brightness += (state.targetBrightness - state.brightness) * Math.min(1, delta * 3);

      const newIntensity = state.brightness * 3;
      if (Math.abs(brightnessAttribute.getX(i) - newIntensity) > 0.02) {
        brightnessAttribute.setX(i, newIntensity);
        changed = true;
      }
    }
    if (changed) brightnessAttribute.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, windows.length]} />;
};

export default AnimatedWindows;

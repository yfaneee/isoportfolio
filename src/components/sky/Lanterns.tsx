import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LANTERNS } from '../../data/Lanterns';
import { dayNight } from '../../utils/dayNight';
import { NightLight, registerNightLights } from './worldMaterials';
import { createShaftGeometry, createShaftMaterial } from './lightShaft';
import { createHalos, createHaloMaterial } from './lightHalo';

// ============================================================================
// LANTERNS
// At dusk the lanterns drift down out of the sky, one after another, and settle
// over the platforms; at dawn they rise away again. Each one is a bright core, a
// soft halo, a faint shaft of light below it, and a night light that lights the
// blocks around it. Cores, halos and shafts are one draw call each.
// ============================================================================

const COUNT = LANTERNS.length;

const DROP_HEIGHT = 6;       // how far above its spot a lantern starts its descent
const STAGGER = 0.55;        // spread of start times, as a fraction of the dusk transition
const DESCENT = 0.45;        // how long one descent takes, same units
const HALO_SIZE = 1.7;
const LIGHT_INTENSITY = 15;
const LIGHT_RANGE = 3.7;

const LIGHT_COLOR = new THREE.Color('#FFB066');
const CORE_COLOR = new THREE.Color('#FFE2B8');

// Stable pseudo-random numbers per lantern, so the stagger is the same every night
const seeded = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

const Lanterns: React.FC = () => {
  const coresRef = useRef<THREE.InstancedMesh>(null);
  const shaftsRef = useRef<THREE.InstancedMesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const lanterns = useMemo(() => LANTERNS.map((placement, i) => ({
    placement,
    delay: seeded(i) * STAGGER,
    phase: seeded(i + 13) * Math.PI * 2,
    flicker: seeded(i + 29) * Math.PI * 2,
    position: new THREE.Vector3(),
    glow: 0,       // how bright the lantern itself is
    settled: 0     // 1 once it has reached its spot
  })), []);

  // ---- Cores ----
  const coreGeometry = useMemo(() => new THREE.SphereGeometry(0.1, 16, 12), []);
  const coreMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), []);

  // ---- Halos ----
  const halos = useMemo(() => createHalos(COUNT), []);
  const { geometry: haloGeometry, centers: haloCenters, glows: haloGlows } = halos;
  const haloMaterial = useMemo(() => createHaloMaterial([1.0, 0.74, 0.42], HALO_SIZE), []);

  // ---- Light shafts: open cones hanging under each lantern ----
  const shaftGlows = useMemo(() => new THREE.InstancedBufferAttribute(new Float32Array(COUNT), 1), []);
  const shaftGeometry = useMemo(() => createShaftGeometry(shaftGlows), [shaftGlows]);
  const shaftMaterial = useMemo(() => createShaftMaterial([1.0, 0.72, 0.4], 0.42), []);

  // One night light per lantern, updated in place every frame
  const lights = useMemo<NightLight[]>(() => LANTERNS.map(() => ({
    position: new THREE.Vector3(),
    color: LIGHT_COLOR.clone(),
    intensity: 0,
    range: LIGHT_RANGE
  })), []);
  useEffect(() => registerNightLights(lights), [lights]);

  useEffect(() => () => {
    coreGeometry.dispose();
    coreMaterial.dispose();
    haloGeometry.dispose();
    haloMaterial.dispose();
    shaftGeometry.dispose();
    shaftMaterial.dispose();
  }, [coreGeometry, coreMaterial, haloGeometry, haloMaterial, shaftGeometry, shaftMaterial]);

  // Scratch objects, reused every frame
  const scratch = useMemo(() => ({
    matrix: new THREE.Matrix4(),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3(),
    color: new THREE.Color()
  }), []);

  // Priority -1: after the clock moves, before the night lights are committed (DayNightSystem)
  useFrame((state) => {
    const cores = coresRef.current;
    const shafts = shaftsRef.current;
    const halo = haloRef.current;
    if (!cores || !shafts || !halo) return;

    const level = dayNight.lanterns;
    const visible = level > 0.001;
    cores.visible = visible;
    shafts.visible = visible;
    halo.visible = visible;

    if (!visible) {
      for (const light of lights) light.intensity = 0;
      return;
    }

    const time = state.clock.elapsedTime;
    const { matrix, quaternion, scale, color } = scratch;

    for (let i = 0; i < COUNT; i++) {
      const lantern = lanterns[i];
      const { placement } = lantern;

      // This lantern's own progress through the descent, 0 (up in the sky) .. 1 (in place)
      const local = Math.min(Math.max((level - lantern.delay) / DESCENT, 0), 1);
      const eased = 1 - Math.pow(1 - local, 3);
      const flicker = 1 + 0.05 * Math.sin(time * 7.3 + lantern.flicker) + 0.03 * Math.sin(time * 17.1 + lantern.phase);

      lantern.glow = smoothstep(0, 0.2, local) * flicker;
      lantern.settled = smoothstep(0.75, 1, local);
      lantern.position.set(
        placement.x + Math.sin(time * 0.7 + lantern.phase) * 0.03 * local,
        placement.y + (1 - eased) * DROP_HEIGHT + Math.sin(time * 1.1 + lantern.phase) * 0.05 * local,
        placement.z + Math.cos(time * 0.6 + lantern.phase) * 0.03 * local
      );

      // Core: shrinks to nothing while it is still out of sight
      const coreScale = lantern.glow > 0.001 ? 1 : 0;
      scale.setScalar(coreScale);
      matrix.compose(lantern.position, quaternion.identity(), scale);
      cores.setMatrixAt(i, matrix);
      color.copy(CORE_COLOR).multiplyScalar(0.6 + 1.2 * lantern.glow);
      cores.setColorAt(i, color);

      // Halo
      haloCenters.setXYZ(i, lantern.position.x, lantern.position.y, lantern.position.z);
      haloGlows.setX(i, lantern.glow);

      // Shaft: only once the lantern has arrived, so a falling light does not drag a cone behind it
      const shaftRadius = 0.55 + placement.drop * 0.25;
      scale.set(shaftRadius, placement.drop, shaftRadius);
      matrix.compose(lantern.position, quaternion.identity(), scale);
      shafts.setMatrixAt(i, matrix);
      shaftGlows.setX(i, lantern.glow * lantern.settled);

      lights[i].position.copy(lantern.position);
      lights[i].intensity = LIGHT_INTENSITY * lantern.glow;
    }

    cores.instanceMatrix.needsUpdate = true;
    if (cores.instanceColor) cores.instanceColor.needsUpdate = true;
    shafts.instanceMatrix.needsUpdate = true;
    haloCenters.needsUpdate = true;
    haloGlows.needsUpdate = true;
    shaftGlows.needsUpdate = true;
  }, -1);

  return (
    <>
      <instancedMesh
        ref={coresRef}
        args={[coreGeometry, coreMaterial, COUNT]}
        frustumCulled={false}
        onUpdate={(mesh) => {
          // Allocate per-instance colours up front
          if (!mesh.instanceColor) mesh.setColorAt(0, CORE_COLOR);
        }}
      />
      <instancedMesh ref={shaftsRef} args={[shaftGeometry, shaftMaterial, COUNT]} frustumCulled={false} />
      <mesh ref={haloRef} geometry={haloGeometry} material={haloMaterial} frustumCulled={false} />
    </>
  );
};

export default Lanterns;

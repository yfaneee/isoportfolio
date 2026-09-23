import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BILLBOARDS, BILLBOARD_ROTATION, getBillboardPosition } from '../../data/InteractionZones';
import { BILLBOARD_FRAME_OFFSET, BILLBOARD_HEIGHT, BILLBOARD_WIDTH } from '../InteractiveBillboard';
import { dayNight } from '../../utils/dayNight';
import { NightLight, registerNightLights } from './worldMaterials';
import { createShaftGeometry, createShaftMaterial } from './lightShaft';
import { createHalos, createHaloMaterial } from './lightHalo';

// ============================================================================
// BILLBOARD LAMPS
// Floodlights along the top of every billboard, the way roadside billboards are
// lit: an arm reaching forward from the frame, a lamp head angled back down at the
// screen. By day they are just hardware. At dusk each billboard's lamps strike up
// with a short flicker, and their light washes down the screen, brightest at the
// top. The lens faces the screen, away from the camera, so what the camera sees
// of a lit lamp is the glow round its head. Arms, heads, lenses, glows and beams
// are one draw call each for all billboards.
// ============================================================================

// Positions in the billboard frame's own space: x across the face, y up, z out of the screen
const TOP = BILLBOARD_HEIGHT / 2;
const LAMP_XS = [-BILLBOARD_WIDTH * 0.32, 0, BILLBOARD_WIDTH * 0.32];
const ARM_BASE = new THREE.Vector3(0, TOP, 0);
const LAMP_HEAD = new THREE.Vector3(0, TOP + 0.33, 0.85);
const AIM_AT = new THREE.Vector3(0, -0.25, 0.23); // a little below the middle of the screen

const HEAD_SIZE: [number, number, number] = [0.38, 0.1, 0.2];
const ARM_THICKNESS = 0.05;
const BEAM_RADIUS = 0.95;

const LIGHT_INTENSITY = 10;
const LIGHT_RANGE = 3.4;
const LIGHT_COLOR = new THREE.Color('#FFEBD0');
const LENS_OFF = new THREE.Color('#1a1620');
const LENS_ON = new THREE.Color(1.6, 1.5, 1.3);

const LAMP_COUNT = BILLBOARDS.length * LAMP_XS.length;

const seeded = (n: number) => {
  const x = Math.sin(n * 91.7 + 47.3) * 43758.5453;
  return x - Math.floor(x);
};

// Every lamp's world transforms, worked out once from where the billboards stand
const buildLamps = () => {
  const frameQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...BILLBOARD_ROTATION));
  const aim = new THREE.Vector3().subVectors(AIM_AT, LAMP_HEAD);
  const beamLength = aim.length();
  aim.normalize();
  const arm = new THREE.Vector3().subVectors(LAMP_HEAD, ARM_BASE);
  const armLength = arm.length();
  arm.normalize();

  // Everything tilts about the frame's x axis only, so the lamps stay square to the board
  const headTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.atan2(-aim.z, -aim.y));
  const armTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.atan2(-arm.y, arm.z));
  const lensFlip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

  const headQuaternion = frameQuaternion.clone().multiply(headTilt);
  const armQuaternion = frameQuaternion.clone().multiply(armTilt);
  const lensQuaternion = headQuaternion.clone().multiply(lensFlip);

  const lamps: {
    billboard: number;
    arm: THREE.Matrix4;
    head: THREE.Matrix4;
    lens: THREE.Matrix4;
    beam: THREE.Matrix4;
    lightPosition: THREE.Vector3;
    glowPosition: THREE.Vector3;
  }[] = [];

  BILLBOARDS.forEach((billboard, billboardIndex) => {
    const base = getBillboardPosition(billboard.row);
    const frameCenter = new THREE.Vector3(
      base[0] + BILLBOARD_FRAME_OFFSET[0],
      base[1] + BILLBOARD_FRAME_OFFSET[1],
      base[2] + BILLBOARD_FRAME_OFFSET[2]
    );
    const toWorld = (local: THREE.Vector3) => local.clone().applyQuaternion(frameQuaternion).add(frameCenter);

    LAMP_XS.forEach(x => {
      const head = toWorld(LAMP_HEAD.clone().setX(x));
      const armMiddle = toWorld(ARM_BASE.clone().setX(x).lerp(LAMP_HEAD.clone().setX(x), 0.5));
      const worldAim = aim.clone().applyQuaternion(frameQuaternion);
      const lensPosition = head.clone().addScaledVector(new THREE.Vector3(0, -1, 0).applyQuaternion(headQuaternion), HEAD_SIZE[1] / 2 + 0.002);

      lamps.push({
        billboard: billboardIndex,
        arm: new THREE.Matrix4().compose(armMiddle, armQuaternion, new THREE.Vector3(ARM_THICKNESS, ARM_THICKNESS, armLength)),
        head: new THREE.Matrix4().compose(head, headQuaternion, new THREE.Vector3(1, 1, 1)),
        lens: new THREE.Matrix4().compose(lensPosition, lensQuaternion, new THREE.Vector3(1, 1, 1)),
        beam: new THREE.Matrix4().compose(lensPosition, headQuaternion, new THREE.Vector3(BEAM_RADIUS, beamLength, BEAM_RADIUS)),
        // Just under the lens, so the lamp head itself is not caught in its own light
        lightPosition: lensPosition.clone().addScaledVector(worldAim, 0.15),
        glowPosition: lensPosition.clone()
      });
    });
  });

  return lamps;
};

const BillboardLamps: React.FC = () => {
  const armsRef = useRef<THREE.InstancedMesh>(null);
  const headsRef = useRef<THREE.InstancedMesh>(null);
  const lensesRef = useRef<THREE.InstancedMesh>(null);
  const beamsRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const lamps = useMemo(buildLamps, []);

  // Each billboard switches on at its own moment, and each lamp strikes on its own
  const billboardDelays = useMemo(() => BILLBOARDS.map((_, i) => 0.2 + seeded(i) * 0.45), []);
  const lampSeeds = useMemo(() => lamps.map((_, i) => seeded(i + 101) * 100), [lamps]);

  const armGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const headGeometry = useMemo(() => new THREE.BoxGeometry(...HEAD_SIZE), []);
  const lensGeometry = useMemo(() => new THREE.PlaneGeometry(HEAD_SIZE[0] - 0.04, HEAD_SIZE[2] - 0.04), []);
  const hardwareMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2A2130', metalness: 0.3, roughness: 0.6 }), []);
  const lensMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), []);

  const halos = useMemo(() => createHalos(LAMP_COUNT), []);
  const haloMaterial = useMemo(() => createHaloMaterial([1.0, 0.95, 0.85], 0.8), []);

  const beamGlows = useMemo(() => new THREE.InstancedBufferAttribute(new Float32Array(LAMP_COUNT), 1), []);
  const beamGeometry = useMemo(() => createShaftGeometry(beamGlows), [beamGlows]);
  const beamMaterial = useMemo(() => createShaftMaterial([1.0, 0.94, 0.84], 0.3), []);

  const lights = useMemo<NightLight[]>(() => lamps.map(lamp => ({
    position: lamp.lightPosition.clone(),
    color: LIGHT_COLOR.clone(),
    intensity: 0,
    range: LIGHT_RANGE
  })), [lamps]);
  useEffect(() => registerNightLights(lights), [lights]);

  useEffect(() => () => {
    armGeometry.dispose();
    headGeometry.dispose();
    lensGeometry.dispose();
    hardwareMaterial.dispose();
    lensMaterial.dispose();
    beamGeometry.dispose();
    beamMaterial.dispose();
    halos.geometry.dispose();
    haloMaterial.dispose();
  }, [armGeometry, headGeometry, lensGeometry, hardwareMaterial, lensMaterial, beamGeometry, beamMaterial, halos, haloMaterial]);

  // The hardware never moves: place it once
  useLayoutEffect(() => {
    const arms = armsRef.current;
    const heads = headsRef.current;
    const lenses = lensesRef.current;
    const beams = beamsRef.current;
    if (!arms || !heads || !lenses || !beams) return;

    lamps.forEach((lamp, i) => {
      arms.setMatrixAt(i, lamp.arm);
      heads.setMatrixAt(i, lamp.head);
      lenses.setMatrixAt(i, lamp.lens);
      lenses.setColorAt(i, LENS_OFF);
      beams.setMatrixAt(i, lamp.beam);
      halos.centers.setXYZ(i, lamp.glowPosition.x, lamp.glowPosition.y, lamp.glowPosition.z);
    });
    halos.centers.needsUpdate = true;
    [arms, heads, lenses, beams].forEach(mesh => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
    if (lenses.instanceColor) lenses.instanceColor.needsUpdate = true;
  }, [lamps, halos]);

  const lensColor = useMemo(() => new THREE.Color(), []);
  const lastLevels = useRef<number[]>(lamps.map(() => -1));

  // Priority -1: after the clock moves, before the night lights are committed (DayNightSystem)
  useFrame((state) => {
    const lenses = lensesRef.current;
    const beams = beamsRef.current;
    const glow = glowRef.current;
    if (!lenses || !beams || !glow) return;

    const time = state.clock.elapsedTime;
    beams.visible = dayNight.night > 0.2;
    glow.visible = beams.visible;
    let changed = false;

    for (let i = 0; i < lamps.length; i++) {
      const on = Math.min(Math.max((dayNight.night - billboardDelays[lamps[i].billboard]) / 0.2, 0), 1);

      // Striking up: the lamp stutters before it holds, like a floodlight warming up
      let level = on;
      if (on > 0 && on < 1) {
        const stutter = seeded(Math.floor(time * 12 + lampSeeds[i]));
        level *= stutter > 0.45 ? 1 : 0.15;
      }

      lights[i].intensity = LIGHT_INTENSITY * level;

      if (Math.abs(level - lastLevels.current[i]) > 0.005) {
        lastLevels.current[i] = level;
        lensColor.copy(LENS_OFF).lerp(LENS_ON, level);
        lenses.setColorAt(i, lensColor);
        beamGlows.setX(i, level);
        halos.glows.setX(i, level);
        changed = true;
      }
    }

    if (changed) {
      if (lenses.instanceColor) lenses.instanceColor.needsUpdate = true;
      beamGlows.needsUpdate = true;
      halos.glows.needsUpdate = true;
    }
  }, -1);

  return (
    <>
      <instancedMesh ref={armsRef} args={[armGeometry, hardwareMaterial, LAMP_COUNT]} />
      <instancedMesh ref={headsRef} args={[headGeometry, hardwareMaterial, LAMP_COUNT]} />
      <instancedMesh
        ref={lensesRef}
        args={[lensGeometry, lensMaterial, LAMP_COUNT]}
        onUpdate={(mesh) => {
          // Allocate per-instance colours up front
          if (!mesh.instanceColor) mesh.setColorAt(0, LENS_OFF);
        }}
      />
      <instancedMesh ref={beamsRef} args={[beamGeometry, beamMaterial, LAMP_COUNT]} frustumCulled={false} />
      <mesh ref={glowRef} geometry={halos.geometry} material={haloMaterial} frustumCulled={false} />
    </>
  );
};

export default BillboardLamps;

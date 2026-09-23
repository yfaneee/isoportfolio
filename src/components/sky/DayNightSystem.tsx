import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { dayNight, stepDayNight } from '../../utils/dayNight';
import { stepWeather, weather } from '../../utils/weather';
import { commitNightLights, patchWorldMaterials, worldUniforms } from './worldMaterials';
import SkyBackdrop from './SkyBackdrop';
import Lanterns from './Lanterns';
import BillboardLamps from './BillboardLamps';
import Precipitation from './Precipitation';

// ============================================================================
// DAY / NIGHT SYSTEM
// Owns the scene lighting and the weather. Each frame it moves the clock and the
// weather on, then points the key light at the sun (or the moon), sets the
// ambient and fill for the hour, dims them under cloud, and hands the rest to the
// windows, billboards, lanterns, lamps and the world's materials.
//
// It keeps the same lights the scene always had (one ambient, two directional),
// so no material has to recompile when the time of day changes.
//
// Frame order: the clock and weather (priority -2), then every night light updates
// itself (-1), then the nearest ones are committed to the shader slots (0).
// ============================================================================

const KEY_LIGHT_DISTANCE = 20;
const MATERIAL_SCAN_INTERVAL = 0.5;

// How much a billboard screen glows by itself at night. Kept low so the lamps
// above it do most of the lighting, brightest at the top as floodlit boards are.
const SCREEN_NIGHT_GLOW = 0.4;

const LIGHTNING_COLOR = new THREE.Color('#DDE6FF');

interface DayNightSystemProps {
  running: boolean; // the clock and the weather only move once the intro has finished
}

const DayNightSystem: React.FC<DayNightSystemProps> = ({ running }) => {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const scanTimer = useRef(0);
  const scene = useThree(state => state.scene);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.1);
    stepDayNight(step, running);
    if (running) stepWeather(step, dayNight.night);

    // Cloud takes most of the sun and some of the sky light; lightning floods everything for an instant
    const overcast = weather.overcast;
    const flash = Math.min(weather.flash, 1.2);

    const ambient = ambientRef.current;
    const key = keyRef.current;
    const fill = fillRef.current;
    if (ambient) {
      ambient.color.copy(dayNight.ambientColor).lerp(LIGHTNING_COLOR, Math.min(flash, 1) * 0.8);
      ambient.intensity = dayNight.ambientIntensity * (1 - 0.2 * overcast) + flash * 3;
    }
    if (key) {
      key.position.copy(dayNight.keyLightDirection).multiplyScalar(KEY_LIGHT_DISTANCE);
      key.color.copy(dayNight.keyLightColor);
      key.intensity = dayNight.keyLightIntensity * (1 - 0.6 * overcast);
    }
    if (fill) fill.intensity = dayNight.fillIntensity * (1 - 0.3 * overcast);

    worldUniforms.uNightGlow.value = dayNight.night * SCREEN_NIGHT_GLOW;
    worldUniforms.uWindowBoost.value = 1 + 0.4 * dayNight.night;
    worldUniforms.uSnowCover.value = weather.snowCover;
    worldUniforms.uWetness.value = weather.wetness;

    // Give new materials the night lighting and weather (the first pass happens before the first render)
    scanTimer.current -= delta;
    if (scanTimer.current <= 0) {
      scanTimer.current = MATERIAL_SCAN_INTERVAL;
      patchWorldMaterials(scene);
    }
  }, -2);

  useFrame((state) => {
    commitNightLights(state.camera);
  });

  return (
    <>
      <SkyBackdrop />
      <ambientLight ref={ambientRef} intensity={2} />
      <directionalLight ref={keyRef} position={[10, 10, 5]} intensity={2} castShadow={false} />
      <directionalLight ref={fillRef} position={[-10, 10, -5]} intensity={0.8} castShadow={false} />
      <Lanterns />
      <BillboardLamps />
      <Precipitation />
    </>
  );
};

export default DayNightSystem;

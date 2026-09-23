import React, { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dayNight } from '../../utils/dayNight';
import { weather } from '../../utils/weather';

// ============================================================================
// SKY BACKDROP
// One fullscreen quad drawn at the far plane: the gradient, the night sky, and
// the cloud and lightning of the weather.
// It writes no depth and only shows where nothing else was drawn, so it sits
// behind the world whatever order it renders in.
//
// The sun and moon are never drawn. They are felt instead: they move across the
// sky out of sight, and the light on the world turns with them (see dayNight.ts).
//
// Colours are display (sRGB) values and the pass is not tone mapped, so the
// daytime gradient matches the original CSS background exactly.
// ============================================================================

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uStops[5];
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform vec2 uSunPos;
  uniform float uSunVisible;
  uniform float uSunLow;
  uniform float uStars;
  uniform float uOvercast;
  uniform float uFlash;

  varying vec2 vUv;

  #define PI 3.14159265359

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
      mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * valueNoise(p);
      p = p * 2.03 + 17.1;
      amplitude *= 0.5;
    }
    return value;
  }

  // Same stops as the CSS linear-gradient(180deg, ...) it replaces; y is 0 at the top
  vec3 skyGradient(float y) {
    if (y < 0.28) return mix(uStops[0], uStops[1], y / 0.28);
    if (y < 0.55) return mix(uStops[1], uStops[2], (y - 0.28) / 0.27);
    if (y < 0.78) return mix(uStops[2], uStops[3], (y - 0.55) / 0.23);
    return mix(uStops[3], uStops[4], (y - 0.78) / 0.22);
  }

  // One layer of pixel-sized stars on a jittered grid
  float starLayer(vec2 px, float cell, float density, float size, float seed) {
    vec2 id = floor(px / cell);
    float h = hash12(id + seed);
    if (h > density) return 0.0;
    vec2 local = px - id * cell;
    vec2 starPos = (0.15 + 0.7 * hash22(id + seed + 7.3)) * cell;
    float d = length(local - starPos);
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.8 + 2.6 * hash12(id + seed + 3.1)) + h * 60.0);
    float brightness = 0.35 + 0.65 * hash12(id + seed + 11.7);
    return (1.0 - smoothstep(0.0, size, d)) * twinkle * brightness;
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uvA = vUv * aspect;
    vec2 px = gl_FragCoord.xy / uPixelRatio;

    vec3 col = skyGradient(1.0 - vUv.y);

    // ---- Night sky ------------------------------------------------------------
    // Cloud cover hides the stars
    float starsShowing = uStars * (1.0 - uOvercast);
    if (starsShowing > 0.001) {
      // Stars thin out toward the bottom, where the sky is hazier
      float starMask = smoothstep(0.08, 0.55, vUv.y) * starsShowing;

      // Faint Milky Way running corner to corner
      vec2 bandDir = normalize(vec2(1.0, 0.55));
      float bandDist = dot(uvA - vec2(0.5 * aspect.x, 0.62), vec2(-bandDir.y, bandDir.x));
      float band = exp(-bandDist * bandDist * 22.0) * (0.35 + 0.65 * fbm(uvA * 4.0 + 3.0));
      col += vec3(0.62, 0.58, 0.85) * band * 0.075 * starMask;

      float stars = starLayer(px, 14.0, 0.12, 1.1, 0.0)
                  + starLayer(px, 37.0, 0.18, 1.6, 41.0) * 1.2
                  + starLayer(px, 90.0, 0.25, 2.2, 97.0) * 1.5;
      stars *= 1.0 + band * 1.5;
      col += vec3(0.92, 0.94, 1.0) * stars * starMask;

      // Now and then a shooting star
      float period = 9.0;
      float slot = floor(uTime / period);
      float localTime = uTime - slot * period;
      float duration = 0.85;
      if (hash12(vec2(slot, 3.7)) > 0.45 && localTime < duration) {
        float side = hash12(vec2(slot, 5.5)) > 0.5 ? 1.0 : -1.0;
        vec2 dir = normalize(vec2(0.9 * side, -0.45));
        vec2 start = vec2(0.2 + 0.6 * hash12(vec2(slot, 1.1)), 0.68 + 0.26 * hash12(vec2(slot, 2.2))) * aspect;
        float progress = localTime / duration;
        vec2 head = start + dir * progress * 0.38;
        vec2 rel = uvA - head;
        float along = dot(rel, -dir);
        float across = length(rel + dir * along);
        float trail = step(0.0, along) * (1.0 - smoothstep(0.0, 0.13, along)) * (1.0 - smoothstep(0.0, 0.0024, across));
        col += vec3(1.0, 0.95, 0.88) * trail * sin(progress * PI) * starMask * 1.4;
      }
    }

    // ---- Where the sun is ------------------------------------------------------
    // The sun itself is never drawn; low in the sky it only warms the side it sits on
    if (uSunVisible > 0.001) {
      float ds = length((vUv - uSunPos) * aspect);
      vec3 warmth = mix(vec3(1.0, 0.9, 0.75), vec3(1.0, 0.58, 0.36), uSunLow);
      col += warmth * exp(-ds * 2.2) * uSunLow * 0.5 * uSunVisible;
    }

    // ---- Weather ----------------------------------------------------------------
    // Cloud greys the sky out and dims it; lightning lights the whole thing up
    if (uOvercast > 0.001) {
      float grey = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, vec3(grey) * vec3(0.92, 0.94, 1.0), uOvercast * 0.6) * (1.0 - uOvercast * 0.3);
    }
    col += vec3(0.75, 0.8, 1.0) * uFlash * 0.55;

    // Film grain, standing in for the CSS noise overlay the canvas used to show through
    float grain = hash12(floor(px));
    col = mix(col, vec3(0.3 + 0.4 * grain), 0.06);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const SkyBackdrop: React.FC = () => {
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uStops: { value: dayNight.sky.map(c => c.clone()) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPixelRatio: { value: 1 },
      uTime: { value: 0 },
      uSunPos: { value: new THREE.Vector2() },
      uSunVisible: { value: 0 },
      uSunLow: { value: 0 },
      uStars: { value: 0 },
      uOvercast: { value: 0 },
      uFlash: { value: 0 }
    },
    depthWrite: false,
    depthTest: true,
    toneMapped: false
  }), []);

  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  useEffect(() => () => {
    material.dispose();
    geometry.dispose();
  }, [material, geometry]);

  useFrame((state) => {
    const u = material.uniforms;
    const dpr = state.gl.getPixelRatio();

    (u.uStops.value as THREE.Vector3[]).forEach((stop, i) => stop.copy(dayNight.sky[i]));
    u.uResolution.value.set(state.size.width * dpr, state.size.height * dpr);
    u.uPixelRatio.value = dpr;
    u.uTime.value = state.clock.elapsedTime;
    u.uSunPos.value.copy(dayNight.sunScreen);
    u.uSunVisible.value = dayNight.sunVisible;
    u.uSunLow.value = dayNight.sunLow;
    u.uStars.value = dayNight.stars;
    u.uOvercast.value = weather.overcast;
    u.uFlash.value = weather.flash;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
};

export default SkyBackdrop;

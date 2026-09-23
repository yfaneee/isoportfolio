import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { weather } from '../../utils/weather';
import { dayNight } from '../../utils/dayNight';

// ============================================================================
// PRECIPITATION
// Rain and snow, animated entirely on the GPU: every drop and flake has a fixed
// random seed, and the vertex shader works out where it is from the time. They
// fill a box that follows the view. Positions are anchored in the world and only
// wrap at the edges of the box, so walking around never makes the rain jump.
// One draw call each; lighter weather simply draws fewer of them.
// ============================================================================

const IS_MOBILE = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const MAX_DROPS = IS_MOBILE ? 3000 : 7000;
const MAX_FLAKES = IS_MOBILE ? 1800 : 4000;

const BOX = new THREE.Vector3(36, 22, 36);
const FOCUS_DISTANCE = 17;   // roughly where the camera is looking, in front of it
const RAIN_SPEED = 22;
const SNOW_SPEED = 1.1;

const RAIN_DAY = new THREE.Vector3(0.82, 0.86, 0.96);
const RAIN_NIGHT = new THREE.Vector3(0.45, 0.5, 0.72);
const SNOW_DAY = new THREE.Vector3(1.0, 1.0, 1.0);
const SNOW_NIGHT = new THREE.Vector3(0.72, 0.77, 0.92);

// Shared by both: where a particle is, given its seed, wrapped into the box
const WRAP = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCenter;
  uniform vec3 uBox;
  uniform vec3 uVelocity;
  attribute vec4 aSeed;

  vec3 particlePosition(float speedJitter) {
    vec3 p = aSeed.xyz * uBox + uVelocity * uTime * speedJitter;
    vec3 minCorner = uCenter - uBox * 0.5;
    return mod(p - minCorner, uBox) + minCorner;
  }

  // Nothing right up against the lens, nothing out past the world
  float depthFade(float depth) {
    return smoothstep(3.0, 8.0, depth) * (1.0 - smoothstep(32.0, 48.0, depth));
  }
`;

const rainVertex = /* glsl */ `
  ${WRAP}
  uniform float uLength;
  uniform float uWidth;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vec3 p = particlePosition(0.85 + 0.3 * aSeed.w);

    // A thin streak along the direction of fall, turned to face the camera
    vec3 fall = normalize(uVelocity);
    vec4 head = viewMatrix * vec4(p, 1.0);
    vec4 tail = viewMatrix * vec4(p - fall * uLength, 1.0);
    vec2 along = head.xy - tail.xy;
    float len = length(along);
    along = len > 1e-5 ? along / len : vec2(0.0, 1.0);
    vec4 v = mix(tail, head, position.y + 0.5);
    // Rotated -90 degrees, so the quad keeps its winding and faces the camera
    v.xy += vec2(along.y, -along.x) * position.x * uWidth;

    vUv = uv;
    vAlpha = depthFade(-v.z) * (0.5 + 0.5 * aSeed.w);
    gl_Position = projectionMatrix * v;
  }
`;

const rainFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float along = smoothstep(0.0, 0.4, vUv.y); // the tail fades in, the head is solid
    gl_FragColor = vec4(uColor, across * along * vAlpha * uOpacity);
  }
`;

const snowVertex = /* glsl */ `
  ${WRAP}
  uniform float uSize;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vec3 p = particlePosition(0.7 + 0.6 * aSeed.w);
    // Flakes wander as they fall
    float t = uTime + aSeed.w * 40.0;
    p.x += sin(t * 0.9) * 0.35 + sin(t * 2.3) * 0.08;
    p.z += cos(t * 0.7) * 0.35;

    vec4 v = viewMatrix * vec4(p, 1.0);
    v.xy += position.xy * uSize * (0.6 + 0.8 * aSeed.w);

    vUv = uv;
    vAlpha = depthFade(-v.z);
    gl_Position = projectionMatrix * v;
  }
`;

const snowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float flake = 1.0 - smoothstep(0.35, 1.0, d);
    gl_FragColor = vec4(uColor, flake * vAlpha * uOpacity);
  }
`;

const createParticleGeometry = (count: number) => {
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();

  const quad = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = quad.index;
  geometry.setAttribute('position', quad.getAttribute('position'));
  geometry.setAttribute('uv', quad.getAttribute('uv'));
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  geometry.instanceCount = 0;
  return geometry;
};

const createParticleMaterial = (vertexShader: string, fragmentShader: string, extraUniforms: Record<string, THREE.IUniform>) =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uBox: { value: BOX.clone() },
      uVelocity: { value: new THREE.Vector3(0, -1, 0) },
      uColor: { value: new THREE.Vector3(1, 1, 1) },
      uOpacity: { value: 1 },
      ...extraUniforms
    },
    transparent: true,
    depthWrite: false,
    toneMapped: false
  });

const Precipitation: React.FC = () => {
  const rainRef = useRef<THREE.Mesh>(null);
  const snowRef = useRef<THREE.Mesh>(null);

  const rainGeometry = useMemo(() => createParticleGeometry(MAX_DROPS), []);
  const snowGeometry = useMemo(() => createParticleGeometry(MAX_FLAKES), []);
  const rainMaterial = useMemo(() => createParticleMaterial(rainVertex, rainFragment, {
    uLength: { value: 1.1 },
    uWidth: { value: 0.05 }
  }), []);
  const snowMaterial = useMemo(() => createParticleMaterial(snowVertex, snowFragment, {
    uSize: { value: 0.1 }
  }), []);

  useEffect(() => () => {
    rainGeometry.dispose();
    snowGeometry.dispose();
    rainMaterial.dispose();
    snowMaterial.dispose();
  }, [rainGeometry, snowGeometry, rainMaterial, snowMaterial]);

  const scratch = useMemo(() => ({ forward: new THREE.Vector3(), center: new THREE.Vector3() }), []);

  useFrame((state) => {
    const rain = rainRef.current;
    const snow = snowRef.current;
    if (!rain || !snow) return;

    const { forward, center } = scratch;
    state.camera.getWorldDirection(forward);
    center.copy(state.camera.position).addScaledVector(forward, FOCUS_DISTANCE);
    center.y += 4; // more of the box above the platforms than below them

    const time = state.clock.elapsedTime;
    const day = 1 - dayNight.night;
    const flash = Math.min(weather.flash, 1.2);

    // ---- Rain ----
    rain.visible = weather.rain > 0.005;
    if (rain.visible) {
      const u = rainMaterial.uniforms;
      u.uTime.value = time;
      u.uCenter.value.copy(center);
      u.uVelocity.value.set(weather.windX, -RAIN_SPEED, weather.windZ);
      u.uColor.value.lerpVectors(RAIN_NIGHT, RAIN_DAY, day).addScalar(flash * 0.5);
      u.uOpacity.value = 0.38 + 0.2 * weather.rain;
      rainGeometry.instanceCount = Math.floor(MAX_DROPS * weather.rain);
    }

    // ---- Snow ----
    snow.visible = weather.snow > 0.005;
    if (snow.visible) {
      const u = snowMaterial.uniforms;
      u.uTime.value = time;
      u.uCenter.value.copy(center);
      u.uVelocity.value.set(weather.windX, -SNOW_SPEED, weather.windZ);
      u.uColor.value.lerpVectors(SNOW_NIGHT, SNOW_DAY, day);
      u.uOpacity.value = 0.85;
      snowGeometry.instanceCount = Math.floor(MAX_FLAKES * weather.snow);
    }
  });

  return (
    <>
      <mesh ref={rainRef} geometry={rainGeometry} material={rainMaterial} frustumCulled={false} visible={false} />
      <mesh ref={snowRef} geometry={snowGeometry} material={snowMaterial} frustumCulled={false} visible={false} />
    </>
  );
};

export default Precipitation;

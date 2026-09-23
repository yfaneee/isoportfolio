import * as THREE from 'three';

// ============================================================================
// WORLD MATERIALS
// Every standard material in the scene gets a small addition to its shader, for
// what the time of day and the weather do to the world:
//
//  - Night lights. Real three.js point lights cost a full physical BRDF per light
//    per fragment, and changing how many there are recompiles every material.
//    Instead there is one short diffuse loop over a fixed number of slots, filled
//    each frame with the lights nearest the view. The lanterns and the billboard
//    lamps both light the world through it.
//  - Weather. Snow settles on surfaces that face up, in drifts, and rain darkens
//    them while they are wet. Only untextured materials take it, which is the
//    blocks, stairs and slabs, not the character or the train.
// ============================================================================

const IS_MOBILE = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// How many lights can light the scene at once
export const NIGHT_LIGHT_SLOTS = IS_MOBILE ? 12 : 24;

// Shared by every patched material: one update per frame reaches all of them
export const worldUniforms = {
  uNightLightCount: { value: 0 },
  uNightLightPos: { value: Array.from({ length: NIGHT_LIGHT_SLOTS }, () => new THREE.Vector4()) },   // xyz world position, w range
  uNightLightColor: { value: Array.from({ length: NIGHT_LIGHT_SLOTS }, () => new THREE.Vector4()) }, // rgb colour, w intensity
  uNightGlow: { value: 0 },    // billboard screens light themselves up a little at night
  uWindowBoost: { value: 1 },  // building windows burn brighter at night
  uSnowCover: { value: 0 },    // settled snow, 0..1
  uWetness: { value: 0 }       // wet from the rain, 0..1
};

// ---------------------------------------------------------------------------
// Light sources. A component registers its lights once and updates them in place
// every frame; commitNightLights() then picks which ones get a slot.
// ---------------------------------------------------------------------------
export interface NightLight {
  position: THREE.Vector3;
  color: THREE.Color;   // linear
  intensity: number;    // 0 = off
  range: number;        // the light reaches exactly zero here
}

const registered = new Set<NightLight[]>();

/** Add a group of lights. Returns the function that removes them again. */
export const registerNightLights = (lights: NightLight[]) => {
  registered.add(lights);
  return () => { registered.delete(lights); };
};

const projected = new THREE.Vector3();
const candidates: { light: NightLight; distance: number; fade: number }[] = [];

/**
 * Fill the slots with the lights nearest the camera that are on (or just off)
 * screen. Lights heading out of view, and the last few slots when more lights
 * want one than there are, fade out rather than switching off, so nothing pops.
 */
export const commitNightLights = (camera: THREE.Camera) => {
  candidates.length = 0;

  registered.forEach(group => {
    for (const light of group) {
      if (light.intensity < 0.01) continue;
      projected.copy(light.position).project(camera);
      const edge = Math.max(Math.abs(projected.x), Math.abs(projected.y));
      if (projected.z > 1 || edge > 1.6) continue;
      candidates.push({
        light,
        distance: camera.position.distanceToSquared(light.position),
        fade: 1 - smoothstep(1.3, 1.6, edge)
      });
    }
  });

  candidates.sort((a, b) => a.distance - b.distance);

  const count = Math.min(candidates.length, NIGHT_LIGHT_SLOTS);
  // When lights are left over, the ones nearest the cut-off dim as the next one closes in
  const cutoff = candidates.length > NIGHT_LIGHT_SLOTS ? candidates[NIGHT_LIGHT_SLOTS].distance : Infinity;

  const positions = worldUniforms.uNightLightPos.value;
  const colors = worldUniforms.uNightLightColor.value;
  for (let i = 0; i < count; i++) {
    const { light, distance, fade } = candidates[i];
    const rankFade = cutoff === Infinity ? 1 : Math.min(Math.max((cutoff - distance) / (cutoff * 0.25), 0), 1);
    positions[i].set(light.position.x, light.position.y, light.position.z, light.range);
    colors[i].set(light.color.r, light.color.g, light.color.b, light.intensity * fade * rankFade);
  }
  worldUniforms.uNightLightCount.value = count;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// The shader side
// ---------------------------------------------------------------------------
const DECLARATIONS = /* glsl */ `
#define NIGHT_LIGHT_SLOTS ${NIGHT_LIGHT_SLOTS}
uniform int uNightLightCount;
uniform vec4 uNightLightPos[NIGHT_LIGHT_SLOTS];
uniform vec4 uNightLightColor[NIGHT_LIGHT_SLOTS];
uniform float uNightGlow;
uniform float uWindowBoost;
uniform float uSnowCover;
uniform float uWetness;

float worldHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float worldNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(worldHash(i), worldHash(i + vec2(1.0, 0.0)), u.x),
    mix(worldHash(i + vec2(0.0, 1.0)), worldHash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
`;

// Runs right after three has summed its own lights. Positions are world space;
// the fragment is taken back to world space once, not once per light.
const LIGHT_LOOP = /* glsl */ `
if (uNightLightCount > 0) {
  vec3 nightFragWorld = cameraPosition + (vec4(geometryPosition, 0.0) * viewMatrix).xyz;
  vec3 nightNormalWorld = normalize((vec4(geometryNormal, 0.0) * viewMatrix).xyz);
  vec3 nightIrradiance = vec3(0.0);

  for (int i = 0; i < NIGHT_LIGHT_SLOTS; i++) {
    if (i >= uNightLightCount) break;
    vec3 toLight = uNightLightPos[i].xyz - nightFragWorld;
    float dist = length(toLight);

    // Inverse square, windowed so the light reaches exactly zero at its range
    float window = clamp(1.0 - pow(dist / uNightLightPos[i].w, 4.0), 0.0, 1.0);
    window *= window;
    float attenuation = window / (dist * dist + 1.0);

    // Wrapped diffuse, so block sides turned slightly away still catch a little light
    float wrapped = clamp((dot(nightNormalWorld, toLight / max(dist, 1e-4)) + 0.3) / 1.3, 0.0, 1.0);

    nightIrradiance += uNightLightColor[i].rgb * (uNightLightColor[i].a * attenuation * wrapped);
  }

  reflectedLight.directDiffuse += nightIrradiance * BRDF_Lambert(material.diffuseColor);
}
`;

// Runs before the material colour is handed to the lighting. Snow fills in the low
// spots of a drift pattern first, so a light fall is patchy and a long one is solid.
const WEATHER = /* glsl */ `
#ifndef USE_MAP
if (uSnowCover > 0.001 || uWetness > 0.001) {
  vec3 weatherNormal = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
  float facingUp = smoothstep(0.55, 0.9, weatherNormal.y);
  vec3 weatherWorld = cameraPosition + (vec4(-vViewPosition, 0.0) * viewMatrix).xyz;
  float drift = worldNoise(weatherWorld.xz * 1.5) * 0.8 + worldNoise(weatherWorld.xz * 5.0) * 0.2;
  float settled = facingUp * clamp((uSnowCover * 1.35 - drift * 0.75) * 3.0, 0.0, 1.0);

  diffuseColor.rgb *= 1.0 - 0.22 * uWetness * facingUp;
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.93, 1.0), settled);
}
#endif
`;

const PATCH_VERSION = 3;

// Tracked here rather than on userData: R3F replaces userData whenever a JSX prop
// object changes, which would make an already patched material look new
const patchedMaterials = new WeakSet<THREE.Material>();

/**
 * Add the night lights and the weather to a standard material. Flags on material.userData add extras:
 *  - nightGlow:    the material's own colour glows at night (billboard screens)
 *  - nightWindows: the emissive term is boosted at night (building windows)
 *  - noWeather:    no snow or wetness (interactive slabs and buttons stay readable)
 */
export const patchWorldMaterial = (material: THREE.Material) => {
  const standard = material as THREE.MeshStandardMaterial;
  if (!standard.isMeshStandardMaterial || patchedMaterials.has(standard)) return;
  patchedMaterials.add(standard);

  const nightGlow = !!standard.userData.nightGlow;
  const nightWindows = !!standard.userData.nightWindows;
  const weatherProof = !!standard.userData.noWeather;

  // Keep whatever the material already did in onBeforeCompile (the windows use it)
  const previousCompile = standard.onBeforeCompile;
  const previousKey = standard.customProgramCacheKey !== THREE.Material.prototype.customProgramCacheKey
    ? standard.customProgramCacheKey.bind(standard)
    : (() => { const source = previousCompile.toString(); return () => source; })();

  standard.onBeforeCompile = (shader, renderer) => {
    previousCompile.call(standard, shader, renderer);

    Object.assign(shader.uniforms, worldUniforms);
    if (shader.fragmentShader.includes('uNightLightCount')) return;

    let fragment = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${DECLARATIONS}`)
      .replace('#include <lights_physical_fragment>', `${weatherProof ? '' : WEATHER}\n#include <lights_physical_fragment>`)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>\n${LIGHT_LOOP}`);

    if (nightGlow || nightWindows) {
      fragment = fragment.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n' +
        (nightGlow ? 'totalEmissiveRadiance += diffuseColor.rgb * uNightGlow;\n' : '') +
        (nightWindows ? 'totalEmissiveRadiance *= uWindowBoost;\n' : '')
      );
    }

    shader.fragmentShader = fragment;
  };

  standard.customProgramCacheKey = () =>
    `${previousKey()}|world${PATCH_VERSION}:${NIGHT_LIGHT_SLOTS}:${nightGlow ? 1 : 0}${nightWindows ? 1 : 0}${weatherProof ? 1 : 0}`;

  standard.needsUpdate = true;
};

/**
 * Patch every standard material in the scene that has not been patched yet.
 * Cheap enough to run every half second, which catches materials created later
 * (models that finish loading, a billboard swapping in its texture).
 */
export const patchWorldMaterials = (root: THREE.Object3D) => {
  root.traverse(object => {
    const material = (object as THREE.Mesh).material;
    if (!material) return;
    if (Array.isArray(material)) material.forEach(patchWorldMaterial);
    else patchWorldMaterial(material);
  });
};

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __world: unknown }).__world = worldUniforms;
}

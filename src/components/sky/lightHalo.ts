import * as THREE from 'three';

// ============================================================================
// LIGHT HALOS
// The soft glow around a light that is on. Camera-facing quads, placed in the
// vertex shader from a per-instance centre, so any number of them is one draw
// call. Brightness per instance is the aGlow attribute.
// ============================================================================

const vertexShader = /* glsl */ `
  uniform float uSize;
  attribute vec3 aCenter;
  attribute float aGlow;
  varying vec2 vUv;
  varying float vGlow;
  void main() {
    vUv = uv;
    vGlow = aGlow;
    vec4 mv = viewMatrix * vec4(aCenter, 1.0);
    mv.xy += position.xy * uSize;
    mv.z += 0.3; // toward the camera, so a wall right behind does not cut the halo in half
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vGlow;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = (exp(-d * d * 6.0) * 0.45 + exp(-d * 7.0) * 0.85) * (1.0 - smoothstep(0.8, 1.0, d));
    gl_FragColor = vec4(uColor, a * vGlow);
  }
`;

export const createHalos = (count: number) => {
  const centers = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  const glows = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
  centers.setUsage(THREE.DynamicDrawUsage);
  glows.setUsage(THREE.DynamicDrawUsage);

  const quad = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = quad.index;
  geometry.setAttribute('position', quad.getAttribute('position'));
  geometry.setAttribute('uv', quad.getAttribute('uv'));
  geometry.setAttribute('aCenter', centers);
  geometry.setAttribute('aGlow', glows);
  geometry.instanceCount = count;

  return { geometry, centers, glows };
};

/** color is a display colour (the pass is additive and not tone mapped). */
export const createHaloMaterial = (color: [number, number, number], size: number) => new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: { value: new THREE.Vector3(...color) },
    uSize: { value: size }
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false
});

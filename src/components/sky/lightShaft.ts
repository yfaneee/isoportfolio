import * as THREE from 'three';

// ============================================================================
// LIGHT SHAFTS
// A faint beam of light hanging from a lamp: an open cone with its tip at the
// lamp, soft at the silhouette and gone by the time it reaches what it lights,
// so it never shows a hard line where it meets a surface. Used instanced, with a
// per-instance brightness in the aGlow attribute.
// ============================================================================

const vertexShader = /* glsl */ `
  attribute float aGlow;
  varying float vDepth;
  varying float vGlow;
  varying vec3 vNormalWorld;
  varying vec3 vViewDirWorld;
  void main() {
    vDepth = -position.y; // 0 at the lamp, 1 where the light meets the surface
    vGlow = aGlow;
    mat4 world = modelMatrix * instanceMatrix;
    vec4 worldPosition = world * vec4(position, 1.0);
    vNormalWorld = normalize(mat3(world) * normal);
    vViewDirWorld = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying float vDepth;
  varying float vGlow;
  varying vec3 vNormalWorld;
  varying vec3 vViewDirWorld;
  void main() {
    float facing = pow(abs(dot(normalize(vNormalWorld), normalize(vViewDirWorld))), 1.2);
    float falloff = pow(1.0 - vDepth, 1.5) * smoothstep(0.0, 0.15, vDepth);
    gl_FragColor = vec4(uColor, facing * falloff * vGlow * uStrength);
  }
`;

/** Unit cone: tip at the origin, open base one unit down the -y axis. */
export const createShaftGeometry = (glow: THREE.InstancedBufferAttribute) => {
  const cone = new THREE.ConeGeometry(1, 1, 24, 1, true);
  cone.translate(0, -0.5, 0);
  glow.setUsage(THREE.DynamicDrawUsage);
  cone.setAttribute('aGlow', glow);
  return cone;
};

/** color is a display colour (the pass is additive and not tone mapped). */
export const createShaftMaterial = (color: [number, number, number], strength: number) => new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: { value: new THREE.Vector3(...color) },
    uStrength: { value: strength }
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false
});

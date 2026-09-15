import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// ============================================================================
// INSTANCED MESH COMPONENT - GPU-OPTIMIZED
// ============================================================================
export interface InstanceData {
  position: [number, number, number];
}

const InstancedBoxes: React.FC<{
  instances: InstanceData[];
  args: [number, number, number];
  color: string;
}> = ({ instances, args, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();

    instances.forEach((instance, i) => {
      tempObject.position.set(...instance.position);
      tempObject.scale.set(1, 1, 1);
      tempObject.rotation.set(0, 0, 0);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    instances.forEach(instance => {
      const [x, y, z] = instance.position;
      const [width, height, depth] = args;
      
      minX = Math.min(minX, x - width / 2);
      maxX = Math.max(maxX, x + width / 2);
      minY = Math.min(minY, y - height / 2);
      maxY = Math.max(maxY, y + height / 2);
      minZ = Math.min(minZ, z - depth / 2);
      maxZ = Math.max(maxZ, z + depth / 2);
    });
    
    // Calculate center and radius of bounding sphere
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    const radius = Math.sqrt(
      Math.pow(maxX - centerX, 2) +
      Math.pow(maxY - centerY, 2) +
      Math.pow(maxZ - centerZ, 2)
    );
    
    // Set the bounding sphere to prevent frustum culling glitches
    const safeRadius = radius * 1.5;
    meshRef.current.geometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(centerX, centerY, centerZ),
      safeRadius
    );
    
    // Also update bounding box
    meshRef.current.geometry.boundingBox = new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    );
    
    // Disable frustum culling entirely to prevent any visual glitches
    meshRef.current.frustumCulled = false;
    
    // GPU optimization
    meshRef.current.geometry.computeBoundingSphere();
    meshRef.current.geometry.computeBoundingBox();
  }, [instances, args]);

  // Memoize geometry and material to prevent recreation (GPU efficiency)
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(...args);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  }, [args]);
  
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ 
      color,
      // GPU-friendly material settings
      flatShading: false, 
      metalness: 0.0,
      roughness: 1.0,
      transparent: false,
      depthWrite: true,
      depthTest: true
    });
    return mat;
  }, [color]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, instances.length]} />
  );
};

export default InstancedBoxes;

import React, { useRef, useMemo } from 'react';
import { useGLTF, Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimatedTrainProps {
  speed?: number;
  showTrain?: boolean;
}

const WAYPOINTS: [number, number, number][] = [
  // ===== WEST SIDE (going south, then descending) =====
  [-18, 2, -15],
  [-18, 2, -13],
  [-18, 2, -11],
  [-18, 2, -9],
  [-18, 2, -7],
  [-18, 2, -5],
  [-18, 2, -3],
  [-18, 2, -1],
  [-18, 2, 1],
  [-18, 2, 3],
  [-18, 2, 5],
  [-18, 1.8, 7],
  [-18, 1.6, 9],
  [-18, 1.3, 11],
  [-18, 1, 13],
  [-18, 0.6, 15],
  [-18, 0.25, 16.9],
  
  // ===== SOUTHWEST CORNER (smooth arc) =====
  [-18, 0, 17.6],
  [-17.5, -0.15, 18.4],
  [-17.0, -0.25, 19.1],
  [-16.5, -0.35, 19.65],
  [-16.0, -0.42, 20.15],
  [-15.3, -0.48, 20.5],
  [-14.6, -0.5, 20.72],
  [-14, -0.5, 20.8],
  
  // ===== BOTTOM SECTION (going east) =====
  [-13, -0.6, 20.8],
  [-12, -0.8, 20.78],
  [-11, -1.0, 20.76],
  [-10, -1.1, 20.75],
  [-9, -1.3, 20.73],
  [-8, -1.5, 20.72],
  [-7, -1.65, 20.71],
  [-6.3, -1.74, 20.7],
  [-5, -1.7, 20.68],
  [-4, -1.68, 20.65],
  [-3, -1.65, 20.63],
  [-2.32, -1.62, 20.61],
  [-1, -1.58, 20.6],
  [0, -1.55, 20.6],
  [1, -1.5, 20.6],
  
  // ===== SOUTHEAST CORNER (smooth arc) =====
  [2.5, -1.5, 20.5],
  [3.5, -1.5, 20.1],
  [4.2, -1.5, 19.5],
  [4.7, -1.5, 18.9],
  [5.1, -1.5, 18.2],
  [5.4, -1.5, 17.5],
  [5.6, -1.5, 17],
  [5.7, -1.5, 16.59],
  
  // ===== EAST SIDE (going north, with elevation changes) =====
  [5.7, -1.5, 16],
  [5.7, -1.5, 15],
  [5.7, -1.5, 14],
  [5.7, -1.5, 13],
  [5.7, -1.5, 12.7],
  [5.75, -1.6, 11.5],
  [5.78, -1.75, 10],
  [5.82, -1.9, 8.7],
  [5.88, -2.3, 7],
  [5.95, -2.7, 4.7],
  [6.0, -3.2, 3],
  [6.07, -3.8, 1.1],
  [6.15, -4.2, -0.5],
  [6.2, -4.5, -2.4],
  [6.21, -4.7, -4],
  [6.22, -4.9, -5.8],
  [6.22, -4.5, -7.5],
  [6.23, -3.78, -9.2],
  [6.28, -3.2, -11],
  [6.35, -2.6, -13],
  [6.3, -2.4, -14.5],
  [6.3, -2.38, -15.2],
  [6.3, -2.36, -15.9],
  [6.3, -2.35, -16.5],
  [6.3, -2.34, -17.0],
  
  // ===== NORTHEAST CORNER (smooth arc) =====
  [6.25, -2.3, -17.5],
  [6.15, -2.22, -17.8],
  [6.0, -2.14, -18.1],
  [5.8, -2.06, -18.35],
  [5.55, -2.0, -18.55],
  [5.25, -1.94, -18.73],
  [4.9, -1.88, -18.88],
  [4.6, -1.83, -19],
  
  // ===== TOP SECTION (going west, ascending) =====
  [4, -1.6, -19],
  [3, -1.4, -19],
  [2, -1.2, -19],
  [1, -1.05, -19],
  [0, -0.8, -19],
  [-1, -0.6, -19],
  [-2.2, -0.4, -19],
  [-3.5, -0.1, -19],
  [-5, 0.2, -19],
  [-6.1, 0.4, -19],
  [-7.5, 0.7, -19],
  [-8.5, 0.95, -19],
  [-10, 1.2, -19],
  [-11.5, 1.5, -19],
  [-13, 1.8, -19],
  [-13.9, 1.99, -19],
  
  // ===== NORTHWEST CORNER  =====
  [-15, 2, -18.5],
  [-16, 2, -18],
  [-16.8, 2, -17.2],
  [-17.4, 2, -16.4],
  [-17.8, 2, -15.6],
];

// Helper function to get position and rotation at a given distance along the path
const getPositionAtDistance = (
  distance: number, 
  totalLength: number, 
  segmentLengths: number[]
): { pos: [number, number, number]; yaw: number; pitch: number } => {
  // Wrap distance to total length
  let dist = distance % totalLength;
  if (dist < 0) dist += totalLength;
  
  // Find which segment we're on
  let remainingDistance = dist;
  let segmentIndex = 0;
  
  while (segmentIndex < segmentLengths.length - 1 && remainingDistance > segmentLengths[segmentIndex]) {
    remainingDistance -= segmentLengths[segmentIndex];
    segmentIndex++;
  }
  
  // Get current and next waypoint
  const current = WAYPOINTS[segmentIndex];
  const next = WAYPOINTS[(segmentIndex + 1) % WAYPOINTS.length];
  
  // Calculate interpolation factor
  const t = segmentLengths[segmentIndex] > 0 ? remainingDistance / segmentLengths[segmentIndex] : 0;
  
  // Linear interpolation for position
  const x = current[0] + (next[0] - current[0]) * t;
  const y = current[1] + (next[1] - current[1]) * t;
  const z = current[2] + (next[2] - current[2]) * t;
  
  // Calculate direction
  const dx = next[0] - current[0];
  const dy = next[1] - current[1];
  const dz = next[2] - current[2];
  
  // Yaw (horizontal rotation)
  const yaw = Math.atan2(dx, dz);
  
  const horizontalDist = Math.sqrt(dx * dx + dz * dz);
  const pitch = horizontalDist > 0.01 ? -Math.atan2(dy, horizontalDist) : 0;
  
  return { pos: [x, y, z], yaw, pitch };
};

// Reusable objects to avoid creating new ones every frame
const _yawQuat = new THREE.Quaternion();
const _pitchQuat = new THREE.Quaternion();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _xAxis = new THREE.Vector3(1, 0, 0);

const AnimatedTrain: React.FC<AnimatedTrainProps> = ({ speed = 1, showTrain = true }) => {
  const distanceTraveled = useRef(0);
  
  // Refs for all train cars 
  const car1Ref = useRef<THREE.Group>(null);
  const car2Ref = useRef<THREE.Group>(null);
  const car3Ref = useRef<THREE.Group>(null);
  const car4Ref = useRef<THREE.Group>(null);
  const car5Ref = useRef<THREE.Group>(null);
  
  // Load electric train models
  const frontCar = useGLTF('/train/train-electric-bullet-a.glb');
  const middleCar = useGLTF('/train/train-electric-bullet-b.glb');
  const rearCar = useGLTF('/train/train-electric-bullet-c.glb');
  
  // Memoize cloned models 
  const clonedModels = useMemo(() => ({
    front: frontCar.scene.clone(),
    middle: middleCar.scene.clone(),
    rear1: rearCar.scene.clone(),
    rear2: rearCar.scene.clone(),
    rear3: rearCar.scene.clone(),
  }), [frontCar.scene, middleCar.scene, rearCar.scene]);
  
  // Calculate total path length and segment lengths
  const { totalLength, segmentLengths } = useMemo(() => {
    const lengths: number[] = [];
    let total = 0;
    
    for (let i = 0; i < WAYPOINTS.length; i++) {
      const current = WAYPOINTS[i];
      const next = WAYPOINTS[(i + 1) % WAYPOINTS.length];
      const dx = next[0] - current[0];
      const dy = next[1] - current[1];
      const dz = next[2] - current[2];
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      lengths.push(length);
      total += length;
    }
    
    return { totalLength: total, segmentLengths: lengths };
  }, []);
  
  const yOffset = -1; 
  const carSpacing = 1.3;
  
  // Single useFrame for ALL cars 
  useFrame((_, delta) => {
    if (!showTrain) return;
    
    // Update distance
    distanceTraveled.current += delta * speed;
    if (distanceTraveled.current >= totalLength) {
      distanceTraveled.current = 0;
    }
    
    // Update all cars in one loop
    const carRefs = [car1Ref, car2Ref, car3Ref, car4Ref, car5Ref];
    const offsets = [0, carSpacing, carSpacing * 2, carSpacing * 3, carSpacing * 4];
    
    for (let i = 0; i < carRefs.length; i++) {
      const carRef = carRefs[i];
      if (!carRef.current) continue;
      
      const { pos, yaw, pitch } = getPositionAtDistance(
        distanceTraveled.current - offsets[i],
        totalLength,
        segmentLengths
      );
      
      carRef.current.position.set(pos[0], pos[1] + yOffset, pos[2]);
      
      _yawQuat.setFromAxisAngle(_yAxis, yaw);
      _pitchQuat.setFromAxisAngle(_xAxis, pitch);
      carRef.current.quaternion.multiplyQuaternions(_yawQuat, _pitchQuat);
    }
  });
  
  return (
    <group name="electric-train">
      {/* Train cars - only render when showTrain is true */}
      {showTrain && (
        <>
          {/* Front car */}
          <group ref={car1Ref}>
            <primitive object={clonedModels.front} scale={0.5} />
          </group>
          
          {/* Car 2 */}
          <group ref={car2Ref}>
            <primitive object={clonedModels.middle} scale={0.5} />
          </group>
          
          {/* Car 3 */}
          <group ref={car3Ref}>
            <primitive object={clonedModels.rear1} scale={0.5} />
          </group>
          
          {/* Car 4 */}
          <group ref={car4Ref}>
            <primitive object={clonedModels.rear2} scale={0.5} />
          </group>
          
          {/* Car 5 */}
          <group ref={car5Ref}>
            <primitive object={clonedModels.rear3} scale={0.5} />
          </group>
        </>
      )}
      
      {/* Support Pillars - Foundation Style */}
      {/* Southwest Corner Pillar */}
      <Box
        position={[-18, -100.7, 16]}
        args={[1.5, 200, 1.5]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

      <Box
        position={[-14, -101.6, 20.6]}
        args={[1.5, 200, 1.5]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

      <Box
        position={[3, -102.55, 20.6]}
        args={[1.5, 200, 2]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

      <Box
        position={[3.5, -102.55, 19.6]}
        args={[2.5, 200, 2]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

      
      
      {/* Northwest Corner Pillar */}
      <Box
        position={[-18, -98.95, -15]}
        args={[2, 200, 1.5]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

      <Box
        position={[-14, -99.11, -19]}
        args={[1.5, 200, 2]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

      <Box
        position={[3, -102.59, -19]}
        args={[1.5, 200, 2]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

      <Box
        position={[6.4, -103.3, -15]}
        args={[2, 200, 1.5]}
      >
        <meshStandardMaterial color='#C5A3FF' />
      </Box>

    </group>
  );
};

// Preload train models
useGLTF.preload('/train/train-electric-bullet-a.glb');
useGLTF.preload('/train/train-electric-bullet-b.glb');
useGLTF.preload('/train/train-electric-bullet-c.glb');

// Memoize to prevent unnecessary re-renders
export default React.memo(AnimatedTrain);

import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimatedTrainProps {
  speed?: number;
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
  [-17.5, 0, 17.5],
  [-17, -0.2, 18],
  [-16.5, -0.3, 18.5],
  [-16, -0.4, 19],
  [-15.5, -0.45, 19.5],
  [-15, -0.48, 20],
  [-14.5, -0.5, 20.4],
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
  [2, -1.5, 20.3],
  [3, -1.5, 19.8],
  [3.5, -1.5, 19.3],
  [4, -1.5, 18.8],
  [4.5, -1.5, 18.2],
  [5, -1.5, 17.5],
  [5.4, -1.5, 17],
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
  
  // ===== NORTHEAST CORNER (smooth arc) =====
  [6.1, -2.2, -15.5],
  [5.8, -2.0, -16.5],
  [5.5, -1.9, -17.2],
  [5.2, -1.85, -17.8],
  [4.9, -1.82, -18.3],
  [4.6, -1.8, -19],
  
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

// Individual car component that follows the path independently
const TrainCar: React.FC<{
  model: THREE.Group;
  distanceRef: React.MutableRefObject<number>;
  offset: number; 
  totalLength: number;
  segmentLengths: number[];
  yOffset: number;
}> = ({ model, distanceRef, offset, totalLength, segmentLengths, yOffset }) => {
  const carRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (!carRef.current) return;
    
    // Get position for the car 
    const { pos, yaw, pitch } = getPositionAtDistance(
      distanceRef.current - offset,
      totalLength,
      segmentLengths
    );
    
    carRef.current.position.set(pos[0], pos[1] + yOffset, pos[2]);
    
    // Use quaternions for explicit rotation order:
    _yawQuat.setFromAxisAngle(_yAxis, yaw);
    _pitchQuat.setFromAxisAngle(_xAxis, pitch);
    
    // For intrinsic rotation
    carRef.current.quaternion.multiplyQuaternions(_yawQuat, _pitchQuat);
  });
  
  return (
    <group ref={carRef}>
      <primitive object={model.clone()} scale={0.5} />
    </group>
  );
};

const AnimatedTrain: React.FC<AnimatedTrainProps> = ({ speed = 1 }) => {
  const distanceTraveled = useRef(0);
  
  // Load electric train models
  const frontCar = useGLTF('/train/train-electric-bullet-a.glb');
  const middleCar = useGLTF('/train/train-electric-bullet-b.glb');
  const rearCar = useGLTF('/train/train-electric-bullet-c.glb');
  
  // Calculate total path length and segment lengths
  const { totalLength, segmentLengths } = React.useMemo(() => {
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
  
  // Update distance traveled
  useFrame((state, delta) => {
    distanceTraveled.current += delta * speed;
    if (distanceTraveled.current >= totalLength) {
      distanceTraveled.current = 0;
    }
  });
  
  const yOffset = -1; 
  const carSpacing = 1.3; 
  
  return (
    <group name="electric-train">
      {/* Front car */}
      <TrainCar 
        model={frontCar.scene} 
        distanceRef={distanceTraveled}
        offset={0}
        totalLength={totalLength}
        segmentLengths={segmentLengths}
        yOffset={yOffset}
      />
      
      {/* Car 2 */}
      <TrainCar 
        model={middleCar.scene} 
        distanceRef={distanceTraveled}
        offset={carSpacing}
        totalLength={totalLength}
        segmentLengths={segmentLengths}
        yOffset={yOffset}
      />
      
      {/* Car 3 */}
      <TrainCar 
        model={rearCar.scene} 
        distanceRef={distanceTraveled}
        offset={carSpacing * 2}
        totalLength={totalLength}
        segmentLengths={segmentLengths}
        yOffset={yOffset}
      />
      
      {/* Car 4 */}
      <TrainCar 
        model={rearCar.scene} 
        distanceRef={distanceTraveled}
        offset={carSpacing * 3}
        totalLength={totalLength}
        segmentLengths={segmentLengths}
        yOffset={yOffset}
      />
      
      {/* Car 5 */}
      <TrainCar 
        model={rearCar.scene} 
        distanceRef={distanceTraveled}
        offset={carSpacing * 4}
        totalLength={totalLength}
        segmentLengths={segmentLengths}
        yOffset={yOffset}
      />
    </group>
  );
};

// Preload train models
useGLTF.preload('/train/train-electric-bullet-a.glb');
useGLTF.preload('/train/train-electric-bullet-b.glb');
useGLTF.preload('/train/train-electric-bullet-c.glb');

export default AnimatedTrain;

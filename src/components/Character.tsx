import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

interface CharacterProps {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  opacity?: number;
}

const Character: React.FC<CharacterProps> = ({ position, rotation, isMoving, opacity = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  
  // Animation time
  const timeRef = useRef(0);

  // Animate character walking
  useFrame((state, delta) => {
     if (isMoving) {
       timeRef.current += delta * 8; 
      
       // Leg swing animation
       if (leftLegRef.current) {
         leftLegRef.current.rotation.x = Math.sin(timeRef.current) * 0.5;
       }
       if (rightLegRef.current) {
         rightLegRef.current.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.5;
       }
      
       // Arm swing animation (opposite to legs)
       if (leftArmRef.current) {
         leftArmRef.current.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.3;
       }
       if (rightArmRef.current) {
         rightArmRef.current.rotation.x = Math.sin(timeRef.current) * 0.3;
       }
    } else {
       // Reset to idle pose smoothly
       if (leftLegRef.current) {
         leftLegRef.current.rotation.x *= 0.9;
       }
       if (rightLegRef.current) {
         rightLegRef.current.rotation.x *= 0.9;
       }
       if (leftArmRef.current) {
         leftArmRef.current.rotation.x *= 0.9;
       }
       if (rightArmRef.current) {
         rightArmRef.current.rotation.x *= 0.9;
       }
     }
   });

  // Update position when prop changes
  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.y = rotation;
    }
  }, [position, rotation]);

  const characterColor = '#4A90E2';
  const skinColor = '#FFD1A4';

  return (
    <group ref={groupRef} position={position}>
      {/* Body - static, no animation */}
      <Box position={[0, 0.5, 0]} args={[0.4, 0.3, 0.3]}>
        <meshStandardMaterial 
          color={characterColor} 
          transparent 
          opacity={opacity}
          depthWrite={opacity > 0.5}
        />
      </Box>
      
      {/* Head */}
      <Box position={[0, 0.85, 0]} args={[0.25, 0.25, 0.25]}>
        <meshStandardMaterial color={skinColor} transparent opacity={opacity} />
      </Box>
      
      {/* Left Leg */}
      <group position={[-0.12, 0.3, 0]}>
        <Box ref={leftLegRef} position={[0, -0.15, 0]} args={[0.12, 0.3, 0.12]}>
          <meshStandardMaterial color={characterColor} transparent opacity={opacity} />
        </Box>
      </group>
      
      {/* Right Leg */}
      <group position={[0.12, 0.3, 0]}>
        <Box ref={rightLegRef} position={[0, -0.15, 0]} args={[0.12, 0.3, 0.12]}>
          <meshStandardMaterial color={characterColor} transparent opacity={opacity} />
        </Box>
      </group>
      
      {/* Left Arm */}
      <group position={[-0.26, 0.5, 0]}>
        <Box ref={leftArmRef} position={[0, -0.15, 0]} args={[0.1, 0.3, 0.1]}>
          <meshStandardMaterial color={skinColor} transparent opacity={opacity} />
        </Box>
      </group>
      
      {/* Right Arm */}
      <group position={[0.26, 0.5, 0]}>
        <Box ref={rightArmRef} position={[0, -0.15, 0]} args={[0.1, 0.3, 0.1]}>
          <meshStandardMaterial color={skinColor} transparent opacity={opacity} />
        </Box>
      </group>
    </group>
  );
};

export default Character;


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface CharacterProps {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  opacity?: number;
}

const Character: React.FC<CharacterProps> = ({ position, rotation, isMoving, opacity = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  
  // Animation time and states
  const timeRef = useRef(0);
  const idleTimeRef = useRef(0);
  const walkCycleRef = useRef(0);

  // Enhanced animation system
  useFrame((state, delta) => {
    // Update position and rotation
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.y = rotation;
    }
    
    if (isMoving) {
      // Walking animation
      walkCycleRef.current += delta * 10; 
      idleTimeRef.current = 0; 
      
      // Enhanced leg animation with knee bend
      if (leftLegRef.current) {
        const legSwing = Math.sin(walkCycleRef.current) * 0.6;
        leftLegRef.current.rotation.x = legSwing;
        leftLegRef.current.position.y = 0.3 + Math.abs(legSwing) * 0.05; 
      }
      if (rightLegRef.current) {
        const legSwing = Math.sin(walkCycleRef.current + Math.PI) * 0.6;
        rightLegRef.current.rotation.x = legSwing;
        rightLegRef.current.position.y = 0.3 + Math.abs(legSwing) * 0.05;
      }
      
      // Enhanced arm swing with shoulder movement
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(walkCycleRef.current + Math.PI) * 0.4;
        leftArmRef.current.rotation.z = Math.sin(walkCycleRef.current) * 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(walkCycleRef.current) * 0.4;
        rightArmRef.current.rotation.z = Math.sin(walkCycleRef.current + Math.PI) * 0.1;
      }
      
      // Body bob and sway
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.5 + Math.sin(walkCycleRef.current * 2) * 0.02;
        bodyRef.current.rotation.z = Math.sin(walkCycleRef.current) * 0.05;
      }
      
      // Head slight movement
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(walkCycleRef.current * 1.5) * 0.03;
        headRef.current.position.y = 0.85 + Math.sin(walkCycleRef.current * 2) * 0.01;
      }
    } else {
      // Idle animations
      idleTimeRef.current += delta;
      
      // Breathing animation
      if (bodyRef.current) {
        bodyRef.current.scale.y = 1 + Math.sin(idleTimeRef.current * 3) * 0.02;
        bodyRef.current.rotation.z *= 0.95; 
      }
      
      // Subtle head movement
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(idleTimeRef.current * 0.8) * 0.1;
        headRef.current.rotation.x = Math.sin(idleTimeRef.current * 1.2) * 0.05;
      }
      
      // Smooth limb return to idle
      const returnSpeed = 0.92;
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x *= returnSpeed;
        leftLegRef.current.position.y = THREE.MathUtils.lerp(leftLegRef.current.position.y, 0.3, 0.1);
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x *= returnSpeed;
        rightLegRef.current.position.y = THREE.MathUtils.lerp(rightLegRef.current.position.y, 0.3, 0.1);
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x *= returnSpeed;
        leftArmRef.current.rotation.z *= returnSpeed;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x *= returnSpeed;
        rightArmRef.current.rotation.z *= returnSpeed;
      }
    }
  });

  // Enhanced color palette
  const colors = useMemo(() => ({
    shirt: '#2E86AB',      
    pants: '#A23B72',      
    skin: '#F4C2A1',       
    hair: '#8B4513',       
    shoes: '#2F2F2F',      
    accent: '#F18F01'      
  }), []);
  
  // Dynamic materials with better lighting
  const materials = useMemo(() => ({
    shirt: new THREE.MeshStandardMaterial({ 
      color: colors.shirt,
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity
    }),
    pants: new THREE.MeshStandardMaterial({ 
      color: colors.pants,
      roughness: 0.8,
      metalness: 0.05,
      transparent: true,
      opacity
    }),
    skin: new THREE.MeshStandardMaterial({ 
      color: colors.skin,
      roughness: 0.9,
      metalness: 0.02,
      transparent: true,
      opacity
    }),
    hair: new THREE.MeshStandardMaterial({ 
      color: colors.hair,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity
    }),
    shoes: new THREE.MeshStandardMaterial({ 
      color: colors.shoes,
      roughness: 0.3,
      metalness: 0.4,
      transparent: true,
      opacity
    })
  }), [colors, opacity]);

  return (
    <group ref={groupRef} position={position}>
      {/* Enhanced Body */}
      <group ref={bodyRef} position={[0, 0.5, 0]}>
        {/* Torso */}
        <RoundedBox args={[0.35, 0.4, 0.25]} radius={0.05}>
          <primitive object={materials.shirt} attach="material" />
        </RoundedBox>
        
        {/* Shirt details */}
        <Box position={[0, 0.15, 0.13]} args={[0.25, 0.08, 0.02]}>
          <meshStandardMaterial color={colors.accent} transparent opacity={opacity * 0.8} />
        </Box>
      </group>
      
      {/* Enhanced Head */}
      <group ref={headRef} position={[0, 0.85, 0]}>
        {/* Head */}
        <RoundedBox args={[0.22, 0.24, 0.2]} radius={0.08}>
          <primitive object={materials.skin} attach="material" />
        </RoundedBox>
        
        {/* Hair */}
        <RoundedBox position={[0, 0.08, -0.02]} args={[0.24, 0.12, 0.18]} radius={0.06}>
          <primitive object={materials.hair} attach="material" />
        </RoundedBox>
        
        {/* Eyes */}
        <Sphere position={[-0.06, 0.02, 0.09]} args={[0.02]}>
          <meshStandardMaterial color="#2F2F2F" transparent opacity={opacity} />
        </Sphere>
        <Sphere position={[0.06, 0.02, 0.09]} args={[0.02]}>
          <meshStandardMaterial color="#2F2F2F" transparent opacity={opacity} />
        </Sphere>
        
        {/* Nose */}
        <Box position={[0, -0.02, 0.1]} args={[0.02, 0.03, 0.02]}>
          <primitive object={materials.skin} attach="material" />
        </Box>
      </group>
      
      {/* Enhanced Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.3, 0]}>
        {/* Thigh */}
        <Cylinder position={[0, -0.08, 0]} args={[0.08, 0.08, 0.16]} rotation={[0, 0, 0]}>
          <primitive object={materials.pants} attach="material" />
        </Cylinder>
        
        {/* Shin */}
        <Cylinder position={[0, -0.22, 0]} args={[0.06, 0.06, 0.12]} rotation={[0, 0, 0]}>
          <primitive object={materials.pants} attach="material" />
        </Cylinder>
        
        {/* Shoe */}
        <RoundedBox position={[0, -0.32, 0.02]} args={[0.1, 0.06, 0.16]} radius={0.03}>
          <primitive object={materials.shoes} attach="material" />
        </RoundedBox>
      </group>
      
      {/* Enhanced Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.3, 0]}>
        {/* Thigh */}
        <Cylinder position={[0, -0.08, 0]} args={[0.08, 0.08, 0.16]} rotation={[0, 0, 0]}>
          <primitive object={materials.pants} attach="material" />
        </Cylinder>
        
        {/* Shin */}
        <Cylinder position={[0, -0.22, 0]} args={[0.06, 0.06, 0.12]} rotation={[0, 0, 0]}>
          <primitive object={materials.pants} attach="material" />
        </Cylinder>
        
        {/* Shoe */}
        <RoundedBox position={[0, -0.32, 0.02]} args={[0.1, 0.06, 0.16]} radius={0.03}>
          <primitive object={materials.shoes} attach="material" />
        </RoundedBox>
      </group>
      
      {/* Enhanced Left Arm */}
      <group ref={leftArmRef} position={[-0.26, 0.5, 0]}>
        {/* Upper arm */}
        <Cylinder position={[0, -0.08, 0]} args={[0.05, 0.05, 0.16]} rotation={[0, 0, 0]}>
          <primitive object={materials.shirt} attach="material" />
        </Cylinder>
        
        {/* Forearm */}
        <Cylinder position={[0, -0.22, 0]} args={[0.04, 0.04, 0.12]} rotation={[0, 0, 0]}>
          <primitive object={materials.skin} attach="material" />
        </Cylinder>
        
        {/* Hand */}
        <Sphere position={[0, -0.3, 0]} args={[0.05]}>
          <primitive object={materials.skin} attach="material" />
        </Sphere>
      </group>
      
      {/* Enhanced Right Arm */}
      <group ref={rightArmRef} position={[0.26, 0.5, 0]}>
        {/* Upper arm */}
        <Cylinder position={[0, -0.08, 0]} args={[0.05, 0.05, 0.16]} rotation={[0, 0, 0]}>
          <primitive object={materials.shirt} attach="material" />
        </Cylinder>
        
        {/* Forearm */}
        <Cylinder position={[0, -0.22, 0]} args={[0.04, 0.04, 0.12]} rotation={[0, 0, 0]}>
          <primitive object={materials.skin} attach="material" />
        </Cylinder>
        
        {/* Hand */}
        <Sphere position={[0, -0.3, 0]} args={[0.05]}>
          <primitive object={materials.skin} attach="material" />
        </Sphere>
      </group>
    </group>
  );
};

export default Character;


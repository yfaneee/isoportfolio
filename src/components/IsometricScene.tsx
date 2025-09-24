import React from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import IsometricWorld from '../components/IsometricWorld';

const IsometricScene: React.FC = () => {
  const { camera } = useThree();

  // Set up isometric-style camera
  React.useEffect(() => {
    camera.position.set(10, 7, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.9} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2}
        castShadow={false}
      />
      <directionalLight 
        position={[-10, 10, -5]} 
        intensity={0.8}
        castShadow={false}
      />
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={false}
        minDistance={5}
        maxDistance={50}
      />
      
      {/* The isometric world */}
      <IsometricWorld />
    </>
  );
};

export default IsometricScene;

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const GPUPerformanceMonitor: React.FC = () => {
  const { gl, scene } = useThree();

  // Configure renderer for maximum GPU utilization
  useEffect(() => {
    // Enable all GPU-friendly features
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    
    // Optimize renderer settings
    gl.shadowMap.enabled = false; 
    gl.shadowMap.type = THREE.PCFSoftShadowMap; 
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.sortObjects = false; 
    gl.info.autoReset = true;
    
    // Optimize scene
    scene.matrixAutoUpdate = false; 
    
    return () => {
      scene.matrixAutoUpdate = true;
    };
  }, [gl, scene]);


  return null;
};

export default GPUPerformanceMonitor;



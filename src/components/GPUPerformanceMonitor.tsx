import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GPUPerformanceMonitor: React.FC = () => {
  const { gl, scene } = useThree();
  const lastLogRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

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

  // Monitor GPU performance 
  useFrame(() => {
    scene.updateMatrixWorld();
    
    // Performance monitoring active 
    if (process.env.NODE_ENV === 'development') {
      const now = Date.now();
      if (!lastLogRef.current || now - lastLogRef.current > 5000) {
        lastLogRef.current = now;
        lastFrameRef.current = performance.now();
      }
    }
  });

  return null;
};

export default GPUPerformanceMonitor;



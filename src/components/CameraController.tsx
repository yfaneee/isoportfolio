import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControllerProps {
  characterControllerRef: React.RefObject<any>;
  introComplete: boolean;
  onIntroComplete: () => void;
  isCharacterMoving: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({ 
  characterControllerRef, 
  introComplete,
  onIntroComplete,
  isCharacterMoving
}) => {
  const { camera } = useThree();
  const orbitControlsRef = useRef<any>(null);
  const introTimeRef = useRef(0);
  const introDuration = 3;
  const isFollowingCharacter = useRef(true); 
  const isUsingOrbitControls = useRef(false);
  const hasUsedOrbitControls = useRef(false);
  const orbitTargetInitialized = useRef(false);

  useEffect(() => {
    if (isCharacterMoving) {
      isFollowingCharacter.current = true;
      hasUsedOrbitControls.current = false;
    }
  }, [isCharacterMoving]);

  // Orbit controls handlers
  const handleOrbitStart = () => {
    isUsingOrbitControls.current = true;
    isFollowingCharacter.current = false;
    hasUsedOrbitControls.current = true;
    
    if (!orbitTargetInitialized.current && orbitControlsRef.current && characterControllerRef.current) {
      const characterPosition = characterControllerRef.current.getPosition() || [0, 0, 0];
      orbitControlsRef.current.target.set(characterPosition[0], characterPosition[1], characterPosition[2]);
      orbitControlsRef.current.update();
      orbitTargetInitialized.current = true;
    }
  };

  const handleOrbitEnd = () => {
    isUsingOrbitControls.current = false;
  };

  useFrame((state, delta) => {
    if (!introComplete) {
      // Intro animation
      introTimeRef.current += delta;
      const t = Math.min(introTimeRef.current / introDuration, 1);
      
      const eased = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Animate camera from far to close
      camera.position.set(
        0 + eased * 8,
        40 - eased * (40 - 7),
        40 - eased * (40 - 8)
      );
      camera.lookAt(0, 0, 0);
      
      if (t >= 1) {
        // Set final camera position
        camera.position.set(8, 7, 8);
        camera.lookAt(0, 0, 0);
        onIntroComplete();
      }
    } else if (isFollowingCharacter.current && !isUsingOrbitControls.current && !hasUsedOrbitControls.current) {
      const characterPosition = characterControllerRef.current?.getPosition() || [0, 0, 0];
      
      // Direct camera following - 
      const targetPos = new THREE.Vector3(
        characterPosition[0] + 8,
        characterPosition[1] + 7, 
        characterPosition[2] + 8
      );
      const lookAtPos = new THREE.Vector3(characterPosition[0], characterPosition[1], characterPosition[2]);
      camera.position.copy(targetPos);
      camera.lookAt(lookAtPos);
    }
  });

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enabled={introComplete}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={25}
      maxPolarAngle={Math.PI * 0.75}
      enableDamping={true}
      dampingFactor={0.05}
      onStart={handleOrbitStart}
      onEnd={handleOrbitEnd}
    />
  );
};

export default CameraController;
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
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
  const cameraControlsRef = useRef<CameraControls>(null);
  const introTimeRef = useRef(0);
  const introDuration = 3;
  const isFollowingCharacter = useRef(true);

  // When character moves, switch to following mode
  useEffect(() => {
    if (isCharacterMoving && !isFollowingCharacter.current) {
      isFollowingCharacter.current = true;
    }
  }, [isCharacterMoving]);

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
        onIntroComplete();
      }
    } else if (isFollowingCharacter.current && cameraControlsRef.current) {
      // Get REAL-TIME character position directly
      const characterPosition = characterControllerRef.current?.getPosition() || [0, 0, 0];
      
      // SMOOTH character following using CameraControls
      const targetPos = new THREE.Vector3(
        characterPosition[0] + 8,
        characterPosition[1] + 7, 
        characterPosition[2] + 8
      );
      const lookAtPos = new THREE.Vector3(characterPosition[0], characterPosition[1], characterPosition[2]);
      
      // Use CameraControls smooth movement
      cameraControlsRef.current.setLookAt(
        targetPos.x, targetPos.y, targetPos.z,
        lookAtPos.x, lookAtPos.y, lookAtPos.z,
        true // Enable smooth transition
      );
    }
  });

  const handleControlStart = () => {
    isFollowingCharacter.current = false;
  };

  const handleControlEnd = () => {
    // Stay in manual mode until character moves
  };

  return (
    <CameraControls
      ref={cameraControlsRef}
      enabled={!isFollowingCharacter.current}
      minDistance={3}
      maxDistance={20}
      smoothTime={0.25}
      onStart={handleControlStart}
      onEnd={handleControlEnd}
    />
  );
};

export default CameraController;
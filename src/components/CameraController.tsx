import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControllerProps {
  characterControllerRef: React.RefObject<any>;
  introComplete: boolean;
  onIntroComplete: () => void;
  isCharacterMoving: boolean;
  showMenu: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({
  characterControllerRef,
  introComplete,
  onIntroComplete,
  isCharacterMoving,
  showMenu
}) => {
  const { camera } = useThree();
  const orbitControlsRef = useRef<any>(null);
  const introTimeRef = useRef(0);
  const introDuration = 3;
  const isFollowingCharacter = useRef(true); 
  const isUsingOrbitControls = useRef(false);
  const hasUsedOrbitControls = useRef(false);
  const orbitTargetInitialized = useRef(false);
  const cameraAnimationRef = useRef<{isAnimating: boolean, startTime: number, startPos: THREE.Vector3, startLookAt: THREE.Vector3}>({
    isAnimating: false,
    startTime: 0,
    startPos: new THREE.Vector3(),
    startLookAt: new THREE.Vector3()
  });

  useEffect(() => {
    if (isCharacterMoving) {
      isFollowingCharacter.current = true;
      hasUsedOrbitControls.current = false;
    }
  }, [isCharacterMoving]);

  // Handle smooth camera animation when menu state changes
  useEffect(() => {
    if (introComplete && !isUsingOrbitControls.current) {
      // Start camera animation when menu visibility changes
      const characterPosition = characterControllerRef.current?.getPosition() || [0, 0.22, 0];
      
      cameraAnimationRef.current = {
        isAnimating: true,
        startTime: Date.now(),
        startPos: camera.position.clone(),
        startLookAt: new THREE.Vector3(characterPosition[0], characterPosition[1], characterPosition[2])
      };
    }
  }, [showMenu, introComplete, camera.position]);

  // Orbit controls handlers
  const handleOrbitStart = () => {
    isUsingOrbitControls.current = true;
    isFollowingCharacter.current = false;
    hasUsedOrbitControls.current = true;
    
    if (!orbitTargetInitialized.current && orbitControlsRef.current && characterControllerRef.current) {
      const characterPosition = characterControllerRef.current.getPosition() || [0, 0.22, 0];
      const menuOffsetX = showMenu ? 3 : 0;
      orbitControlsRef.current.target.set(characterPosition[0] + menuOffsetX, characterPosition[1], characterPosition[2]);
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
      const characterPosition = characterControllerRef.current?.getPosition() || [0, 0.22, 0];
      const menuOffsetX = showMenu ? 3 : 0;
      const targetCameraPos = [
        characterPosition[0] + 8 + menuOffsetX,
        characterPosition[1] + 7,
        characterPosition[2] + 8
      ];

      camera.position.set(
        0 + eased * targetCameraPos[0],
        40 - eased * (40 - targetCameraPos[1]),
        40 - eased * (40 - targetCameraPos[2])
      );
      camera.lookAt(characterPosition[0] + menuOffsetX, characterPosition[1], characterPosition[2]);
      
      if (t >= 1) {
        onIntroComplete();
      }
    } else if (isFollowingCharacter.current && !isUsingOrbitControls.current && !hasUsedOrbitControls.current) {
      const characterPosition = characterControllerRef.current?.getPosition() || [0, 0.22, 0];
      
      // Calculate target positions
      const menuOffsetX = showMenu ? -5 : 0;
      const menuOffsetZ = showMenu ? -1 : 0;
      const menuOffsetY = showMenu ? -3 : 0;
      
      const targetPos = new THREE.Vector3(
        characterPosition[0] + 8 + menuOffsetX,
        characterPosition[1] + 7 + menuOffsetY,
        characterPosition[2] + 8 + menuOffsetZ
      );
      const targetLookAt = new THREE.Vector3(
        characterPosition[0] + menuOffsetX, 
        characterPosition[1] + menuOffsetY, 
        characterPosition[2] + menuOffsetZ
      );

      // Handle smooth camera animation
      if (cameraAnimationRef.current.isAnimating) {
        const elapsed = Date.now() - cameraAnimationRef.current.startTime;
        const animationDuration = 1000; // 1 second
        const t = Math.min(elapsed / animationDuration, 1);
        
        // Smooth easing function
        const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        // Interpolate camera position
        camera.position.lerpVectors(cameraAnimationRef.current.startPos, targetPos, easedT);
        
        // Interpolate look at position
        const currentLookAt = cameraAnimationRef.current.startLookAt.clone();
        currentLookAt.lerp(targetLookAt, easedT);
        camera.lookAt(currentLookAt);
        
        // End animation
        if (t >= 1) {
          cameraAnimationRef.current.isAnimating = false;
          camera.position.copy(targetPos);
          camera.lookAt(targetLookAt);
        }
      } else {
        // Direct camera following (no animation)
        camera.position.copy(targetPos);
        camera.lookAt(targetLookAt);
      }
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
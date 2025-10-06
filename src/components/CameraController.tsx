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
  showContent: boolean;
  isTransitioning: boolean;
  showLoadingScreen: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({
  characterControllerRef,
  introComplete,
  onIntroComplete,
  isCharacterMoving,
  showMenu,
  showContent,
  isTransitioning,
  showLoadingScreen
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

  // Reset intro time when loading screen changes
  useEffect(() => {
    if (showLoadingScreen) {
      introTimeRef.current = 0;
    }
  }, [showLoadingScreen]);

  // Handle smooth camera animation when menu or content box state changes
  useEffect(() => {
    if (introComplete && !isUsingOrbitControls.current) {
      // Start camera animation when menu or content box visibility changes
      const characterPosition = characterControllerRef.current?.getPosition() || [0, 0.22, 0];
      
      cameraAnimationRef.current = {
        isAnimating: true,
        startTime: Date.now(),
        startPos: camera.position.clone(),
        startLookAt: new THREE.Vector3(characterPosition[0], characterPosition[1], characterPosition[2])
      };
    }
  }, [showMenu, showContent, isTransitioning, introComplete, camera.position, characterControllerRef]);

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
    if (showLoadingScreen) {
      // Loading screen state - show preview from far away
      camera.position.set(0, 40, 40);
      camera.lookAt(0, 0.22, 0);
      // Reset intro time when in loading screen
      introTimeRef.current = 0;
    } else if (!introComplete) {
      // Intro animation
      introTimeRef.current += delta;
      const t = Math.min(introTimeRef.current / introDuration, 1);
      
      const eased = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Animate camera from far to close 
             const characterPosition = characterControllerRef.current?.getPosition() || [0, 0.22, 0];
             const menuOffsetX = showMenu && !isTransitioning ? 3 : 0;
             const contentOffsetX = showContent && !isTransitioning ? -3 : 0;
      
      // Responsive camera positioning 
      const width = window.innerWidth;
      let cameraDistance = 8;
      let cameraHeight = 7;
      if (width <= 1024) { 
        cameraDistance = 11.5;
        cameraHeight = 8.5;
      } else if (width <= 1366) { 
        cameraDistance = 10;
        cameraHeight = 8;
      } else if (width >= 1600) { 
        cameraDistance = 9;
        cameraHeight = 7.5;
      }
      
      // Zoom in when content box is open (but not during transition)
      if (showContent && !isTransitioning) {
        cameraDistance *= 0.7; 
        cameraHeight *= 0.8; 
      }
      
             const targetCameraPos = [
               characterPosition[0] + cameraDistance + menuOffsetX + contentOffsetX,
               characterPosition[1] + cameraHeight,
               characterPosition[2] + cameraDistance
             ];

      camera.position.set(
        0 + eased * targetCameraPos[0],
        40 - eased * (40 - targetCameraPos[1]),
        40 - eased * (40 - targetCameraPos[2])
      );
             camera.lookAt(characterPosition[0] + menuOffsetX + contentOffsetX, characterPosition[1], characterPosition[2]);
      
      if (t >= 1) {
        onIntroComplete();
      }
    } else if (isFollowingCharacter.current && !isUsingOrbitControls.current && !hasUsedOrbitControls.current) {
      const characterPosition = characterControllerRef.current?.getPosition() || [0, 0.22, 0];
      
             // Calculate target positions
             const menuOffsetX = showMenu && !isTransitioning ? -5 : 0;
             const menuOffsetZ = showMenu && !isTransitioning ? -1 : 0;
             const menuOffsetY = showMenu && !isTransitioning ? -3 : 0;
             const contentOffsetX = showContent && !isTransitioning ? 4 : 0;
             const contentOffsetZ = showContent && !isTransitioning ? -2 : 0;
             const contentOffsetY = showContent && !isTransitioning ? 2 : 0;
      
      // Responsive camera positioning 
      const width = window.innerWidth;
      let cameraDistance = 8;
      let cameraHeight = 7;
      if (width <= 1024) { 
        cameraDistance = 11.5;
        cameraHeight = 8.5;
      } else if (width <= 1366) { 
        cameraDistance = 10;
        cameraHeight = 8;
      } else if (width >= 1600) { 
        cameraDistance = 9;
        cameraHeight = 7.5;
      }
      
      // Zoom in when content box is open (but not during transition)
      if (showContent && !isTransitioning) {
        cameraDistance *= 0.6; 
        cameraHeight *= 0.5; 
      }
      
             const targetPos = new THREE.Vector3(
               characterPosition[0] + cameraDistance + menuOffsetX + contentOffsetX,
               characterPosition[1] + cameraHeight + menuOffsetY + contentOffsetY,
               characterPosition[2] + cameraDistance + menuOffsetZ + contentOffsetZ
             );
             const targetLookAt = new THREE.Vector3(
               characterPosition[0] + menuOffsetX + contentOffsetX,
               characterPosition[1] + menuOffsetY + contentOffsetY,
               characterPosition[2] + menuOffsetZ + contentOffsetZ
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
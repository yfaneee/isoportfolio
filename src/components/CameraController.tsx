import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
  isNavigatingSlabs?: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({
  characterControllerRef,
  introComplete,
  onIntroComplete,
  isCharacterMoving,
  showMenu,
  showContent,
  isTransitioning,
  showLoadingScreen,
  isNavigatingSlabs = false
}) => {
  const { camera } = useThree();
  const introTimeRef = useRef(0);
  const introDuration = 3;
  const introCompleteTimeRef = useRef(0);
  const cameraAnimationRef = useRef<{isAnimating: boolean, startTime: number, startPos: THREE.Vector3, startLookAt: THREE.Vector3}>({
    isAnimating: false,
    startTime: 0,
    startPos: new THREE.Vector3(),
    startLookAt: new THREE.Vector3()
  });


  // Reset intro time when loading screen changes
  useEffect(() => {
    if (showLoadingScreen) {
      introTimeRef.current = 0;
    }
  }, [showLoadingScreen]);

  // Handle camera animation 
  const prevNavigatingRef = useRef(isNavigatingSlabs);
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0.22, 0));
  
  // Cache responsive camera settings to avoid recalculating every frame
  const cameraSettingsRef = useRef({ distance: 8, height: 7 });
  const lastWindowWidthRef = useRef(window.innerWidth);
  const frameSkipCounterRef = useRef(0);
  
  useEffect(() => {
    if (introComplete) {
      const wasNavigating = prevNavigatingRef.current;
      const isNavigatingOff = wasNavigating && !isNavigatingSlabs;
      
      prevNavigatingRef.current = isNavigatingSlabs;
      
      if (isNavigatingOff) {
        return;
      }
    
      cameraAnimationRef.current = {
        isAnimating: true,
        startTime: Date.now(),
        startPos: camera.position.clone(),
        startLookAt: currentLookAtRef.current.clone()
      };
    }
  }, [showMenu, showContent, isTransitioning, isNavigatingSlabs, introComplete, camera.position, characterControllerRef]);

  useFrame((state, delta) => {
    // Update camera settings periodically (not every frame to save CPU)
    frameSkipCounterRef.current++;
    if (frameSkipCounterRef.current % 30 === 0) { // Check every 30 frames (~0.5 seconds)
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastWindowWidthRef.current) > 50) {
        let cameraDistance = 8;
        let cameraHeight = 7;
        
        if (currentWidth <= 1024) { 
          cameraDistance = 11.5;
          cameraHeight = 8.5;
        } else if (currentWidth <= 1366) { 
          cameraDistance = 10;
          cameraHeight = 8;
        } else if (currentWidth >= 1600) { 
          cameraDistance = 9;
          cameraHeight = 7.5;
        }
        
        cameraSettingsRef.current = { distance: cameraDistance, height: cameraHeight };
        lastWindowWidthRef.current = currentWidth;
      }
    }
    
    if (showLoadingScreen) {
      // Loading screen state - show preview from far away
      camera.position.set(0, 40, 40);
      camera.lookAt(0, 0.22, 0);
      currentLookAtRef.current.set(0, 0.22, 0);
      // Reset intro time when in loading screen
      introTimeRef.current = 0;
      return; // Early return - no need to process further
    } else if (!introComplete) {
      // Intro animation
      introTimeRef.current += delta;
      const t = Math.min(introTimeRef.current / introDuration, 1);
      
      const eased = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Animate camera from far to close - use fixed collision height during intro
             const characterPosition = [0, 0.22, 0]; // Fixed position during intro to prevent camera jump
             const menuOffsetX = showMenu && !isTransitioning ? 3 : 0;
             const contentOffsetX = showContent && !isTransitioning ? -3 : 0;
      
      // Use cached responsive camera positioning
      let cameraDistance = cameraSettingsRef.current.distance;
      let cameraHeight = cameraSettingsRef.current.height;
      
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
             const introLookAtX = characterPosition[0] + menuOffsetX + contentOffsetX;
             const introLookAtY = characterPosition[1];
             const introLookAtZ = characterPosition[2];
             camera.lookAt(introLookAtX, introLookAtY, introLookAtZ);
             currentLookAtRef.current.set(introLookAtX, introLookAtY, introLookAtZ);
      
      if (t >= 1) {
        onIntroComplete();
      }
    } else {
      if (introCompleteTimeRef.current === 0) {
        introCompleteTimeRef.current = Date.now();
      }
      
      const actualCharacterPosition = characterControllerRef.current?.getPosition() || [0, 0.22, 0];
      const introEndPosition = [0, 0.22, 0]; 
      
      const transitionDuration = 300; 
      const timeSinceIntroComplete = Date.now() - introCompleteTimeRef.current;
      const transitionProgress = Math.min(timeSinceIntroComplete / transitionDuration, 1);
      
      // Smooth easing
      const eased = transitionProgress < 0.5 
        ? 2 * transitionProgress * transitionProgress 
        : 1 - Math.pow(-2 * transitionProgress + 2, 2) / 2;
      
      const characterPosition = [
        introEndPosition[0] + (actualCharacterPosition[0] - introEndPosition[0]) * eased,
        introEndPosition[1] + (actualCharacterPosition[1] - introEndPosition[1]) * eased,
        introEndPosition[2] + (actualCharacterPosition[2] - introEndPosition[2]) * eased
      ];
      
             // Calculate target positions
             const menuOffsetX = showMenu && !isTransitioning ? -5 : 0;
             const menuOffsetZ = showMenu && !isTransitioning ? -1 : 0;
             const menuOffsetY = showMenu && !isTransitioning ? -3 : 0;
             const contentOffsetX = showContent && !isTransitioning ? 4 : 0;
             const contentOffsetZ = showContent && !isTransitioning ? -2 : 0;
             const contentOffsetY = showContent && !isTransitioning ? 2 : 0;
      
      // Use cached responsive camera positioning
      let cameraDistance = cameraSettingsRef.current.distance;
      let cameraHeight = cameraSettingsRef.current.height;
      
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
        
        // Store current look-at for next animation
        currentLookAtRef.current.copy(currentLookAt);
        
        // End animation
        if (t >= 1) {
          cameraAnimationRef.current.isAnimating = false;
          camera.position.copy(targetPos);
          camera.lookAt(targetLookAt);
          currentLookAtRef.current.copy(targetLookAt);
        }
      } else {
        // Direct camera following (no animation)
        camera.position.copy(targetPos);
        camera.lookAt(targetLookAt);
        // Store current look-at for next animation
        currentLookAtRef.current.copy(targetLookAt);
      }
    }
  });

  return null;
};

export default CameraController;
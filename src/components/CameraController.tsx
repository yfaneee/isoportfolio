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
  
  const zoomFactorRef = useRef(1.0);
  const targetZoomRef = useRef(1.0); 
  const minZoom = 1.0; 
  const maxZoom = 3.5; 
  const wasMovingRef = useRef(false);
  
  // Pan/drag state
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const cameraPanOffsetRef = useRef(new THREE.Vector3(0, 0, 0));

  // Reset intro time when loading screen changes
  useEffect(() => {
    if (showLoadingScreen) {
      introTimeRef.current = 0;
    }
  }, [showLoadingScreen]);

  // Reset zoom and pan 
  useEffect(() => {
    if (isCharacterMoving && !wasMovingRef.current) {
      targetZoomRef.current = 1.0;
      cameraPanOffsetRef.current.set(0, 0, 0); 
    }
    wasMovingRef.current = isCharacterMoving;
  }, [isCharacterMoving]);

  // Mouse wheel zoom handler
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Disable zoom during intro
      if (!introComplete) {
        event.preventDefault();
        return;
      }
      
      // Check if the wheel event is over a scrollable UI element
      const target = event.target as HTMLElement;
      
      // Allow scrolling in content areas, menus, or any scrollable container
      if (target) {
        let element: HTMLElement | null = target;
        while (element) {
          // Check if element is scrollable or is a UI component that needs scrolling
          const hasScroll = element.scrollHeight > element.clientHeight;
          const isScrollable = window.getComputedStyle(element).overflowY !== 'visible';
          const isContentArea = element.classList.contains('content-box') || 
                                element.classList.contains('content-box-body') ||
                                element.classList.contains('examples-container') ||
                                element.classList.contains('info-panel') ||
                                element.classList.contains('info-content') ||
                                element.classList.contains('menu-overlay') ||
                                element.classList.contains('menu-content') ||
                                element.classList.contains('menu') ||
                                element.classList.contains('panel');
          
          if ((hasScroll && isScrollable) || isContentArea) {
            // Let the default scroll behavior happen
            return;
          }
          element = element.parentElement;
        }
      }
      
      // If not over UI, zoom the camera
      event.preventDefault();
      
      // Adjust zoom based on wheel delta
      const zoomSpeed = 0.001;
      const delta = event.deltaY * zoomSpeed;
      
      targetZoomRef.current = Math.max(minZoom, Math.min(maxZoom, targetZoomRef.current + delta));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [minZoom, maxZoom, introComplete]);

  // Mouse drag pan handler
  useEffect(() => {
    // Camera pan boundaries
    const panBoundaries = {
      x: { min: -25, max: 25 },
      z: { min: -25, max: 25 }
    };

    const handleMouseDown = (event: MouseEvent) => {
      // Disable mouse drag during intro
      if (!introComplete) {
        return;
      }
      
      if (event.button === 0) {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: event.clientX, y: event.clientY };
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = event.clientX - lastMousePosRef.current.x;
      const deltaY = event.clientY - lastMousePosRef.current.y;
      
      // Adjust pan speed based on zoom level (more zoomed out = faster pan)
      const panSpeed = 0.02 * zoomFactorRef.current;
      
      const angle = Math.PI / 4; 
      const cos45 = Math.cos(angle);
      const sin45 = Math.sin(angle);
      
      // Calculate new pan offset values
      const newPanX = cameraPanOffsetRef.current.x - (deltaX * cos45 + deltaY * sin45) * panSpeed;
      const newPanZ = cameraPanOffsetRef.current.z - (-deltaX * sin45 + deltaY * cos45) * panSpeed;
      
      // Clamp the pan offset within boundaries
      cameraPanOffsetRef.current.x = Math.max(panBoundaries.x.min, Math.min(panBoundaries.x.max, newPanX));
      cameraPanOffsetRef.current.z = Math.max(panBoundaries.z.min, Math.min(panBoundaries.z.max, newPanZ));
      
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [introComplete]);

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
    const zoomLerpSpeed = 0.1; 
    zoomFactorRef.current += (targetZoomRef.current - zoomFactorRef.current) * zoomLerpSpeed;
    
    // Update camera settings periodically 
    frameSkipCounterRef.current++;
    if (frameSkipCounterRef.current % 30 === 0) { 
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
      
      // Animate camera from far to close 
             const characterPosition = [0, 0.22, 0]; 
             const menuOffsetX = showMenu && !isTransitioning ? 3 : 0;
             const contentOffsetX = showContent && !isTransitioning ? -3 : 0;
      
      // Use cached responsive camera positioning
      let cameraDistance = cameraSettingsRef.current.distance;
      let cameraHeight = cameraSettingsRef.current.height;
      
      // Zoom in when content box is open
      if (showContent && !isTransitioning) {
        cameraDistance *= 0.7; 
        cameraHeight *= 0.8; 
      }
      
      // Apply zoom factor
      cameraDistance *= zoomFactorRef.current;
      cameraHeight *= zoomFactorRef.current;
      
             const targetCameraPos = [
               characterPosition[0] + cameraDistance + menuOffsetX + contentOffsetX + cameraPanOffsetRef.current.x,
               characterPosition[1] + cameraHeight,
               characterPosition[2] + cameraDistance + cameraPanOffsetRef.current.z
             ];

      camera.position.set(
        0 + eased * targetCameraPos[0],
        40 - eased * (40 - targetCameraPos[1]),
        40 - eased * (40 - targetCameraPos[2])
      );
             const introLookAtX = characterPosition[0] + menuOffsetX + contentOffsetX + cameraPanOffsetRef.current.x;
             const introLookAtY = characterPosition[1];
             const introLookAtZ = characterPosition[2] + cameraPanOffsetRef.current.z;
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
      
      // Apply zoom factor
      cameraDistance *= zoomFactorRef.current;
      cameraHeight *= zoomFactorRef.current;
      
             const targetPos = new THREE.Vector3(
               characterPosition[0] + cameraDistance + menuOffsetX + contentOffsetX + cameraPanOffsetRef.current.x,
               characterPosition[1] + cameraHeight + menuOffsetY + contentOffsetY,
               characterPosition[2] + cameraDistance + menuOffsetZ + contentOffsetZ + cameraPanOffsetRef.current.z
             );
             const targetLookAt = new THREE.Vector3(
              characterPosition[0] + menuOffsetX + contentOffsetX + cameraPanOffsetRef.current.x,
              characterPosition[1] + menuOffsetY + contentOffsetY,
              characterPosition[2] + menuOffsetZ + contentOffsetZ + cameraPanOffsetRef.current.z
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
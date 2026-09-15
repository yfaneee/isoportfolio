import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import { getBillboardTextureShared, BILLBOARD_TEXTURES } from '../utils/texturePreloader';

interface InteractiveBillboardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  billboardKey: string;
  websiteUrl?: string;
  interactive?: boolean;
  onBillboardInteraction?: (isHovering: boolean, billboardKey?: string) => void;
  onCameraAnimationStart?: () => void;
  onCameraAnimationEnd?: () => void;
  onShowWebsite?: (websiteUrl: string, billboardKey: string) => void;
  onHideWebsite?: () => void;
  triggerBillboardExit?: boolean;
  onBillboardExitComplete?: () => void;
  onRef?: (ref: any) => void;
  introComplete?: boolean;
}

const InteractiveBillboard: React.FC<InteractiveBillboardProps> = ({
  position,
  rotation,
  billboardKey,
  websiteUrl,
  interactive = false,
  onBillboardInteraction,
  onCameraAnimationStart,
  onCameraAnimationEnd,
  onShowWebsite,
  onHideWebsite,
  triggerBillboardExit = false,
  onBillboardExitComplete,
  onRef,
  introComplete = false
}) => {
  const { camera } = useThree();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Store original camera position and target
  const originalCameraPosition = useRef(new THREE.Vector3());
  const originalCameraTarget = useRef(new THREE.Vector3());
  const animationProgress = useRef(0);
  
  // Billboard dimensions
  const billboardWidth = 5;
  const billboardHeight = 2.7;
  const billboardDepth = 0.3;
  const screenRecess = 0.1;
  
  // Billboards with nothing to show are inert (no hover, no zoom)
  const isInteractive = interactive;

  // Use preloaded texture
  const websiteTexture = useRef<THREE.Texture | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const hasTexture = billboardKey in BILLBOARD_TEXTURES;

  useEffect(() => {
    if (!hasTexture) return;

    // Get preloaded texture from cache
    const texture = getBillboardTextureShared(billboardKey);
    
    if (texture) {
      websiteTexture.current = texture;
      setTextureLoaded(true);
    } else {
      // Preloading hasn't finished yet - keep checking until the texture is cached
      const retryTimer = setInterval(() => {
        const retryTexture = getBillboardTextureShared(billboardKey);
        if (retryTexture) {
          websiteTexture.current = retryTexture;
          setTextureLoaded(true);
          clearInterval(retryTimer);
        }
      }, 250);

      return () => clearInterval(retryTimer);
    }
    
    // No cleanup needed - texture is managed by the preloader
  }, [billboardKey, hasTexture]);

  // Clear hover state when movement keys are pressed 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || 
          key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
        if (isHovered) {
          setIsHovered(false);
          document.body.style.cursor = 'default';
          onBillboardInteraction?.(false, billboardKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, billboardKey, onBillboardInteraction]);

  // Target camera position 
  const targetCameraPosition = useMemo(() => new THREE.Vector3(
    position[0] + 1.5,
    position[1] + 1.2,
    position[2] + 2
  ), [position]);
  
  const targetCameraTarget = useMemo(() => new THREE.Vector3(
    position[0] + 0.2,
    position[1] + 1.35,
    position[2]
  ), [position]);

  const handleBillboardClick = React.useCallback((event: any) => {
    event.stopPropagation();
    
    // Disable billboard clicks during intro/loading
    if (!introComplete || !isInteractive) return;

    if (isAnimating) return;
    
    if (!isFullscreen) {
      // Start zoom in animation
      originalCameraPosition.current.copy(camera.position);
      originalCameraTarget.current.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()));
      
      setIsAnimating(true);
      setIsFullscreen(true);
      onCameraAnimationStart?.();
    }
    // Removed else clause 
  }, [isAnimating, isFullscreen, camera, onCameraAnimationStart, introComplete, isInteractive]);

  useFrame((state, delta) => {
    if (isAnimating) {
      const speed = 1.5; 
      
      if (isFullscreen) {
        // Zoom in animation with easing
        animationProgress.current = Math.min(animationProgress.current + delta * speed, 1);
        const easedProgress = animationProgress.current * animationProgress.current * (3 - 2 * animationProgress.current); 
        
        // Interpolate camera position
        camera.position.lerpVectors(
          originalCameraPosition.current,
          targetCameraPosition,
          easedProgress
        );
        
        // Smoothly look at the billboard content
        camera.lookAt(targetCameraTarget);
        
        if (animationProgress.current >= 1) {
          setIsAnimating(false);
          // Show website when zoom-in animation completes
          if (!showWebsite) {
            setShowWebsite(true);
            // Empty url = the overlay shows this billboard's documentation instead of a site
            onShowWebsite?.(websiteUrl ?? '', billboardKey);
          }
        }
      } else {
        // Zoom out animation with easing
        animationProgress.current = Math.max(animationProgress.current - delta * speed, 0);
        const easedProgress = animationProgress.current * animationProgress.current * (3 - 2 * animationProgress.current);
        
        // Interpolate back to original position
        camera.position.lerpVectors(
          originalCameraPosition.current,
          targetCameraPosition,
          easedProgress
        );
        
        // Interpolate camera target - create once and reuse
        camera.lookAt(
          originalCameraTarget.current.x + (targetCameraTarget.x - originalCameraTarget.current.x) * easedProgress,
          originalCameraTarget.current.y + (targetCameraTarget.y - originalCameraTarget.current.y) * easedProgress,
          originalCameraTarget.current.z + (targetCameraTarget.z - originalCameraTarget.current.z) * easedProgress
        );
        
        if (animationProgress.current <= 0) {
          setIsAnimating(false);
          animationProgress.current = 0;
        }
      }
    }
  });

  // Handle external exit trigger (from ESC or × button)
  useEffect(() => {
    if (triggerBillboardExit && isFullscreen) {
      // Start zoom out animation
      setShowWebsite(false);
      setIsAnimating(true);
      setIsFullscreen(false);
      onCameraAnimationEnd?.();
      onBillboardExitComplete?.();
    }
  }, [triggerBillboardExit, isFullscreen, onCameraAnimationEnd, onBillboardExitComplete]);

  // Expose handleBillboardClick function through ref
  useEffect(() => {
    if (onRef) {
      onRef({
        handleBillboardClick: () => handleBillboardClick({ stopPropagation: () => {} })
      });
    }
  }, [onRef, handleBillboardClick]);

  return (
    <group>
      {/* Pillar */}
      <Box
        position={position}
        args={[0.4, 2, 0.3]}
        rotation={rotation}
      >
        <meshStandardMaterial color={'#641E68'} />
      </Box>

      {/* Main screen frame (outer box) */}
      <Box
        position={[position[0] + 0.05, position[1] + 1.35, position[2] + 0.05]}
        rotation={rotation}
        args={[billboardWidth, billboardHeight, billboardDepth]}
      >
        <meshStandardMaterial color={'#641E68'} />
      </Box>


      {/* Screen content - shows actual website screenshot */}
      <Box
          position={[position[0] + 0.2, position[1] + 1.35, position[2] - 0.05 + billboardDepth/2 + screenRecess/2 + 0.05]}
          rotation={rotation}
          args={[billboardWidth - 0.6, billboardHeight - 0.6, 0.02]}
          onClick={handleBillboardClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            // Disable billboard hover during intro/loading
            if (!introComplete || !isInteractive) return;
            document.body.style.cursor = 'pointer';
            setIsHovered(true);
            onBillboardInteraction?.(true, billboardKey);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            // Disable billboard hover during intro/loading
            if (!introComplete || !isInteractive) return;
            document.body.style.cursor = 'default';
            setIsHovered(false);
            onBillboardInteraction?.(false, billboardKey);
          }}
        >
          {hasTexture && textureLoaded ? (
            <meshStandardMaterial 
              key="textured-material"
              map={websiteTexture.current}
              color="#ffffff"
              emissive={isHovered ? "#a580ff" : "#000000"}
              emissiveIntensity={isHovered ? 0.6 : 0}
              transparent={false}
            />
          ) : (
            <meshStandardMaterial 
              key="loading-material"
              color="#2a2a2a"
              emissive={isHovered ? "#a580ff" : "#000000"}
              emissiveIntensity={isHovered ? 0.3 : 0}
              transparent={false}
            />
          )}
      </Box>

      {/* Hover glow border effect - bright purple */}
      {isHovered && (
        <Box
          position={[position[0] + 0.2, position[1] + 1.35, position[2] - 0.05 + billboardDepth/2 + screenRecess/2 + 0.03]}
          rotation={rotation}
          args={[billboardWidth - 0.4, billboardHeight - 0.4, 0.02]}
        >
          <meshStandardMaterial 
            color="#a580ff"
            emissive="#a580ff"
            emissiveIntensity={1.2}
            transparent={true}
            opacity={0.6}
          />
        </Box>
      )}

    </group>
  );
};

export default InteractiveBillboard;

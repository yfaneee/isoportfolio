import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

interface InteractiveBillboardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  billboardKey: string;
  websiteUrl?: string;
  onCameraAnimationStart?: () => void;
  onCameraAnimationEnd?: () => void;
  onShowWebsite?: (websiteUrl: string, billboardKey: string) => void;
  onHideWebsite?: () => void;
  triggerBillboardExit?: boolean;
  onBillboardExitComplete?: () => void;
}

const InteractiveBillboard: React.FC<InteractiveBillboardProps> = ({
  position,
  rotation,
  billboardKey,
  websiteUrl = "https://your-website.com", 
  onCameraAnimationStart,
  onCameraAnimationEnd,
  onShowWebsite,
  onHideWebsite,
  triggerBillboardExit = false,
  onBillboardExitComplete
}) => {
  const { camera, gl } = useThree();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [iframeError, setIframeError] = useState(false);
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
  
  // Load the website screenshot texture directly with useRef
  const websiteTexture = useRef<THREE.Texture | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  
  useEffect(() => {
    // Load different textures for different billboards
    let imagePath = '';
    if (billboardKey === 'billboard1') {
      imagePath = '/images/castleportfolio.png';
    } else if (billboardKey === 'billboard2') {
      imagePath = '/images/hollemanproj.png';
    } else if (billboardKey === 'billboard3') {
      imagePath = '/images/spaceportfolio.png';
    } else if (billboardKey === 'billboard4') {
      imagePath = '/images/spotifyfolio.png';
    } else {
      return; 
    }
    
    const loader = new THREE.TextureLoader();
    loader.load(
      imagePath,
      (texture) => {
        // Configure the texture properly
        texture.flipY = true;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        
        websiteTexture.current = texture;
        setTextureLoaded(true);
      },
      undefined, // progress callback removed
      (error) => {
        console.error('Failed to load texture:', error);
      }
    );
  }, [billboardKey]);

  // Target camera position 
  const targetCameraPosition = new THREE.Vector3(
    position[0] + 1.5,
    position[1] + 1.2,
    position[2] + 2
  );
  const targetCameraTarget = new THREE.Vector3(
    position[0] + 0.2,
    position[1] + 1.35,
    position[2]
  );

  const handleBillboardClick = (event: any) => {
    event.stopPropagation();
    
    if (isAnimating) return;
    
    if (!isFullscreen) {
      // Start zoom in animation
      originalCameraPosition.current.copy(camera.position);
      originalCameraTarget.current.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()));
      
      setIsAnimating(true);
      setIsFullscreen(true);
      onCameraAnimationStart?.();
    } else {
      // Start zoom out animation
      setShowWebsite(false);
      onHideWebsite?.();
      setIsAnimating(true);
      setIsFullscreen(false);
      onCameraAnimationEnd?.();
    }
  };

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
            onShowWebsite?.(websiteUrl, billboardKey);
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
        
        // Interpolate camera target
        const currentTarget = new THREE.Vector3().lerpVectors(
          originalCameraTarget.current,
          targetCameraTarget,
          easedProgress
        );
        camera.lookAt(currentTarget);
        
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
            document.body.style.cursor = 'pointer';
            setIsHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'default';
            setIsHovered(false);
          }}
        >
          {(billboardKey === 'billboard1' || billboardKey === 'billboard2' || billboardKey === 'billboard3' || billboardKey === 'billboard4') && textureLoaded ? (
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
              key="red-material"
              color={isHovered ? "#ff6666" : "#ff0000"}
              emissive={isHovered ? "#a580ff" : "#000000"}
              emissiveIntensity={isHovered ? 0.8 : 0}
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

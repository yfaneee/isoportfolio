import React, { useState, useCallback } from 'react';
import IsometricWorld from '../components/IsometricWorldOptimized';
import CharacterController from '../components/CharacterController';
import CameraController from '../components/CameraController';
import PlatformDebugger from '../components/PlatformDebugger';

interface IsometricSceneProps {
  onIntroComplete: () => void;
  introComplete: boolean;
  showMenu: boolean;
  showContent: boolean;
  isTransitioning: boolean;
  onMovementStart: () => void;
  onSpacePress?: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  characterControllerRef: React.RefObject<any>;
  showLoadingScreen: boolean;
  characterOpacity?: number;
  characterScale?: number;
  characterRotationY?: number;
  characterPositionOffset?: [number, number, number];
  isNavigatingSlabs?: boolean;
  selectedCharacterModel: string;
  onPositionUpdate?: (position: { x: number; z: number }) => void;
  onSlabInteraction?: (isOnSlab: boolean, slabType?: string) => void;
  onBillboardInteraction?: (isHovering: boolean, billboardKey?: string) => void;
  onBillboardFullscreenStart?: () => void;
  onBillboardFullscreenEnd?: () => void;
  onShowWebsite?: (websiteUrl: string, billboardKey: string) => void;
  onHideWebsite?: () => void;
  showWebsiteOverlay?: boolean;
  triggerBillboardExit?: boolean;
  onBillboardExitComplete?: () => void;
  currentCharacterPosition?: [number, number, number];
  onBillboardRef?: (key: string, ref: any) => void;
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
}

const IsometricScene: React.FC<IsometricSceneProps> = ({
  onIntroComplete,
  introComplete,
  showMenu,
  showContent,
  isTransitioning,
  onMovementStart,
  onSpacePress,
  onNavigatePrev,
  onNavigateNext,
  characterControllerRef,
  showLoadingScreen,
  characterOpacity = 1,
  characterScale = 1,
  characterRotationY = 0,
  characterPositionOffset = [0, 0, 0],
  isNavigatingSlabs = false,
  selectedCharacterModel,
  onPositionUpdate,
  onSlabInteraction,
  onBillboardInteraction,
  onBillboardFullscreenStart,
  onBillboardFullscreenEnd,
  onShowWebsite,
  onHideWebsite,
  showWebsiteOverlay = false,
  triggerBillboardExit = false,
  onBillboardExitComplete,
  currentCharacterPosition = [0, 0, 0],
  onBillboardRef,
  onSlabHover,
  onSlabClick
}) => {
  const [isCharacterMoving, setIsCharacterMoving] = useState(false);

  // Handle character movement - hide menu when moving
  const handleMovementChange = useCallback((moving: boolean) => {
    setIsCharacterMoving(moving);
    if (moving) {
      onMovementStart();
    }
  }, [onMovementStart]);

  const handleIntroComplete = useCallback(() => {
    onIntroComplete();
  }, [onIntroComplete]);

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={1.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={2}
        castShadow={false}
      />
      <directionalLight 
        position={[-10, 10, -5]} 
        intensity={0.8}
        castShadow={false}
      />
      
      {/* Custom camera controller with intro animation */}
             <CameraController
               characterControllerRef={characterControllerRef}
               introComplete={introComplete}
               onIntroComplete={handleIntroComplete}
               isCharacterMoving={isCharacterMoving}
               showMenu={showMenu}
               showContent={showContent}
               isTransitioning={isTransitioning}
               showLoadingScreen={showLoadingScreen}
               isNavigatingSlabs={isNavigatingSlabs}
             />
      
      {/* The isometric world */}
      <IsometricWorld 
        onBillboardInteraction={onBillboardInteraction}
        onBillboardFullscreenStart={onBillboardFullscreenStart}
        onBillboardFullscreenEnd={onBillboardFullscreenEnd}
        onShowWebsite={onShowWebsite}
        onHideWebsite={onHideWebsite}
        triggerBillboardExit={triggerBillboardExit}
        onBillboardExitComplete={onBillboardExitComplete}
        characterPosition={currentCharacterPosition}
        onBillboardRef={onBillboardRef}
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
      />
      
      {/* Debug platform boundaries (red lines) */}
      <PlatformDebugger enabled={false} />
      
      {/* The playable character */}
      <CharacterController
        ref={characterControllerRef}
        onMovementChange={handleMovementChange}
        introComplete={introComplete}
        onSpacePress={onSpacePress}
        onNavigatePrev={onNavigatePrev}
        onNavigateNext={onNavigateNext}
        opacity={characterOpacity}
        scale={characterScale}
        rotationY={characterRotationY}
        positionOffset={characterPositionOffset}
        modelPath={selectedCharacterModel}
        onPositionUpdate={onPositionUpdate}
        onSlabInteraction={onSlabInteraction}
        disableMovement={showWebsiteOverlay}
      />
    </>
  );
};

export default IsometricScene;

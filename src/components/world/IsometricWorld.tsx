import React from 'react';
import MainGrid from './MainGrid';
import ExtendedGrid from './ExtendedGrid';
import FoundationBlocks from './FoundationBlocks';
import WallBlocks from './WallBlocks';
import StairSystems from './StairSystems';
import LearningOutcomesPlatform from './LearningOutcomesPlatform';
import ArtworkPlatform from './ArtworkPlatform';
import ProjectPlatforms from './ProjectPlatforms';

// ============================================================================
// MAIN COMPONENT
// ============================================================================
interface IsometricWorldProps {
  onBillboardInteraction?: (isHovering: boolean, billboardKey?: string) => void;
  onBillboardFullscreenStart?: () => void;
  onBillboardFullscreenEnd?: () => void;
  onShowWebsite?: (websiteUrl: string, billboardKey: string) => void;
  onHideWebsite?: () => void;
  triggerBillboardExit?: boolean;
  onBillboardExitComplete?: () => void;
  onBillboardRef?: (key: string, ref: any) => void;
  onSlabHover?: (slabId: string | null, screenPosition?: { x: number; y: number }) => void;
  onSlabClick?: (slabId: string) => void;
  introComplete: boolean;
  activeSlabId?: string | null;
  introProgress?: number;
}

const IsometricWorld: React.FC<IsometricWorldProps> = ({ 
  onBillboardInteraction,
  onBillboardFullscreenStart, 
  onBillboardFullscreenEnd,
  onShowWebsite,
  onHideWebsite,
  triggerBillboardExit,
  onBillboardExitComplete,
  onBillboardRef,
  onSlabHover,
  onSlabClick,
  introComplete,
  activeSlabId,
  introProgress = 0
}) => {
  return (
    <group>
      <FoundationBlocks />
      <MainGrid onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} activeSlabId={activeSlabId} />
      <ExtendedGrid onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} />
      <WallBlocks onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} activeSlabId={activeSlabId} />
      <StairSystems onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} activeSlabId={activeSlabId} />
      <LearningOutcomesPlatform onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} />
      <ArtworkPlatform onSlabHover={onSlabHover} onSlabClick={onSlabClick} introComplete={introComplete} activeSlabId={activeSlabId} />
      <ProjectPlatforms 
        onBillboardInteraction={onBillboardInteraction}
        onBillboardFullscreenStart={onBillboardFullscreenStart}
        onBillboardFullscreenEnd={onBillboardFullscreenEnd}
        onShowWebsite={onShowWebsite}
        onHideWebsite={onHideWebsite}
        triggerBillboardExit={triggerBillboardExit}
        onBillboardExitComplete={onBillboardExitComplete}
        onBillboardRef={onBillboardRef}
        onSlabHover={onSlabHover}
        onSlabClick={onSlabClick}
        introComplete={introComplete}
        activeSlabId={activeSlabId}
      />
      {/* Intro light beam */}
      <spotLight
        position={[0, 12, 0]}
        angle={0.6}
        penumbra={0.6}
        intensity={2 * Math.max(0, Math.min(Math.max((introProgress - 0.35) / 0.25, 0), 1)) * (1 - Math.min(Math.max((introProgress - 0.85) / 0.15, 0), 1))}
        color={'#ffdca8'}
        castShadow={false}
      />
    </group>
  );
};

export default IsometricWorld;

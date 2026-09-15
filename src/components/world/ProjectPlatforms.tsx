import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import InteractiveBillboard from '../InteractiveBillboard';
import InteractiveOutlineButton from '../InteractiveOutlineButton';
import InteractiveGitModel from './InteractiveGitModel';
import InstancedBoxes from './InstancedBoxes';
import type { InstanceData } from './InstancedBoxes';

// ============================================================================
// PROJECT PLATFORMS 
// ============================================================================
interface ProjectPlatformsProps {
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
}

const ProjectPlatforms = React.memo<ProjectPlatformsProps>(({ 
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
  activeSlabId
}) => {
  const floorColor = '#641E68';
  const floorSize = 1.5;
  const floorHeight = 0.3;
  const spacing = 1.5;
  const platform18x3Y = -floorHeight * 9;
  const platform18x3StartZ = 1 * spacing + spacing * 1.4 + spacing * 0.3 * 9;
  
  // Billboard/Screen structure dimensions
  const billboardPillarHeight = 2;

  // Generate 18x3 platform instances (54 boxes)
  const platform18x3Instances = useMemo(() => {
    const instances: InstanceData[] = [];
    for (let i = 0; i < 54; i++) {
      const x = Math.floor(i / 18);
      const z = i % 18;
      const platformX = (x - 1) * spacing; 
      const platformZ = platform18x3StartZ + z * spacing;
      instances.push({ position: [platformX, platform18x3Y, platformZ] });
    }
    return instances;
  }, [spacing, platform18x3Y, platform18x3StartZ]);
  
  return (
    <>
      {/* Downward stairs  */}
      {Array.from({ length: 9 }, (_, step) => {
        const y = -floorHeight * (step + 1);
        const z = 1 * spacing + spacing * 0.4 + spacing * 0.3 * (step + 1);
        
        return (
          <Box
            key={`down-stair-${step + 1}`}
            position={[0, y, z]}
          args={[floorSize, floorHeight, floorSize]}
        >
            <meshStandardMaterial color={'#C5A3FF'} />
        </Box>
      );
      })}
      
      {/* 18x3 Platform - INSTANCED */}
      <InstancedBoxes 
        instances={platform18x3Instances}
        args={[floorSize, floorHeight, floorSize]}
        color={floorColor}
      />
      
      {/* Project slabs on 18x3 platform - Interactive GitHub Git models */}
      {[
        { index: 2, key: 'project-slab-1', slabId: 'github-castle' },
        { index: 7, key: 'project-slab-2', slabId: 'github-holleman' },
        { index: 12, key: 'project-slab-3', slabId: 'github-space' },
        { index: 17, key: 'project-slab-4', slabId: 'github-spotify' }
      ].map((slab) => (
        <InteractiveGitModel
          key={slab.key}
          position={[1.2, platform18x3Y + floorHeight/2 + 0.07, platform18x3StartZ + slab.index * spacing - 1.5]}
          slabId={slab.slabId}
          onSlabHover={onSlabHover}
          onSlabClick={onSlabClick}
          introComplete={introComplete}
          isActive={activeSlabId === slab.slabId}
        />
      ))}

      {/* NEW OUTLINE BUTTON SLABS for website interaction - with hover effect */}
      {[
        { index: 2, key: 'outline-button-1', z: 9.15, slabId: 'website-castle' },
        { index: 7, key: 'outline-button-2', z: 16.65, slabId: 'website-holleman' },
        { index: 12, key: 'outline-button-3', z: 24.15, slabId: 'website-space' },
        { index: 17, key: 'outline-button-4', z: 31.65, slabId: 'website-spotify' }
      ].map((button) => (
        <InteractiveOutlineButton
          key={button.key}
          position={[-1, 0, 0]}
          index={button.index}
          z={button.z}
          slabId={button.slabId}
          platform18x3Y={platform18x3Y}
          platform18x3StartZ={platform18x3StartZ}
          spacing={spacing}
          floorHeight={floorHeight}
          floorSize={floorSize}
          onSlabHover={onSlabHover}
          onSlabClick={onSlabClick}
          introComplete={introComplete}
          activeSlabId={activeSlabId}
        />
      ))}

      {/* Extensions for billboard */}
      {[
        { row: 2, key: 'platform-18x3-row2-extension' },
        { row: 7, key: 'platform-18x3-row7-extension' },
        { row: 12, key: 'platform-18x3-row12-extension' },
        { row: 17, key: 'platform-18x3-row17-extension' }
      ].map(extension => (
        <Box
          key={extension.key}
          position={[-2.5 * spacing, platform18x3Y, platform18x3StartZ + (extension.row - 1) * spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
          <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
      ))}

      {/* Triangular pieces for all billboard extension rows */}
      {(() => {
        const triSize = floorSize * 0.75;
        return [
          { row: 2, keyPrefix: 'ext-tri-row2' },
          { row: 7, keyPrefix: 'ext-tri-row7' },
          { row: 12, keyPrefix: 'ext-tri-row12' },
          { row: 17, keyPrefix: 'ext-tri-row17' }
        ].map(rowData => [
        // Right triangle 
          { x: -2.5 * spacing + spacing * 0.5, z: platform18x3StartZ + (rowData.row - 1) * spacing + spacing * 0.5, rotation: -Math.PI / 2, key: `${rowData.keyPrefix}-right` },
        // Left triangle 
          { x: -2.5 * spacing + spacing * 0.5, z: platform18x3StartZ + (rowData.row - 1) * spacing - spacing * 0.5, rotation: Math.PI / 1, key: `${rowData.keyPrefix}-left` },
        ]).flat().map(tri => {
        const triGeo = new THREE.BufferGeometry();
        const triVerts = new Float32Array([
          0, 0, 0, triSize, 0, 0, 0, 0, triSize,
          0, floorHeight, 0, triSize, floorHeight, 0, 0, floorHeight, triSize,
        ]);
        
        const triIndices = [0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0];
        
        triGeo.setAttribute('position', new THREE.BufferAttribute(triVerts, 3));
        triGeo.setIndex(triIndices);
        triGeo.computeVertexNormals();

          return (
          <mesh
            key={tri.key}
            position={[tri.x, platform18x3Y - floorHeight/2, tri.z]}
            rotation={[0, tri.rotation, 0]}
          >
            <primitive object={triGeo} attach="geometry" />
            <meshStandardMaterial
              color={'#C5A3FF'}
              flatShading={true}
            />
          </mesh>
        );
        });
      })()}

      {/* Interactive Billboard/Screen structures */}
      {[
        { row: 2, key: 'billboard1', websiteUrl: 'https://castle-portfolio.vercel.app/' },
        { row: 7, key: 'billboard2', websiteUrl: 'https://holleman.vercel.app/' },
        { row: 12, key: 'billboard3', websiteUrl: 'https://space-portfolio-one-mu.vercel.app/' },
        { row: 17, key: 'billboard4', websiteUrl: 'https://spotify-folio.vercel.app/' }
      ].map(billboard => {
        const billboardX = -2.5 * spacing + spacing * 0.5 - 0.7;
        const billboardZ = platform18x3StartZ + (billboard.row - 1) * spacing;
        // EXACT ORIGINAL FORMULA 
        const billboardY = platform18x3Y + billboardPillarHeight/2;
        
        return (
          <InteractiveBillboard
            key={billboard.key}
            position={[billboardX, billboardY, billboardZ]}
        rotation={[0, Math.PI / 4, 0]} 
            billboardKey={billboard.key}
            websiteUrl={billboard.websiteUrl}
            onBillboardInteraction={onBillboardInteraction}
            onCameraAnimationStart={onBillboardFullscreenStart}
            onCameraAnimationEnd={onBillboardFullscreenEnd}
            onShowWebsite={onShowWebsite}
            onHideWebsite={onHideWebsite}
            triggerBillboardExit={triggerBillboardExit}
            onBillboardExitComplete={onBillboardExitComplete}
            onRef={(ref) => onBillboardRef?.(billboard.key, ref)}
            introComplete={introComplete}
          />
        );
      })}
    </>
  );
});

export default ProjectPlatforms;

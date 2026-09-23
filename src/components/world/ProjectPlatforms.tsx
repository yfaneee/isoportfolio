import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import InteractiveBillboard from '../InteractiveBillboard';
import InteractiveOutlineButton from '../InteractiveOutlineButton';
import InstancedBoxes from './InstancedBoxes';
import type { InstanceData } from './InstancedBoxes';
import { BILLBOARDS, BILLBOARD_ROTATION, getBillboardPosition, WEBSITE_SLABS, WORK_PLATFORM_ROWS, WORK_PLATFORM_START_Z } from '../../data/InteractionZones';

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
  const platform18x3StartZ = WORK_PLATFORM_START_Z;

  // Generate 3-wide work platform instances
  const platform18x3Instances = useMemo(() => {
    const instances: InstanceData[] = [];
    for (let i = 0; i < WORK_PLATFORM_ROWS * 3; i++) {
      const x = Math.floor(i / WORK_PLATFORM_ROWS);
      const z = i % WORK_PLATFORM_ROWS;
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
      
      {/* Outline buttons in front of each billboard - with hover effect */}
      {WEBSITE_SLABS.map((button, i) => (
        <InteractiveOutlineButton
          key={button.id}
          position={[-1, 0, 0]}
          index={BILLBOARDS[i].row}
          z={button.z}
          slabId={button.id}
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
      {BILLBOARDS.map(extension => (
        <Box
          key={`platform-row${extension.row}-extension`}
          position={[-2.5 * spacing, platform18x3Y, platform18x3StartZ + (extension.row - 1) * spacing]}
        args={[floorSize, floorHeight, floorSize]}
      >
          <meshStandardMaterial color={'#C5A3FF'} />
      </Box>
      ))}

      {/* Triangular pieces for all billboard extension rows */}
      {(() => {
        const triSize = floorSize * 0.75;
        return BILLBOARDS.map(({ row }) => ({ row, keyPrefix: `ext-tri-row${row}` })).map(rowData => [
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
      {BILLBOARDS.map(billboard => {
        return (
          <InteractiveBillboard
            key={billboard.key}
            position={getBillboardPosition(billboard.row)}
            rotation={BILLBOARD_ROTATION}
            billboardKey={billboard.key}
            websiteUrl={billboard.url}
            interactive={!!(billboard.url || billboard.docs)}
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

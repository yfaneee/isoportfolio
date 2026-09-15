import { useState, useCallback } from 'react';

const SPACING = 1.5;
const GRID_5X5_CENTER_Z = -1 * SPACING - SPACING * 3 - (2 * SPACING);

// World areas that show a "Location discovered" banner the first time the character enters them
const AREAS = {
  projectStudio: {
    minX: -2.5 * SPACING, maxX: 2.5 * SPACING,
    minZ: GRID_5X5_CENTER_Z - 2.5 * SPACING, maxZ: GRID_5X5_CENTER_Z + 2.5 * SPACING,
    trackId: 'project-studio'
  },
  learningOutcomes: { minX: -14, maxX: -7, minZ: -2, maxZ: 2, trackId: 'learning-outcomes' },
  artwork: { minX: 6, maxX: 12, minZ: -2, maxZ: 2, trackId: 'artwork' },
  work: { minX: -2, maxX: 2, minZ: 7, maxZ: 33, trackId: 'work' }
};

type AreaKey = keyof typeof AREAS;

const isInArea = (area: typeof AREAS[AreaKey], x: number, z: number) =>
  x >= area.minX && x <= area.maxX && z >= area.minZ && z <= area.maxZ;

export function useLocationDiscovery(trackLocationVisit: (locationId: string) => void) {
  const [showLocationDiscovery, setShowLocationDiscovery] = useState(false);
  const [visited, setVisited] = useState<Record<AreaKey, boolean>>({
    projectStudio: false, learningOutcomes: false, artwork: false, work: false
  });
  const [showing, setShowing] = useState<Record<AreaKey, boolean>>({
    projectStudio: false, learningOutcomes: false, artwork: false, work: false
  });

  // Check if character is in specific areas for location discovery
  const handlePositionUpdate = useCallback((position: { x: number; z: number }) => {
    (Object.keys(AREAS) as AreaKey[]).forEach(key => {
      if (!visited[key] && !showing[key] && isInArea(AREAS[key], position.x, position.z)) {
        setVisited(prev => ({ ...prev, [key]: true }));
        setShowing(prev => ({ ...prev, [key]: true }));
        trackLocationVisit(AREAS[key].trackId);
      }
    });
  }, [visited, showing, trackLocationVisit]);

  const showInitialDiscovery = useCallback(() => setShowLocationDiscovery(true), []);
  const handleLocationDiscoveryComplete = useCallback(() => setShowLocationDiscovery(false), []);
  const handleProjectStudioDiscoveryComplete = useCallback(() => setShowing(prev => ({ ...prev, projectStudio: false })), []);
  const handleLearningOutcomesDiscoveryComplete = useCallback(() => setShowing(prev => ({ ...prev, learningOutcomes: false })), []);
  const handleArtworkDiscoveryComplete = useCallback(() => setShowing(prev => ({ ...prev, artwork: false })), []);
  const handleWorkDiscoveryComplete = useCallback(() => setShowing(prev => ({ ...prev, work: false })), []);

  return {
    handlePositionUpdate,
    showInitialDiscovery,
    showLocationDiscovery,
    showProjectStudioDiscovery: showing.projectStudio,
    showLearningOutcomesDiscovery: showing.learningOutcomes,
    showArtworkDiscovery: showing.artwork,
    showWorkDiscovery: showing.work,
    handleLocationDiscoveryComplete,
    handleProjectStudioDiscoveryComplete,
    handleLearningOutcomesDiscoveryComplete,
    handleArtworkDiscoveryComplete,
    handleWorkDiscoveryComplete
  };
}

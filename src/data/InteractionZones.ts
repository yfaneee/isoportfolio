// Shared definitions for interactive slabs, so positions/URLs/labels live in one place

export const SLAB_HALF_SIZE = 0.45;

export const isWithinSlab = (x: number, z: number, slabX: number, slabZ: number): boolean =>
  x >= slabX - SLAB_HALF_SIZE && x <= slabX + SLAB_HALF_SIZE &&
  z >= slabZ - SLAB_HALF_SIZE && z <= slabZ + SLAB_HALF_SIZE;

export const findSlabAt = <T extends { x: number; z: number }>(slabs: readonly T[], x: number, z: number): T | undefined =>
  slabs.find(slab => isWithinSlab(x, z, slab.x, slab.z));

export const isOnMiddleSlab = (x: number, z: number): boolean => isWithinSlab(x, z, 0, 0);

// GitHub project slabs on the 18x3 platform
export const GITHUB_SLABS = [
  { id: 'github-castle', x: 1.2, z: 9.15, url: 'https://github.com/yfaneee/CastlePortfolio' },
  { id: 'github-holleman', x: 1.2, z: 16.65, url: 'https://github.com/yfaneee/holleman' },
  { id: 'github-space', x: 1.2, z: 24.15, url: 'https://github.com/yfaneee/SpacePortfolio' },
  { id: 'github-spotify', x: 1.2, z: 31.65, url: 'https://github.com/yfaneee/SpotifyFolio' }
] as const;

// Website button slabs, each linked to a billboard
export const WEBSITE_SLABS = [
  { id: 'website-castle', x: -1, z: 9.15, url: 'https://castle-portfolio.vercel.app/', billboardKey: 'billboard1', label: 'View Castle Portfolio' },
  { id: 'website-holleman', x: -1, z: 16.65, url: 'https://holleman.vercel.app/', billboardKey: 'billboard2', label: 'View Holleman Project' },
  { id: 'website-space', x: -1, z: 24.15, url: 'https://space-portfolio-one-mu.vercel.app/', billboardKey: 'billboard3', label: 'View Space Portfolio' },
  { id: 'website-spotify', x: -1, z: 31.65, url: 'https://spotify-folio.vercel.app/', billboardKey: 'billboard4', label: 'View Spotify Portfolio' }
] as const;

export const BILLBOARD_PROMPT_TEXT: Record<string, string> = {
  billboard1: 'View Castle Portfolio',
  billboard2: 'View Holleman Project',
  billboard3: 'View Space Portfolio',
  billboard4: 'View Spotify Portfolio'
};

// Learning outcome slab id -> teleport location / content key
export const LO_SLAB_TARGETS: Record<string, { location: string; contentKey: string }> = {
  lo1: { location: 'conceptualize', contentKey: 'staircase-slab-1' },
  lo2: { location: 'transferable', contentKey: 'staircase-slab-2' },
  lo3: { location: 'creative', contentKey: 'staircase-slab-3' },
  lo4: { location: 'professional', contentKey: 'staircase-slab-4' },
  lo5: { location: 'leadership', contentKey: 'staircase-slab-5' }
};

// Other clickable slabs that teleport and open content
export const CONTENT_SLAB_TARGETS: Record<string, { location: string; contentKey: string }> = {
  'project-studio': { location: 'studio', contentKey: 'high-block-slab' },
  'smaller-block': { location: 'ironfilms', contentKey: 'smaller-block-slab' },
  artwork: { location: 'artwork', contentKey: 'artwork-platform-slab' }
};

// Text shown when hovering a slab with the mouse
export const getSlabHoverText = (slabId: string): string => {
  if (slabId.startsWith('lo')) {
    const loTexts: { [key: string]: string } = {
      'lo1': 'LO1: Conceptualize, design, and develop',
      'lo2': 'LO2: Transferable production',
      'lo3': 'LO3: Creative iterations',
      'lo4': 'LO4: Professional standards',
      'lo5': 'LO5: Personal leadership'
    };
    return loTexts[slabId] || 'View Content';
  } else if (slabId.startsWith('github-')) {
    return 'View on GitHub';
  } else if (slabId.startsWith('website-')) {
    return WEBSITE_SLABS.find(slab => slab.id === slabId)?.label || 'View Portfolio';
  } else if (slabId === 'main-slab') {
    return 'Open Menu';
  } else if (slabId === 'project-studio') {
    return 'Studio';
  } else if (slabId === 'smaller-block') {
    return 'IronFilms Project';
  } else if (slabId === 'artwork') {
    return 'Artwork';
  }
  return 'Interact';
};

// Text shown when the character stands on a slab
export const getSlabPromptText = (slabType?: string): string => {
  switch (slabType) {
    case 'main': return 'Menu';
    case 'lo1': return 'LO 1: Conceptualize & Design';
    case 'lo2': return 'LO 2: Transferable Production';
    case 'lo3': return 'LO 3: Creative Iterations';
    case 'lo4': return 'LO 4: Professional Standards';
    case 'lo5': return 'LO 5: Personal Leadership';
    case 'project-studio': return 'Studio SeaMonkeys';
    case 'smaller-block': return 'IronFilms Project';
    case 'artwork': return 'Artwork Gallery';
    case 'elevator': return 'Use Elevator';
    default:
      if (slabType?.startsWith('github-')) return 'Open GitHub';
      if (slabType?.startsWith('website-')) {
        return WEBSITE_SLABS.find(slab => slab.id === slabType)?.label || 'Interact';
      }
      return 'Interact';
  }
};

export const openExternalUrl = (url: string) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
};

// Maps a content slab key like "staircase-slab-3" to its achievement id ("lo3")
export const getLearningOutcomeIdFromSlabKey = (slabKey: string | null): string | null => {
  const match = slabKey?.match(/staircase-slab-(\d)/);
  return match ? `lo${match[1]}` : null;
};

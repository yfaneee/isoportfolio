export interface ExampleItem {
  id: string;
  title: string;
  description: string;
  image: string;
  pdfUrl: string;
}

export interface StudioContent {
  logo: string;
  missionTitle: string;
  missionText: string;
  brandGuideImage: string;
  brandGuideUrl: string;
  coreValuesTitle: string;
  coreValues: string[];
  artworkTitle: string;
  artworkImage: string;
}

export interface ArtworkGallery {
  images: string[];
}

export interface ProjectContent {
  intro: string;
  description: string;
  gsplatUrl: string;
  logo?: string;
  processText?: string;
  processPoints?: string[];
  images?: string[];
}

export interface ContentItem {
  title: string;
  description: string;
  details: string[];
  examples?: ExampleItem[];
  studioContent?: StudioContent;
  artworkGallery?: ArtworkGallery;
  projectContent?: ProjectContent;
  color: string;
}

export const contentData: Record<string, ContentItem> = {
  // Placeholder slabs, content to be filled in
  'staircase-slab-1': { title: '1', description: '', details: [], color: '#F5F5DC' },
  'staircase-slab-2': { title: '2', description: '', details: [], color: '#F5F5DC' },
  'staircase-slab-3': { title: '3', description: '', details: [], color: '#F5F5DC' },
  'staircase-slab-4': { title: '4', description: '', details: [], color: '#F5F5DC' },
  'staircase-slab-5': { title: '5', description: '', details: [], color: '#F5F5DC' },
  'smaller-block-slab': { title: '7', description: '', details: [], color: '#F5F5DC' },
  'artwork-platform-slab': {
    title: 'Artwork',
    description: '',
    details: [],
    artworkGallery: {
      images: [
        '/images/artwork/albumcover1.webp',
        '/images/artwork/blitzlogo.webp',
        '/images/artwork/Cover.webp',
        '/images/artwork/Cover2.webp',
        '/images/artwork/Cover23.webp',
        '/images/artwork/Cover24.webp',
        '/images/artwork/Desktop10.webp',
        '/images/artwork/Desktop7.webp',
        '/images/artwork/Desktop8.webp',
        '/images/artwork/Desktop9.webp',
        '/images/artwork/Frame21.webp',
        '/images/artwork/Group124.webp',
        '/images/artwork/Group126.webp',
        '/images/artwork/Group165.webp',
        '/images/artwork/Logo.webp',
        '/images/artwork/PosibleFinalStyleScapeGroup2.webp',
        '/images/artwork/postera1.webp',
        '/images/artwork/posterc1.webp',
        '/images/artwork/posterz1.webp',
        '/images/artwork/PrototypeFifth.webp',
        '/images/artwork/StylescapeWoodyFinal.webp',
        '/images/artwork/tee3.webp',
        '/images/artwork/tee4.webp'
      ]
    },
    color: '#F5F5DC'
  }
};

// Navigation order for slabs
export const slabNavigationOrder = [
  'staircase-slab-1',      
  'staircase-slab-2',      
  'staircase-slab-3',      
  'staircase-slab-4',      
  'staircase-slab-5',
  'smaller-block-slab',
  'artwork-platform-slab', 
];

// Get position key from coordinates
export const getSlabKeyFromPosition = (x: number, z: number): string | null => {
  const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;
  const isOnStaircaseSlab1 = x >= -11.075 && x <= -10.175 && z >= 1.05 && z <= 1.95;
  const isOnStaircaseSlab2 = x >= -14.075 && x <= -13.175 && z >= 1.05 && z <= 1.95;
  const isOnStaircaseSlab3 = x >= -14.075 && x <= -13.175 && z >= -1.95 && z <= -1.05;
  const isOnStaircaseSlab4 = x >= -11.075 && x <= -10.175 && z >= -1.95 && z <= -1.05;
  const isOnStaircaseSlab5 = x >= -8.075 && x <= -7.175 && z >= -1.95 && z <= -1.05;
  const isOnArtworkSlab = x >= 10.05 && x <= 10.95 && z >= -0.45 && z <= 0.45;
  
  if (isOnSmallerBlockSlab) return 'smaller-block-slab';
  if (isOnStaircaseSlab1) return 'staircase-slab-1';
  if (isOnStaircaseSlab2) return 'staircase-slab-2';
  if (isOnStaircaseSlab3) return 'staircase-slab-3';
  if (isOnStaircaseSlab4) return 'staircase-slab-4';
  if (isOnStaircaseSlab5) return 'staircase-slab-5';
  if (isOnArtworkSlab) return 'artwork-platform-slab';
  
  return null;
};

// Get location name for teleportToLocation from slab key
export const getLocationFromSlabKey = (slabKey: string): string => {
  const locationMap: Record<string, string> = {
    'staircase-slab-1': 'conceptualize',
    'staircase-slab-2': 'transferable',
    'staircase-slab-3': 'creative',
    'staircase-slab-4': 'professional',
    'staircase-slab-5': 'leadership',
    'smaller-block-slab': 'ironfilms',
    'artwork-platform-slab': 'artwork',
  };
  return locationMap[slabKey] || '';
};

export const getContentForSlab = (x: number, z: number): ContentItem | null => {
  // Check if on smaller-block-slab
  const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;

  // Staircase slabs 1-5 (5 is the highest)
  const isOnStaircaseSlab1 = x >= -11.075 && x <= -10.175 && z >= 1.05 && z <= 1.95;
  const isOnStaircaseSlab2 = x >= -14.075 && x <= -13.175 && z >= 1.05 && z <= 1.95;
  const isOnStaircaseSlab3 = x >= -14.075 && x <= -13.175 && z >= -1.95 && z <= -1.05;
  const isOnStaircaseSlab4 = x >= -11.075 && x <= -10.175 && z >= -1.95 && z <= -1.05;
  const isOnStaircaseSlab5 = x >= -8.075 && x <= -7.175 && z >= -1.95 && z <= -1.05;
  
  // Artwork platform slab: position [10.5, y, 0]
  const isOnArtworkSlab = x >= 10.05 && x <= 10.95 && z >= -0.45 && z <= 0.45;
  
  if (isOnSmallerBlockSlab) {
    return contentData['smaller-block-slab'];
  } else if (isOnStaircaseSlab1) {
    return contentData['staircase-slab-1'];
  } else if (isOnStaircaseSlab2) {
    return contentData['staircase-slab-2'];
  } else if (isOnStaircaseSlab3) {
    return contentData['staircase-slab-3'];
  } else if (isOnStaircaseSlab4) {
    return contentData['staircase-slab-4'];
  } else if (isOnStaircaseSlab5) {
    return contentData['staircase-slab-5'];
  } else if (isOnArtworkSlab) {
    return contentData['artwork-platform-slab'];
  }
  
  return null;
};

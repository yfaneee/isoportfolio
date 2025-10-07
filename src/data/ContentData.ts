export interface ContentItem {
  title: string;
  description: string;
  details: string[];
  color: string;
}

export const contentData: Record<string, ContentItem> = {
  'smaller-block-slab': {
    title: 'Project.',
    description: 'Project.',
    details: [
      '...'
    ],
    color: '#F5F5DC'
  },
  'high-block-slab': {
    title: 'Studio',
    description: 'Studio.',
    details: [
      '...'
    ],
    color: '#F5F5DC'
  },
  'staircase-slab-1': {
    title: 'Conceptualize & Design',
    description: '...',
    details: [
      '...'
    ],
    color: '#F5F5DC'
  },
  'staircase-slab-2': {
    title: 'Transferable Production',
    description: '...',
    details: [
      '...'
    ],
    color: '#F5F5DC'
  },
  'staircase-slab-3': {
    title: 'Creative Iterations',
    description: '...',
    details: [
      '...'
    ],
    color: '#F5F5DC'
  },
  'staircase-slab-4': {
    title: 'Professional Standards',
    description: '...',
    details: [
      '...'
    ],
    color: '#F5F5DC'
  },
  'staircase-slab-5': {
    title: 'Personal Leadership',
    description: '..',
    details: [
      '...'
    ],
    color: '#F5F5DC'
  },
  'artwork-platform-slab': {
    title: 'Artwork',
    description: 'Artwork.',
    details: [
      '...'
    ],
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
  'high-block-slab',       
  'smaller-block-slab',    
  'artwork-platform-slab', 
];

// Get position key from coordinates
export const getSlabKeyFromPosition = (x: number, z: number): string | null => {
  const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;
  const isOnHighBlockSlab = x >= 2.55 && x <= 3.45 && z >= -12.45 && z <= -11.55;
  const isOnStaircaseSlab1 = x >= -11.075 && x <= -10.175 && z >= 1.05 && z <= 1.95;
  const isOnStaircaseSlab2 = x >= -14.075 && x <= -13.175 && z >= 1.05 && z <= 1.95;
  const isOnStaircaseSlab3 = x >= -14.075 && x <= -13.175 && z >= -1.95 && z <= -1.05;
  const isOnStaircaseSlab4 = x >= -11.075 && x <= -10.175 && z >= -1.95 && z <= -1.05;
  const isOnStaircaseSlab5 = x >= -8.075 && x <= -7.175 && z >= -1.95 && z <= -1.05;
  const isOnArtworkSlab = x >= 10.05 && x <= 10.95 && z >= -0.45 && z <= 0.45;
  
  if (isOnSmallerBlockSlab) return 'smaller-block-slab';
  if (isOnHighBlockSlab) return 'high-block-slab';
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
    'high-block-slab': 'studio',
    'smaller-block-slab': 'ironfilms',
    'artwork-platform-slab': 'artwork',
  };
  return locationMap[slabKey] || '';
};

export const getContentForSlab = (x: number, z: number): ContentItem | null => {
  // Check if on smaller-block-slab
  const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;
  
  // Check if on high-block-slab 
  const isOnHighBlockSlab = x >= 2.55 && x <= 3.45 && z >= -12.45 && z <= -11.55;
  
  // Slab 1: position Conceptualize & Design
  const isOnStaircaseSlab1 = x >= -11.075 && x <= -10.175 && z >= 1.05 && z <= 1.95;
  
  // Slab 2: position Transferable Production
  const isOnStaircaseSlab2 = x >= -14.075 && x <= -13.175 && z >= 1.05 && z <= 1.95;
  
  // Slab 3: position  Creative Iterations
  const isOnStaircaseSlab3 = x >= -14.075 && x <= -13.175 && z >= -1.95 && z <= -1.05;
  
  // Slab 4: position Professional Standards
  const isOnStaircaseSlab4 = x >= -11.075 && x <= -10.175 && z >= -1.95 && z <= -1.05;
  
  // Slab 5: position Personal Leadership (highest)
  const isOnStaircaseSlab5 = x >= -8.075 && x <= -7.175 && z >= -1.95 && z <= -1.05;
  
  // Artwork platform slab: position [10.5, y, 0]
  const isOnArtworkSlab = x >= 10.05 && x <= 10.95 && z >= -0.45 && z <= 0.45;
  
  if (isOnSmallerBlockSlab) {
    return contentData['smaller-block-slab'];
  } else if (isOnHighBlockSlab) {
    return contentData['high-block-slab'];
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

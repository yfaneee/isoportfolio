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
  }
};

export const getContentForSlab = (x: number, z: number): ContentItem | null => {
  // Check if on smaller-block-slab (position [-1.5, y, -10.35], size 0.9 x 0.9)
  const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;
  
  // Check if on high-block-slab (position [3, y, -12], size 0.9 x 0.9)
  const isOnHighBlockSlab = x >= 2.55 && x <= 3.45 && z >= -12.45 && z <= -11.55;
  
  if (isOnSmallerBlockSlab) {
    return contentData['smaller-block-slab'];
  } else if (isOnHighBlockSlab) {
    return contentData['high-block-slab'];
  }
  
  return null;
};

export interface ExampleItem {
  id: string;
  title: string;
  description: string;
  image: string;
  pdfUrl: string;
  pdfPage?: number; 
}

export interface ContentItem {
  title: string;
  description: string;
  details: string[];
  examples?: ExampleItem[]; // New field for examples
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
    description: '',
    details: [
      ''
    ],
    examples: [
      {
        id: 'concept-example-1',
        title: 'Logo Design Process',
        description: 'After naming our studio, I created logo ideas inspired by Sea Monkeys and Razvan’s sketch. My first versions were too illustrative, but feedback led me to simplify. The new minimal, Mailchimp-inspired logo captures our playful identity and shows the value of iteration and teamwork.',
        image: '/images/examples/lo1ex1.png',
        pdfUrl: '/pdfs/lo1/LO1new.pdf',
        pdfPage: 1
      },
      {
        id: 'concept-example-2',
        title: 'Portfolio Development',
        description: 'I designed a gamified isometric portfolio inspired by Pinterest. Early versions looked good but had poor UX. After feedback and user testing, I simplified navigation and redesigned the layout for smoother use, learning to value usability and iteration over visuals.',
        image: '/images/examples/lo1ex2.png',
        pdfUrl: '/pdfs/lo1/LO1new.pdf',
        pdfPage: 5
      },
      {
        id: 'concept-example-3',
        title: 'Poster Design Process',
        description: 'I designed an infographic poster for our technical project, focusing on clarity over visuals. Early drafts lacked impact, so I restarted with real materials and expressive design. User testing confirmed clarity, teaching me that strong design balances function and storytelling.',
        image: '/images/examples/lo1ex3.png',
        pdfUrl: '/pdfs/lo1/LO1new.pdf',
        pdfPage: 11
      }
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
    description: '',
    details: [
      ''
    ],
    examples: [
      {
        id: 'creative-example-1',
        title: 'Business Card Design',
        description: 'I designed our studio’s business cards, experimenting with a 50/50 balance between visuals and text. Feedback led me to add the logo, refine colors, and dedicate one side to artwork. Iterating taught me to stay flexible, improving balance, clarity, and our playful identity.',
        image: '/images/examples/lo3ex1.png',
        pdfUrl: '/pdfs/lo3/LO3.pdf',
        pdfPage: 1
      },
      {
        id: 'creative-example-2',
        title: 'Logo Development',
        description: 'I designed our studio logo inspired by Sea Monkeys, starting from a sketch of a monkey with a snorkel mask. Early colorful versions felt too illustrative, so I simplified them into a minimal, Mailchimp-inspired logo. Iterating with feedback taught me to balance creativity with function.',
        image: '/images/examples/lo3ex2.png',
        pdfUrl: '/pdfs/lo3/LO3.pdf',
        pdfPage: 5
      },
      {
        id: 'creative-example-3',
        title: '3D Portfolio Development',
        description: 'I built a 3D gamified portfolio using React Three Fiber. Early layouts were inefficient, so I generated modular grids and replaced a tricky octagon platform with a ramp for smoother navigation. User testing and iteration taught me to prioritize usability and smart, reusable design solutions.',
        image: '/images/examples/lo3ex3.png',
        pdfUrl: '/pdfs/lo3/LO3.pdf',
        pdfPage: 9
      },
      {
        id: 'creative-example-4',
        title: 'Poster iteration',
        description: 'After earlier poster versions failed, I researched new inspiration and sketched a fresh mock-up. Iterating with team feedback and applying the golden ratio improved alignment, balance, and visual flow. This process reinforced the value of iteration, collaboration, and clear communication in design.',
        image: '/images/examples/lo3ex4.png',
        pdfUrl: '/pdfs/lo3/LO3.pdf',
        pdfPage: 13
      }
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
    description: '',
    details: [
      ''
    ],
    examples: [
      {
        id: 'personal-example-1',
        title: 'Client Project: Holleman',
        description: 'Over the summer, I redesigned Holleman’s outdated website from brand guide to deployment. I built it in React with Strapi as a CMS, improving scalability and usability. Managing the full process taught me technical skills, client communication, and confident project leadership.',
        image: '/images/examples/lo5ex1.png',
        pdfUrl: '/pdfs/lo5/LO5.pdf',
        pdfPage: 1
      },
      {
        id: 'personal-example-2',
        title: 'Gamified Portfolio',
        description: 'I built an interactive 3D portfolio in React Three Fiber to showcase my work for internship applications. Using a Kanban board and daily feedback, I refined it efficiently. This project strengthened my skills in organization, UX, and creative self-leadership.',
        image: '/images/examples/lo5ex3.png',
        pdfUrl: '/pdfs/lo5/LO5.pdf',
        pdfPage: 5
      },
      {
        id: 'personal-example-3',
        title: 'Guest Presentation for Semester-One Students',
        description: 'I presented my past projects to first-year students, improving my clarity, pacing, and confidence with each session. The experience strengthened my communication skills and made me appreciate the value of my work and process more deeply.',
        image: '/images/examples/lo5ex2.png',
        pdfUrl: '/pdfs/lo5/LO5.pdf',
        pdfPage: 9
      }
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

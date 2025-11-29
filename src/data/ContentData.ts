export interface ExampleItem {
  id: string;
  title: string;
  description: string;
  image: string;
  pdfUrl: string;
}

export interface ContentItem {
  title: string;
  description: string;
  details: string[];
  examples?: ExampleItem[];
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
        description: 'After naming our studio, I created logo ideas inspired by Sea Monkeys and Razvan\'s sketch. My first versions were too illustrative, but feedback led me to simplify. The new minimal, Mailchimp-inspired logo captures our playful identity and shows the value of iteration and teamwork.',
        image: '/images/examples/lo1ex1.png',
        pdfUrl: '/pdfs/lo1/LO1.1.pdf'
      },
      {
        id: 'concept-example-2',
        title: 'Portfolio Development',
        description: 'I designed a gamified isometric portfolio inspired by Pinterest. Early versions looked good but had poor UX. After feedback and user testing, I simplified navigation and redesigned the layout for smoother use, learning to value usability and iteration over visuals.',
        image: '/images/examples/lo1ex2.png',
        pdfUrl: '/pdfs/lo1/LO1.2.pdf'
      },
      {
        id: 'concept-example-3',
        title: 'Poster Design Process',
        description: 'I designed an infographic poster for our technical project, focusing on clarity over visuals. Early drafts lacked impact, so I restarted with real materials and expressive design. User testing confirmed clarity, teaching me that strong design balances function and storytelling.',
        image: '/images/examples/lo1ex3.png',
        pdfUrl: '/pdfs/lo1/LO1.3.pdf'
      },
      {
        id: 'concept-example-4',
        title: '3D Scan\'s evolution',
        description: 'I documented my 3D scanning workflow from early noisy photogrammetry tests to clean Gaussian Splats. Feedback showed my methods were limiting the results, so I refined my capture techniques and adopted new tools. This process taught me how experimentation and informed decisions directly improve technical quality.',
        image: '/images/examples/lo1ex4.png',
        pdfUrl: '/pdfs/lo1/LO1.4.pdf'
      }
    ],
    color: '#F5F5DC'
  },
  'staircase-slab-2': {
    title: 'Transferable Production',
    description: '',
    details: [
      ''
    ],
    examples: [
      {
        id: 'transferable-example-1',
        title: 'Figma collaboration',
        description: 'I created our shared Figma workspace to develop the brand guide, color palette, and logo. Constant feedback refined our designs and teamwork. Using comments and version history improved communication, reflection, and creative iteration.',
        image: '/images/examples/lo2ex1.png',
        pdfUrl: '/pdfs/lo2/LO2.1.pdf'
      },
      {
        id: 'transferable-example-2',
        title: 'Version Control and Deployment',
        description: 'I used GitHub and Vercel to host my portfolio, enabling fast feedback and version tracking. With 44 commits in under three weeks, I refined the project efficiently. This process strengthened my organization, workflow, and professional development habits.',
        image: '/images/examples/lo2ex2.png',
        pdfUrl: '/pdfs/lo2/LO2.2.pdf'
      },
      {
        id: 'transferable-example-3',
        title: 'Brand Guide Development',
        description: 'I led the creation of our studio\'s brand guide, defining our visual identity through multiple iterations. Feedback shaped each version until it reflected our playful, creative values. This process taught me how branding can embody a team\'s true character.',
        image: '/images/examples/lo2ex3.png',
        pdfUrl: '/pdfs/lo2/LO2.3.pdf'
      },
      {
        id: 'transferable-example-4',
        title: 'Client feedback influence ',
        description: 'I compared photogrammetry, NeRF, and Gaussian Splatting to meet the client’s real-time rendering needs. Feedback pushed me to justify each technical choice and switch to a more suitable pipeline. This showed me how research-based decisions and clear communication shape a professional development process.',
        image: '/images/examples/lo2ex4.png',
        pdfUrl: '/pdfs/lo2/LO2.4.pdf'
      }
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
        description: 'I designed our studio\'s business cards, experimenting with a 50/50 balance between visuals and text. Feedback led me to add the logo, refine colors, and dedicate one side to artwork. Iterating taught me to stay flexible, improving balance, clarity, and our playful identity.',
        image: '/images/examples/lo3ex1.png',
        pdfUrl: '/pdfs/lo3/LO3.1.pdf'
      },
      {
        id: 'creative-example-2',
        title: 'Logo Development',
        description: 'I designed our studio logo inspired by Sea Monkeys, starting from a sketch of a monkey with a snorkel mask. Early colorful versions felt too illustrative, so I simplified them into a minimal, Mailchimp-inspired logo. Iterating with feedback taught me to balance creativity with function.',
        image: '/images/examples/lo3ex2.png',
        pdfUrl: '/pdfs/lo3/LO3.2.pdf'
      },
      {
        id: 'creative-example-3',
        title: '3D Portfolio Development',
        description: 'I built a 3D gamified portfolio using React Three Fiber. Early layouts were inefficient, so I generated modular grids and replaced a tricky octagon platform with a ramp for smoother navigation. User testing and iteration taught me to prioritize usability and smart, reusable design solutions.',
        image: '/images/examples/lo3ex3.png',
        pdfUrl: '/pdfs/lo3/LO3.3.pdf'
      },
      {
        id: 'creative-example-4',
        title: 'Poster iteration',
        description: 'After earlier poster versions failed, I researched new inspiration and sketched a fresh mock-up. Iterating with team feedback and applying the golden ratio improved alignment, balance, and visual flow. This process reinforced the value of iteration, collaboration, and clear communication in design.',
        image: '/images/examples/lo3ex4.png',
        pdfUrl: '/pdfs/lo3/LO3.4.pdf'
      },
      {
        id: 'creative-example-5',
        title: 'Iterations on scans',
        description: 'I improved my scans through multiple iterations, adjusting camera settings, lighting, and capture techniques. Each test revealed weaknesses, guiding me toward better textures, cleaner data, and stronger results. This process taught me how methodical iteration leads to measurable quality improvements.',
        image: '/images/examples/lo3ex5.png',
        pdfUrl: '/pdfs/lo3/LO3.5.pdf'
      }
    ],
    color: '#F5F5DC'
  },
  'staircase-slab-4': {
    title: 'Professional Standards',
    description: '',
    details: [
      ''
    ],
    examples: [
      {
        id: 'professional-example-1',
        title: 'Holleman Website Redesign',
        description: 'I redesigned Holleman\'s outdated website, creating a modern prototype and building it with React and Strapi for scalability. Regular feedback and communication ensured the client\'s vision was met. I learned to balance technical decisions with clear client guidance.',
        image: '/images/examples/lo4ex1.png',
        pdfUrl: '/pdfs/lo4/LO4.1.pdf'
      },
      {
        id: 'professional-example-2',
        title: 'Poster Showcase Day',
        description: 'During the showcase, I reviewed other teams\' posters and exchanged feedback. Observing different visual approaches helped me understand what makes a design clear and engaging. Feedback on our own poster confirmed big visual improvements and better balance.',
        image: '/images/examples/lo4ex2.png',
        pdfUrl: '/pdfs/lo4/LO4.2.pdf'
      },
      {
        id: 'professional-example-3',
        title: 'Trello Planning & Workflow',
        description: 'After the poster showcase, we created a Trello board to organize our next five weeks of work. Dividing tasks and reflecting on past issues improved our communication and structure. The plan kept the team aligned, productive, and goal-focused.',
        image: '/images/examples/lo4ex3.png',
        pdfUrl: '/pdfs/lo4/LO4.3.pdf'
      },
      {
        id: 'professional-example-4',
        title: 'Research and methodological approach',
        description: 'I researched photogrammetry and Gaussian Splatting from scratch, studying capture methods and academic papers to build a structured workflow. Applying theory helped me justify decisions, work ethically with open-source tools, and align the project with professional standards.',
        image: '/images/examples/lo4ex4.png',
        pdfUrl: '/pdfs/lo4/LO4.4.pdf'
      },
      {
        id: 'professional-example-5',
        title: 'Feedback on prototype day',
        description: 'During prototype day, I presented our workflow and explained complex tools in simple terms. Feedback from teachers and students helped refine our next steps, while reviewing other teams taught me to evaluate work ethically and recognise professional expectations.',
        image: '/images/examples/lo4ex5.webp',
        pdfUrl: '/pdfs/lo4/LO4.5.pdf'
      }
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
        description: 'Over the summer, I redesigned Holleman\'s outdated website from brand guide to deployment. I built it in React with Strapi as a CMS, improving scalability and usability. Managing the full process taught me technical skills, client communication, and confident project leadership.',
        image: '/images/examples/lo5ex1.png',
        pdfUrl: '/pdfs/lo5/LO5.1.pdf'
      },
      {
        id: 'personal-example-2',
        title: 'Gamified Portfolio',
        description: 'I built an interactive 3D portfolio in React Three Fiber to showcase my work for internship applications. Using a Kanban board and daily feedback, I refined it efficiently. This project strengthened my skills in organization, UX, and creative self-leadership.',
        image: '/images/examples/lo5ex3.png',
        pdfUrl: '/pdfs/lo5/LO5.2.pdf'
      },
      {
        id: 'personal-example-3',
        title: 'Guest Presentation for Semester-One Students',
        description: 'I presented my past projects to first-year students, improving my clarity, pacing, and confidence with each session. The experience strengthened my communication skills and made me appreciate the value of my work and process more deeply.',
        image: '/images/examples/lo5ex2.png',
        pdfUrl: '/pdfs/lo5/LO5.3.pdf'
      },
      {
        id: 'personal-example-4',
        title: 'CV iterations & Career Day',
        description: 'I created and iterated my CV using feedback from teachers and Career Day resources. Recognising that I over-explained details helped me refine it into a clearer, more confident version. This process strengthened my self-awareness and improved how I present myself professionally.',
        image: '/images/examples/lo5ex4.png',
        pdfUrl: '/pdfs/lo5/LO5.4.pdf'
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

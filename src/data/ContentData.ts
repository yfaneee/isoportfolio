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

export interface PortfolioSection {
  title: string;
  image: string;
  imageAlt: string;
  points: string[];
}

// A past portfolio: clickable live-site preview on top, short write-up below
export interface PortfolioContent {
  eyebrow: string;
  url: string;
  repoUrl: string;
  previewImage: string;
  summary: string;
  sections: PortfolioSection[];
}

export interface ContentItem {
  title: string;
  description: string;
  details: string[];
  examples?: ExampleItem[];
  studioContent?: StudioContent;
  artworkGallery?: ArtworkGallery;
  projectContent?: ProjectContent;
  portfolioContent?: PortfolioContent;
  color: string;
}

export const contentData: Record<string, ContentItem> = {
  // Past portfolios, oldest first (slab 5 will be this 3D portfolio)
  'staircase-slab-1': {
    title: 'First Portfolio',
    description: '',
    details: [],
    portfolioContent: {
      eyebrow: 'Portfolio 01',
      url: 'https://first-portfolio-one-lac.vercel.app/',
      repoUrl: 'https://github.com/yfaneee/First-Portfolio-',
      previewImage: '/images/firstportfolio/WebsiteImage.webp',
      summary: 'My first personal portfolio, hand-built while studying Media & Design. It is also where I brought 3D into a website for the first time, using three.js.',
      sections: [
        {
          title: 'Where it started',
          image: '/images/firstportfolio/WhereItStarted.webp',
          imageAlt: 'First version of the site next to a later iteration',
          points: [
            'Began as a bright, experimental layout with a sidebar for Projects, About and Contact.',
            'Teacher feedback shaped every iteration: a palette rebuilt in Adobe Color for harmony and accessibility, and a responsive homepage.',
            'Each project page shares one layout of images, text blocks and code snippets.'
          ]
        },
        {
          title: 'Design ideas',
          image: '/images/firstportfolio/DesignIdeas.webp',
          imageAlt: 'Project page with text boxes and code snippets next to the finished landing page',
          points: [
            'A light and dark blue palette runs through every page, with a red, pink and purple header on the landing page.',
            'After readability feedback, text boxes moved from shadowed white text on light green to white text on a dark background.',
            'An interactive three.js model on the artwork page lets visitors explore the piece instead of just looking at it.'
          ]
        }
      ]
    },
    color: '#F5F5DC'
  },
  'staircase-slab-2': {
    title: 'Spotify Portfolio',
    description: '',
    details: [],
    portfolioContent: {
      eyebrow: 'Portfolio 02',
      url: 'https://spotify-folio.vercel.app/',
      repoUrl: 'https://github.com/yfaneee/SpotifyFolio',
      previewImage: '/images/seccondfolio/WebsiteImage.webp',
      summary: 'A portfolio designed like Spotify, complete with a working music player and a playlist of songs I love. My work is laid out like albums and tracks, so browsing it feels like browsing music.',
      sections: [
        {
          title: 'Design & prototype',
          image: '/images/seccondfolio/DesignPrototype.webp',
          imageAlt: 'Figma prototype screens for the Spotify-style portfolio',
          points: [
            "Inspired by Gary Le Masson's portfolio built on Google's search results, I rebuilt the idea around Spotify, since music is a big part of who I am.",
            'Prototyped the whole site in Figma, including a built-in player so visitors can listen while they browse.',
            'Feedback pushed me to keep every element on theme, like examples as clickable "songs" and a lyrics button for details, and to cut navigation down to one sidebar.'
          ]
        },
        {
          title: 'A modern, relevant design',
          image: '/images/seccondfolio/RelevantModernDesign.webp',
          imageAlt: 'Figma prototype compared with the coded website',
          points: [
            "Researched the biggest streaming platforms and chose Spotify's layout for its familiar, user-friendly interface.",
            'Positive feedback on the prototype let me move to code quickly and start building out the pages.',
            'Stripped unnecessary buttons and features from the prototype and presented learning outcomes through song lyrics.'
          ]
        },
        {
          title: 'Built on my core values',
          image: '/images/seccondfolio/CoreValues.webp',
          imageAlt: 'Contact page styled as a Spotify playlist with the music player',
          points: [
            'Music has always been part of my life, and at one point my work, so the working player and playlist became the signature feature.',
            "Borrowing Spotify's interface gives visitors a layout they already know how to use.",
            'Small iterations from user feedback kept the experience smooth and showed that personal touches make a portfolio stand out.'
          ]
        }
      ]
    },
    color: '#F5F5DC'
  },
  'staircase-slab-3': {
    title: 'Space Portfolio',
    description: '',
    details: [],
    portfolioContent: {
      eyebrow: 'Portfolio 03',
      url: 'https://space-portfolio-one-mu.vercel.app/',
      repoUrl: 'https://github.com/yfaneee/SpacePortfolio',
      previewImage: '/images/thirdfolio/LandingPage.webp',
      summary: 'A portfolio you fly through: an interactive space built in three.js, where every constellation is a project or a learning outcome. It started life as a YouTube look-alike, until one piece of feedback sent it into orbit.',
      sections: [
        {
          title: 'From YouTube to space',
          image: '/images/thirdfolio/Prototype.webp',
          imageAlt: 'Figma prototype board for the portfolio',
          points: [
            "Starting from Gary Le Masson's Google-styled portfolio, I prototyped a YouTube-like version in Figma: a main page, a profile page, and a page per learning outcome.",
            'Early feedback was positive, so I built it in HTML, CSS and JavaScript, with video clips showing the work.',
            "Then Stan, a JavaScript teacher, pushed back: YouTube's interface is built for streaming, not for showing personal work. That sent me looking for something of my own."
          ]
        },
        {
          title: 'Building the universe',
          image: '/images/thirdfolio/SecondOne.webp',
          imageAlt: 'Constellations and the navigation menu in the finished space portfolio',
          points: [
            'Built the scene in three.js: a star field with random positions and colours, a central planet holding the menu, and camera controls on WASD, drag and zoom.',
            'Learning outcomes and projects became constellations, groups of stars joined by lines, that light up on hover.',
            'Every step went into its own Git commit, from the first star field through responsiveness to the post-feedback polish.'
          ]
        }
      ]
    },
    color: '#F5F5DC'
  },
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

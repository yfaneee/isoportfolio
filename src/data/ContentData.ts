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

// A research project shown on the 3DGS slab; several are listed one after another
export interface ProjectContent {
  id: string;
  title: string;
  tag: string;
  description: string;
  gsplatUrl?: string;
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

// A PDF write-up shown as a card that opens the document
export interface PortfolioDocument {
  title: string;
  description: string;
  thumbnail: string;
  pdfUrl: string;
  pages: number;
}

// A portfolio: preview on top (a link to the live site when url is set), short write-up below
export interface PortfolioContent {
  eyebrow: string;
  url?: string;
  repoUrl: string;
  previewImage: string;
  previewAlt?: string;
  summary: string;
  sections?: PortfolioSection[];
  documents?: PortfolioDocument[];
}

export interface ContentItem {
  title: string;
  description: string;
  details: string[];
  examples?: ExampleItem[];
  studioContent?: StudioContent;
  artworkGallery?: ArtworkGallery;
  projects?: ProjectContent[];
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
  'staircase-slab-4': {
    title: 'Castle Portfolio',
    description: '',
    details: [],
    portfolioContent: {
      eyebrow: 'Portfolio 04',
      url: 'https://castle-portfolio.vercel.app/',
      repoUrl: 'https://github.com/yfaneee/CastlePortfolio',
      previewImage: '/images/fourthfolio/CastleFolio.webp',
      summary: 'A 3D Japanese castle I modelled myself in Blender, where every building opens a part of my work. Click a building and the camera zooms in, all on a single page.',
      sections: [
        {
          title: 'Idea & design',
          image: '/images/fourthfolio/IdeaDesign.webp',
          imageAlt: 'Sketch of the castle with buildings mapped to learning outcomes, projects and artwork',
          points: [
            'Instead of a simple portfolio from my first drawings, I set myself a real challenge: a full 3D scene, modelled entirely in Blender.',
            'I sketched the castle so each building maps to a learning outcome, a project or the artwork gallery.',
            'Early advice was to keep it simpler. I went for it anyway, working up from basic trees to detailed buildings, sculpting and terrain.'
          ]
        },
        {
          title: 'Building the scene',
          image: '/images/fourthfolio/Creation.webp',
          imageAlt: 'Early untextured version of the castle scene running in the browser',
          points: [
            'Loaded the scene, placed the camera, and gave each clickable building a highlight and a zoom-in animation.',
            'As content grew the site started to lag, so I turned it into a one-page app that loads documentation as an overlay.',
            'Hash-based URLs remember which learning outcome you were on, allow direct links, and zoom the camera back out to the right building.'
          ]
        },
        {
          title: 'Prototype iterations',
          image: '/images/fourthfolio/iterations.webp',
          imageAlt: 'Figma prototypes of the documentation and artwork pages',
          points: [
            'Rebuilt the documentation prototype to match the finished site, then again with real text instead of placeholders, which exposed new issues.',
            'Feedback moved and renamed the Figma button and added hints on mobile for what can be tapped.',
            'Fonts and smaller details were settled through user tests, leaving a prototype that was simple to implement.'
          ]
        }
      ]
    },
    color: '#F5F5DC'
  },
  'staircase-slab-5': {
    title: 'Isometric Portfolio',
    description: '',
    details: [],
    portfolioContent: {
      eyebrow: 'Portfolio 05 · You are here',
      repoUrl: 'https://github.com/yfaneee/isoportfolio',
      previewImage: '/images/fifthfolio/InitialLayout.webp',
      previewAlt: 'The first layout of this isometric world',
      summary: 'The world you are walking through right now: an isometric, game-like portfolio built with React Three Fiber, where a character explores platforms instead of pages. The write-ups below follow it from first sketch to finished build.',
      documents: [
        {
          title: 'Portfolio creation',
          description: 'An isometric, game-like portfolio inspired by layouts I found on Pinterest. The first versions looked good but were awkward to use, so feedback and user tests led me to simplify the navigation and rework the layout.',
          thumbnail: '/images/fifthfolio/LO1.webp',
          pdfUrl: '/images/fifthfolio/LO1.pdf',
          pages: 6
        },
        {
          title: 'Portfolio code',
          description: 'Built in React Three Fiber, floor by floor at first, until generated grids made the world modular and cut a lot of code. User tests also swapped a hard-to-walk octagon platform for a ramp.',
          thumbnail: '/images/fifthfolio/LO2.webp',
          pdfUrl: '/images/fifthfolio/LO2.pdf',
          pages: 4
        },
        {
          title: 'Gamified portfolio & Kanban',
          description: 'Made to back up my internship applications, planned on a Kanban board with daily feedback. It stretched my organisation, my UX thinking and my ability to lead my own work.',
          thumbnail: '/images/fifthfolio/LO3.webp',
          pdfUrl: '/images/fifthfolio/LO3.pdf',
          pages: 4
        }
      ]
    },
    color: '#F5F5DC'
  },
  // 3DGS slab: the Gaussian Splatting research projects, newest first
  'smaller-block-slab': {
    title: '3DGS',
    description: '',
    details: [],
    projects: [
      {
        id: 'ironfilms-3dgs',
        title: 'IronFilms Research',
        tag: 'IRON Films · Research project',
        logo: '/images/Logo_IRON_Films_150p.png',
        description: 'This project explores photogrammetry and Gaussian Splatting techniques to create immersive 3D captures of real-world locations. The scan below shows a street corner in Eindhoven featuring urban graffiti art, captured using advanced 3D reconstruction methods.',
        gsplatUrl: '/gsplat/Achterom/point_cloud.ksplat',
        processPoints: [
          'I built photogrammetry workflows using Meshroom, improving scan quality through iterative testing',
          'Researched and implemented Gaussian Splatting, producing real-time, high-detail 3D scenes',
          'Developed optimized capture methods (orbital, swirl, face-forward) for clean datasets',
          'Presented workflow to stakeholders, translating complex rendering tech into clear explanations',
          'Documented full pipeline from photo capture to Unreal Engine import for team use'
        ],
        images: [
          '/images/meshpics/ChurchRenderA.webp',
          '/images/meshpics/ChurchRenderC.webp',
          '/images/meshpics/CornerV2b.webp',
          '/images/meshpics/CornerV2c.webp'
        ]
      },
      {
        id: 'spookslot-3dgs',
        title: 'SpookSlot 3DGS Research',
        tag: 'Efteling · Digital heritage research',
        logo: '/images/spookslot/logo.svg',
        description: 'The Spookslot (Ghost Castle) was one of the most iconic attractions at the Efteling theme park, demolished in 2022 to make room for its replacement. This project reconstructs it with 3D Gaussian Splatting from material that was never meant for photogrammetry: archival photographs with poor overlap, frames pulled out of old video, 360° camera stitches and terrestrial laser scan data. Every attempt, including the failures, is archived as research documentation.',
        processText: 'Ten documented reconstruction attempts, each one narrowing down what the dataset could and could not support:',
        processPoints: [
          'Established that the 5,794-image archive was unusable on its own: mixed light levels, motion blur and close-ups with almost no frame overlap',
          'Rebuilt the pipeline around Nerfstudio and COLMAP, adding SuperPoint/SuperGlue matching for the dark, low-texture interior',
          'Unprojected 360° equirectangular captures into pinhole views, lifting the registration rate from 15% to 94.76% and producing the first complete corridor scan',
          'Reached the first genuinely successful reconstruction on a set of near-8K Opera photographs after isolating an orientation-consistency bug in Postshot',
          'Benchmarked single-panorama methods (SPAG-4D, PanSplat, Pano2Room) against the classic SfM route, documenting why the feed-forward models broke on a fixed-position dataset',
          'Published the whole archive as a public site, with an interactive splat viewer per attempt'
        ],
        images: [
          '/images/spookslot/OperaScan.webp',
          '/images/spookslot/CorridorScan.webp',
          '/images/spookslot/Rondezaal.webp',
          '/images/spookslot/Pano2Room.webp'
        ]
      }
    ],
    color: '#F5F5DC'
  },
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

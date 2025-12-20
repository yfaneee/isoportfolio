import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './components/IsometricScene';
import UI from './components/UI';
import ControlsUI from './components/ControlsUI';
import MenuOverlay from './components/MenuOverlay';
import MenuIcon from './components/MenuIcon';
import Content from './components/Content';
import TopHUD from './components/TopHUD';
import CharacterSelection, { CharacterOption } from './components/CharacterSelection';
import LocationDiscovery from './components/LocationDiscovery';
import AchievementNotification from './components/AchievementNotification';
import InteractionOverlay from './components/InteractionOverlay';
import WebsiteOverlay from './components/WebsiteOverlay';
import ClickSpark from './components/ClickSpark';
import RotatePhoneScreen from './components/RotatePhoneScreen';
import MobileDpad from './components/MobileDpad';
import MobileInteractButton from './components/MobileInteractButton';
import AddToHomeScreenPrompt from './components/AddToHomeScreenPrompt';
import RepoLinks from './components/RepoLinks';
import { getContentForSlab, ContentItem, slabNavigationOrder, getSlabKeyFromPosition, getLocationFromSlabKey, contentData } from './data/ContentData';
import { preloadCommonPlatforms } from './utils/collisionSystem';
import { shiftElevator, isOnElevator, triggerElevator } from './utils/elevatorSystem';
import { preloadCharacterModels } from './components/Character';
import { preloadBillboardTextures, disposeBillboardTextures } from './utils/texturePreloader';
import { AchievementProvider, useAchievements } from './contexts/AchievementContext';
import './App.css';
import './styles/fonts.css';

function AppContent() {
  const [introComplete, setIntroComplete] = useState(false);
  const { trackLocationVisit, trackContentTabOpen, trackGSplatViewerUsage, trackBillboardOpen, trackSongPlayed, newlyUnlockedAchievement, clearNewlyUnlocked } = useAchievements();
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const [currentAchievementTitle, setCurrentAchievementTitle] = useState('');
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showCharacterSelection, setShowCharacterSelection] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMusicPlayingRef = useRef(false);
  
  // Playlist of songs 
  const playlistRef = useRef([
    '/music/Baguira.mp3',
    '/music/Boy.mp3',
    '/music/Sudo.mp3'
  ]);
  const currentSongIndexRef = useRef(0);
  const [showLocationDiscovery, setShowLocationDiscovery] = useState(false);
  const [showProjectStudioDiscovery, setShowProjectStudioDiscovery] = useState(false);
  const [hasVisitedProjectStudio, setHasVisitedProjectStudio] = useState(false);
  const [showLearningOutcomesDiscovery, setShowLearningOutcomesDiscovery] = useState(false);
  const [hasVisitedLearningOutcomes, setHasVisitedLearningOutcomes] = useState(false);
  const [showArtworkDiscovery, setShowArtworkDiscovery] = useState(false);
  const [hasVisitedArtwork, setHasVisitedArtwork] = useState(false);
  const [showWorkDiscovery, setShowWorkDiscovery] = useState(false);
  const [hasVisitedWork, setHasVisitedWork] = useState(false);
  const [showInteractionOverlay, setShowInteractionOverlay] = useState(false);
  const [interactionText, setInteractionText] = useState('Menu');
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [interactionKeyText, setInteractionKeyText] = useState('SPACE');
  const [isHoveringBillboard, setIsHoveringBillboard] = useState(false);
  const [isBillboardFullscreen, setIsBillboardFullscreen] = useState(false);
  const [showWebsiteOverlay, setShowWebsiteOverlay] = useState(false);
  const [currentWebsiteUrl, setCurrentWebsiteUrl] = useState('');
  const [currentBillboardKey, setCurrentBillboardKey] = useState('');
  const [triggerBillboardExit, setTriggerBillboardExit] = useState(false);
  const [activeSlabId, setActiveSlabId] = useState<string | null>(null);
  const [introProgress, setIntroProgress] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption>({
    id: 'character-r',
    name: 'Ninja',
    modelPath: '/models/character-r.glb',
    imagePath: '/images/character-r.png'
  });
  const [showMenu, setShowMenu] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [menuDelayOver, setMenuDelayOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [characterOpacity, setCharacterOpacity] = useState(1);
  const [characterScale, setCharacterScale] = useState(1);
  const [characterRotationY, setCharacterRotationY] = useState(0);
  const [characterPositionOffset, setCharacterPositionOffset] = useState<[number, number, number]>([0, 0, 0]);
  const [currentSlabKey, setCurrentSlabKey] = useState<string | null>(null);
  const [isNavigatingSlabs, setIsNavigatingSlabs] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  const [currentCharacterPosition, setCurrentCharacterPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [hoveredSlabId, setHoveredSlabId] = useState<string | null>(null);
  const [hoveredSlabPosition, setHoveredSlabPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSlabClickAnimating, setIsSlabClickAnimating] = useState(false);
  const [isOnTrain, setIsOnTrain] = useState(false);
  const [trainState, setTrainState] = useState<{
    isStopped: boolean;
    position: [number, number, number];
    rotation: number;
  }>({
    isStopped: false,
    position: [0, 0, 0],
    rotation: 0
  });
  // Ref to track latest train state for synchronous access 
  const trainStateRef = useRef<{
    isStopped: boolean;
    position: [number, number, number];
    rotation: number;
  }>({
    isStopped: false,
    position: [0, 0, 0],
    rotation: 0
  });
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const characterControllerRef = useRef<any>(null);
  // Store position where character boarded the train
  const trainBoardingPositionRef = useRef<[number, number, number]>([0, 0, 0]);
  
  // Billboard refs for programmatic triggering
  const billboardRefs = useRef<{[key: string]: any}>({});
  
  // Function to trigger billboard click programmatically
  const triggerBillboardClick = useCallback((billboardKey: string) => {
    const billboard = billboardRefs.current[billboardKey];
    if (billboard && billboard.handleBillboardClick) {
      billboard.handleBillboardClick();
    }
  }, []);
  
  // Handle billboard ref registration
  const handleBillboardRef = useCallback((key: string, ref: any) => {
    billboardRefs.current[key] = ref;
  }, []);

  // Get interaction text for hovered slab
  const getSlabInteractionText = (slabId: string): string => {
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
      const websiteTexts: { [key: string]: string } = {
        'website-castle': 'View Castle Portfolio',
        'website-holleman': 'View Holleman Project',
        'website-space': 'View Space Portfolio',
        'website-spotify': 'View Spotify Portfolio'
      };
      return websiteTexts[slabId] || 'View Portfolio';
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

  // Handle slab hover 
  const handleSlabHover = useCallback((slabId: string | null, screenPosition?: { x: number; y: number }) => {
    // Disable slab hover during intro/loading/character selection
    if (!introComplete || showLoadingScreen || showCharacterSelection) {
      setHoveredSlabId(null);
      return;
    }
    
    if (slabId && screenPosition) {
      setHoveredSlabId(slabId);
      setHoveredSlabPosition(screenPosition);
    } else {
      setHoveredSlabId(null);
    }
  }, [introComplete, showLoadingScreen, showCharacterSelection]);

  // Handle slab click 
  const handleSlabClick = useCallback((slabId: string) => {
    // Disable slab clicks during intro/loading/character selection
    if (!introComplete || showLoadingScreen || showCharacterSelection) return;
    if (isBillboardFullscreen || showMenu || showContent) return;

    // Hide both interaction overlays when clicking
    setHoveredSlabId(null);
    setShowInteractionOverlay(false);

    // Determine action based on slab ID
    if (slabId.startsWith('lo')) {
      // Learning Outcomes slab 
      const locationMapping: { [key: string]: string } = {
        'lo1': 'conceptualize',
        'lo2': 'transferable',
        'lo3': 'creative',
        'lo4': 'professional',
        'lo5': 'leadership',
      };

      const slabKeyMapping: { [key: string]: string } = {
        'lo1': 'staircase-slab-1',
        'lo2': 'staircase-slab-2',
        'lo3': 'staircase-slab-3',
        'lo4': 'staircase-slab-4',
        'lo5': 'staircase-slab-5',
      };

      const location = locationMapping[slabId];
      const contentKey = slabKeyMapping[slabId];
      const content = contentData[contentKey];
      
      if (content && location && characterControllerRef.current) {
        // Start slab click animation 
        setIsSlabClickAnimating(true);
        
        // Teleport character to location
        characterControllerRef.current.teleportToLocation(location);
        
        // Wait for camera animation 
        setTimeout(() => {
          setCurrentContent(content);
          setCurrentSlabKey(contentKey);
          setShowContent(true);
          setIsSlabClickAnimating(false);
          // Track content tab opening for achievements
          trackContentTabOpen(slabId);
        }, 1200);
      }
    } else if (slabId.startsWith('github-')) {
      // GitHub slabs 
      const githubUrls: { [key: string]: string } = {
        'github-castle': 'https://github.com/yfaneee/CastlePortfolio',
        'github-holleman': 'https://github.com/yfaneee/holleman',
        'github-space': 'https://github.com/yfaneee/SpacePortfolio',
        'github-spotify': 'https://github.com/yfaneee/SpotifyFolio'
      };

      const url = githubUrls[slabId];
      if (url) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = url;
        } else {
          window.open(url, '_blank');
        }
      }
    } else if (slabId.startsWith('website-')) {
      // Website button slabs (trigger billboard) 
      const billboardKeys: { [key: string]: string } = {
        'website-castle': 'billboard1',
        'website-holleman': 'billboard2',
        'website-space': 'billboard3',
        'website-spotify': 'billboard4'
      };

      const billboardKey = billboardKeys[slabId];
      if (billboardKey) {
        triggerBillboardClick(billboardKey);
      }
    } else if (slabId === 'main-slab') {
      // Main/Menu slab 
      if (characterControllerRef.current) {
        setIsSlabClickAnimating(true);
        characterControllerRef.current.teleportToLocation('home');
        setTimeout(() => {
          setShowMenu(true);
          setIsSlabClickAnimating(false);
        }, 1200);
      }
    } else if (slabId === 'project-studio') {
      // Project Studio slab 
      const content = contentData['high-block-slab'];
      if (content && characterControllerRef.current) {
        setIsSlabClickAnimating(true);
        characterControllerRef.current.teleportToLocation('studio');
        setTimeout(() => {
          setCurrentContent(content);
          setCurrentSlabKey('high-block-slab');
          setShowContent(true);
          setIsSlabClickAnimating(false);
        }, 1200);
      }
    } else if (slabId === 'smaller-block') {
      // Smaller block slab 
      const content = contentData['smaller-block-slab'];
      if (content && characterControllerRef.current) {
        setIsSlabClickAnimating(true);
        characterControllerRef.current.teleportToLocation('ironfilms');
        setTimeout(() => {
          setCurrentContent(content);
          setCurrentSlabKey('smaller-block-slab');
          setShowContent(true);
          setIsSlabClickAnimating(false);
        }, 1200);
      }
    } else if (slabId === 'artwork') {
      // Artwork platform slab 
      const content = contentData['artwork-platform-slab'];
      if (content && characterControllerRef.current) {
        setIsSlabClickAnimating(true);
        characterControllerRef.current.teleportToLocation('artwork');
        setTimeout(() => {
          setCurrentContent(content);
          setCurrentSlabKey('artwork-platform-slab');
          setShowContent(true);
          setIsSlabClickAnimating(false);
        }, 1200);
      }
    }
  }, [isBillboardFullscreen, showMenu, showContent, triggerBillboardClick, introComplete, showLoadingScreen, showCharacterSelection, trackContentTabOpen]);

  // Mobile D-pad handlers
  const handleMobileDpadDirection = useCallback((direction: { x: number; y: number } | null) => {
    if (characterControllerRef.current && characterControllerRef.current.handleMobileInput) {
      characterControllerRef.current.handleMobileInput(direction, false);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setShowLocationDiscovery(true);
    setMenuDelayOver(true); 
  }, []);

  const handleLocationDiscoveryComplete = useCallback(() => {
    setShowLocationDiscovery(false);
  }, []);

  const handleProjectStudioDiscoveryComplete = useCallback(() => {
    setShowProjectStudioDiscovery(false);
  }, []);

  const handleLearningOutcomesDiscoveryComplete = useCallback(() => {
    setShowLearningOutcomesDiscovery(false);
  }, []);

  const handleArtworkDiscoveryComplete = useCallback(() => {
    setShowArtworkDiscovery(false);
  }, []);

  const handleWorkDiscoveryComplete = useCallback(() => {
    setShowWorkDiscovery(false);
  }, []);

  const handleBillboardFullscreenStart = useCallback(() => {
    setIsBillboardFullscreen(true);
  }, []);

  const handleBillboardFullscreenEnd = useCallback(() => {
    setIsBillboardFullscreen(false);
  }, []);

  const handleShowWebsite = useCallback((websiteUrl: string, billboardKey: string) => {
    setCurrentWebsiteUrl(websiteUrl);
    setCurrentBillboardKey(billboardKey);
    setShowWebsiteOverlay(true);
  }, []);

  const handleHideWebsite = useCallback(() => {
    // Track billboard opening for achievements when user exits
    if (currentBillboardKey) {
      trackBillboardOpen(currentBillboardKey);
    }
    setShowWebsiteOverlay(false);
    setCurrentWebsiteUrl('');
    setCurrentBillboardKey('');
    // Trigger billboard exit animation
    setTriggerBillboardExit(true);
  }, [currentBillboardKey, trackBillboardOpen]);

  // Check if character is in specific areas for location discovery
  const handlePositionUpdate = useCallback((position: { x: number; z: number }) => {
    // Check 5x5 grid area 
    if (!hasVisitedProjectStudio && !showProjectStudioDiscovery) {
      const spacing = 1.5;
      const grid5x5CenterZ = -1 * spacing - spacing * 3 - (2 * spacing); 
      const grid5x5MinX = -2.5 * spacing; 
      const grid5x5MaxX = 2.5 * spacing;  
      const grid5x5MinZ = grid5x5CenterZ - 2.5 * spacing;
      const grid5x5MaxZ = grid5x5CenterZ + 2.5 * spacing;
      
      if (position.x >= grid5x5MinX && position.x <= grid5x5MaxX && 
          position.z >= grid5x5MinZ && position.z <= grid5x5MaxZ) {
        setHasVisitedProjectStudio(true);
        setShowProjectStudioDiscovery(true);
        trackLocationVisit('project-studio');
      }
    }

    // Check Learning Outcomes ramp area 
    if (!hasVisitedLearningOutcomes && !showLearningOutcomesDiscovery) {
      // Learning Outcomes ramp platform area 
      const learningOutcomesMinX = -14; 
      const learningOutcomesMaxX = -7;  
      const learningOutcomesMinZ = -2;  
      const learningOutcomesMaxZ = 2;   
      
      if (position.x >= learningOutcomesMinX && position.x <= learningOutcomesMaxX && 
          position.z >= learningOutcomesMinZ && position.z <= learningOutcomesMaxZ) {
        setHasVisitedLearningOutcomes(true);
        setShowLearningOutcomesDiscovery(true);
        trackLocationVisit('learning-outcomes');
      }
    }

    // Check Artwork area 
    if (!hasVisitedArtwork && !showArtworkDiscovery) {
      // Artwork octagonal platform area 
      const artworkMinX = 6;   
      const artworkMaxX = 12;  
      const artworkMinZ = -2; 
      const artworkMaxZ = 2;   
      
      if (position.x >= artworkMinX && position.x <= artworkMaxX && 
          position.z >= artworkMinZ && position.z <= artworkMaxZ) {
        setHasVisitedArtwork(true);
        setShowArtworkDiscovery(true);
        trackLocationVisit('artwork');
      }
    }

    // Check Work area 
    if (!hasVisitedWork && !showWorkDiscovery) {
      // Work area 
      const workMinX = -2;   
      const workMaxX = 2;    
      const workMinZ = 7;    
      const workMaxZ = 33;  
      
      if (position.x >= workMinX && position.x <= workMaxX && 
          position.z >= workMinZ && position.z <= workMaxZ) {
        setHasVisitedWork(true);
        setShowWorkDiscovery(true);
        trackLocationVisit('work');
      }
    }
  }, [hasVisitedProjectStudio, showProjectStudioDiscovery, hasVisitedLearningOutcomes, showLearningOutcomesDiscovery, hasVisitedArtwork, showArtworkDiscovery, hasVisitedWork, showWorkDiscovery, trackLocationVisit]);

  // Watch for newly unlocked achievements
  useEffect(() => {
    if (newlyUnlockedAchievement) {
      setCurrentAchievementTitle(newlyUnlockedAchievement);
      setShowAchievementNotification(true);
    }
  }, [newlyUnlockedAchievement]);

  const handleAchievementNotificationComplete = useCallback(() => {
    setShowAchievementNotification(false);
    clearNewlyUnlocked();
  }, [clearNewlyUnlocked]);

  // Handle slab interaction overlay
  const handleSlabInteraction = useCallback((isOnSlab: boolean, slabType?: string, githubUrl?: string) => {
    const mapSlabTypeToId = (type?: string): string | null => {
      if (!type) return null;
      if (type === 'main') return 'main-slab';
      if (type.startsWith('lo')) return type; 
      return type;
    };

    setActiveSlabId(isOnSlab ? mapSlabTypeToId(slabType) : null);

    if (isOnSlab) {
      // Calculate overlay position 
      const centerX = window.innerWidth / 2;
      const bottomY = window.innerHeight - 250; 
      
      setOverlayPosition(prev => {
        if (prev.x !== centerX || prev.y !== bottomY) {
          return { x: centerX, y: bottomY };
        }
        return prev;
      });
      
      // Set interaction text based on slab type
      switch (slabType) {
        case 'main':
          setInteractionText('Menu');
          break;
        case 'lo1':
          setInteractionText('LO 1: Conceptualize & Design');
          break;
        case 'lo2':
          setInteractionText('LO 2: Transferable Production');
          break;
        case 'lo3':
          setInteractionText('LO 3: Creative Iterations');
          break;
        case 'lo4':
          setInteractionText('LO 4: Professional Standards');
          break;
        case 'lo5':
          setInteractionText('LO 5: Personal Leadership');
          break;
        case 'project-studio':
          setInteractionText('Studio SeaMonkeys');
          break;
        case 'smaller-block':
          setInteractionText('IronFilms Project');
          break;
        case 'artwork':
          setInteractionText('Artwork Gallery');
          break;
        case 'github-holleman':
          setInteractionText('Open GitHub');
          break;
        case 'github-castle':
          setInteractionText('Open GitHub');
          break;
        case 'github-space':
          setInteractionText('Open GitHub');
          break;
        case 'github-spotify':
          setInteractionText('Open GitHub');
          break;
        case 'website-holleman':
          setInteractionText('View Holleman Project');
          break;
        case 'website-castle':
          setInteractionText('View Castle Portfolio');
          break;
        case 'website-space':
          setInteractionText('View Space Portfolio');
          break;
        case 'website-spotify':
          setInteractionText('View Spotify Portfolio');
          break;
        case 'elevator':
          setInteractionText('Use Elevator');
          break;
        default:
          setInteractionText('Interact');
      }
      
      setInteractionKeyText('SPACE');
      setShowInteractionOverlay(true);
    } else {
      setShowInteractionOverlay(false);
    }
  }, []);

  // Handle billboard interaction overlay
  const handleBillboardInteraction = useCallback((isHovering: boolean, billboardKey?: string) => {
    if (!introComplete || showLoadingScreen) {
      return;
    }
    
    if (isHovering && billboardKey) {
      // Calculate overlay position 
      const centerX = window.innerWidth / 2;
      const bottomY = window.innerHeight - 250; 
      
      setOverlayPosition({ x: centerX, y: bottomY });
      
      // Set interaction text based on billboard type
      switch (billboardKey) {
        case 'billboard1':
          setInteractionText('View Castle Portfolio');
          break;
        case 'billboard2':
          setInteractionText('View Holleman Project');
          break;
        case 'billboard3':
          setInteractionText('View Space Portfolio');
          break;
        case 'billboard4':
          setInteractionText('View Spotify Portfolio');
          break;
        default:
          setInteractionText('View Portfolio');
      }
      
      setInteractionKeyText('CLICK');
      setIsHoveringBillboard(true);
      setShowInteractionOverlay(true);
    } else {
      setIsHoveringBillboard(false);
      // Only hide overlay if not on a slab
      if (!canInteract) {
        setShowInteractionOverlay(false);
      }
    }
  }, [canInteract, introComplete, showLoadingScreen]);

  // Handle train state updates
  const handleTrainStateUpdate = useCallback((state: {
    isStopped: boolean;
    position: [number, number, number];
    rotation: number;
  }) => {
    const prevStopped = trainStateRef.current.isStopped;
    // Update ref immediately 
    trainStateRef.current = state;
    // Update state for React re-renders
    setTrainState(state);
    
    // If on train and it stopped, show exit prompt
    if (isOnTrain && state.isStopped) {
      setInteractionText('Exit Train');
      setInteractionKeyText('SPACE');
      const centerX = window.innerWidth / 2;
      const bottomY = window.innerHeight - 250;
      setOverlayPosition({ x: centerX, y: bottomY });
      setShowInteractionOverlay(true);
      setCanInteract(true);
      return;
    }
    
    // If on train and moving, hide prompt
    if (isOnTrain && !state.isStopped) {
      setShowInteractionOverlay(false);
      setCanInteract(false);
      return;
    }
    
    // Only check for boarding when train JUST stopped (not every frame)
    if (state.isStopped && !prevStopped && !isOnTrain) {
      const characterPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
      
      // Only check if character is in the train zone 
      const isInTrainZone = characterPos[2] > 15 && characterPos[2] < 25 && 
                            characterPos[0] > -10 && characterPos[0] < 10;
      
      if (isInTrainZone) {
        const distanceToTrain = Math.sqrt(
          Math.pow(characterPos[0] - state.position[0], 2) +
          Math.pow(characterPos[2] - state.position[2], 2)
        );
        
        // If character is within 4 units of stopped train, show boarding prompt
        if (distanceToTrain < 4) {
          setInteractionText('Board Train');
          setInteractionKeyText('SPACE');
          const centerX = window.innerWidth / 2;
          const bottomY = window.innerHeight - 250;
          setOverlayPosition({ x: centerX, y: bottomY });
          setShowInteractionOverlay(true);
          setCanInteract(true);
        }
      }
    }
    
    // Clear prompt when train starts moving again
    if (!state.isStopped && prevStopped && !isOnTrain) {
      setShowInteractionOverlay(false);
      setCanInteract(false);
    }
  }, [isOnTrain]);

  const handleMovementStart = useCallback(() => {
    if (showMenu) {
      setShowMenu(false);
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
    }
    if (showContent) {
      setShowContent(false);
      setCurrentContent(null);
      setCurrentSlabKey(null);
    }
    setMenuDelayOver(true);
  }, [showMenu, showContent]);

  const handleSpacePress = useCallback(() => {
    // Disable space press during intro/loading/character selection
    if (!introComplete || showLoadingScreen || showCharacterSelection) return;
    
    if (!showMenu && !showContent) {
      const characterPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
      
      // Handle train boarding/exiting 
      const currentTrainState = trainStateRef.current;
      
      if (isOnTrain) {
        // Exit train (only when stopped)
        if (currentTrainState.isStopped) {
          // First set isOnTrain to false so character re-renders
          setIsOnTrain(false);
          // Then teleport character back to boarding position 
          setTimeout(() => {
            if (characterControllerRef.current?.teleportTo) {
              characterControllerRef.current.teleportTo(trainBoardingPositionRef.current);
            }
          }, 10);
          setShowInteractionOverlay(false);
          setCanInteract(false);
        }
        return;
      } else if (currentTrainState.isStopped) {
        // Check if near train
        const distanceToTrain = Math.sqrt(
          Math.pow(characterPos[0] - currentTrainState.position[0], 2) +
          Math.pow(characterPos[2] - currentTrainState.position[2], 2)
        );
        
        if (distanceToTrain < 4) {
          // Store boarding position before hiding character
          trainBoardingPositionRef.current = [...characterPos] as [number, number, number];
          // Board the train 
          setIsOnTrain(true);
          setShowInteractionOverlay(false);
          setCanInteract(false);
          return;
        }
      }
      
      // Check interaction conditions directly here (don't rely on canInteract state)
      const contentCheck = getContentForSlab(characterPos[0], characterPos[2]);
      const isOnMiddleSlabCheck = characterPos[0] >= -0.45 && characterPos[0] <= 0.45 && 
                                 characterPos[2] >= -0.45 && characterPos[2] <= 0.45;
      const isOnElevatorPressurePlateCheck = isOnElevator(characterPos[0], characterPos[2]);
      
      // Check GitHub slabs directly
      const githubSlabsCheck = [
        { x: 1.2, z: 9.15, url: 'https://github.com/yfaneee/CastlePortfolio' },
        { x: 1.2, z: 16.65, url: 'https://github.com/yfaneee/holleman' },
        { x: 1.2, z: 24.15, url: 'https://github.com/yfaneee/SpacePortfolio' },
        { x: 1.2, z: 31.65, url: 'https://github.com/yfaneee/SpotifyFolio' }
      ];
      
      const isOnGithubSlabCheck = githubSlabsCheck.some(slab => 
        characterPos[0] >= slab.x - 0.45 && characterPos[0] <= slab.x + 0.45 && 
        characterPos[2] >= slab.z - 0.45 && characterPos[2] <= slab.z + 0.45
      );
      
      // Check website button slabs directly
      const websiteSlabsCheck = [
        { x: -1, z: 9.15, url: 'https://castle-portfolio.vercel.app/', key: 'billboard1' },
        { x: -1, z: 16.65, url: 'https://holleman.vercel.app/', key: 'billboard2' },
        { x: -1, z: 24.15, url: 'https://space-portfolio-one-mu.vercel.app/', key: 'billboard3' },
        { x: -1, z: 31.65, url: 'https://spotify-folio.vercel.app/', key: 'billboard4' }
      ];
      
      const isOnWebsiteSlabCheck = websiteSlabsCheck.some(slab => 
        characterPos[0] >= slab.x - 0.45 && characterPos[0] <= slab.x + 0.45 && 
        characterPos[2] >= slab.z - 0.45 && characterPos[2] <= slab.z + 0.45
      );
      
      const canInteractNow = !!(contentCheck || isOnMiddleSlabCheck || isOnElevatorPressurePlateCheck || isOnGithubSlabCheck || isOnWebsiteSlabCheck);
      
      if (!canInteractNow) {
        return;
      }
      
      // Use the direct checks we already did above
      const currentGithubSlab = githubSlabsCheck.find(slab => 
        characterPos[0] >= slab.x - 0.45 && characterPos[0] <= slab.x + 0.45 && 
        characterPos[2] >= slab.z - 0.45 && characterPos[2] <= slab.z + 0.45
      );
      
      const currentWebsiteButtonSlab = websiteSlabsCheck.find(slab => 
        characterPos[0] >= slab.x - 0.45 && characterPos[0] <= slab.x + 0.45 && 
        characterPos[2] >= slab.z - 0.45 && characterPos[2] <= slab.z + 0.45
      );
      
      if (currentGithubSlab) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = currentGithubSlab.url;
        } else {
          window.open(currentGithubSlab.url, '_blank');
        }
        return;
      }
      
      
      if (currentWebsiteButtonSlab) {
        // Trigger billboard animation (same as clicking billboard)
        triggerBillboardClick(currentWebsiteButtonSlab.key);
        return;
      }
      
      // Check if on elevator and trigger it
      if (isOnElevatorPressurePlateCheck) {
        triggerElevator();
        return;
      }
      
      // Get content for the current slab
      const content = getContentForSlab(characterPos[0], characterPos[2]);
      const slabKey = getSlabKeyFromPosition(characterPos[0], characterPos[2]);
      
      const isOnMiddleSlab = characterPos[0] >= -0.45 && characterPos[0] <= 0.45 && 
                            characterPos[2] >= -0.45 && characterPos[2] <= 0.45;
      
      if (content) {
        setCurrentContent(content);
        setCurrentSlabKey(slabKey);
        setShowContent(true);
        // Track content tab opening for achievements
        if (slabKey) {
          const slabIdMatch = slabKey.match(/staircase-slab-(\d)/);
          if (slabIdMatch) {
            trackContentTabOpen(`lo${slabIdMatch[1]}`);
          }
        }
      } else if (isOnMiddleSlab) {
        setShowMenu(true);
      } else {
        setShowMenu(true);
      }
    }
  }, [showMenu, showContent, triggerBillboardClick, introComplete, showLoadingScreen, showCharacterSelection, trackContentTabOpen, isOnTrain]);

  // Mobile interact button handler (must be after handleSpacePress)
  const handleMobileInteract = useCallback((isPressed: boolean) => {
    if (isPressed) {
      handleSpacePress();
    }
  }, [handleSpacePress]);

  const handleCloseContent = useCallback(() => {
    setShowContent(false);
    setCurrentContent(null);
    setCurrentSlabKey(null);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setShowMenu(false);
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current);
      menuTimerRef.current = null;
    }
  }, []);



  const handleMenuIconClick = useCallback(() => {
    // Disable menu icon clicks during intro/loading/character selection
    if (!introComplete || showLoadingScreen || showCharacterSelection) return;
    
    if (showContent && !isTransitioning) {
      setIsTransitioning(true);
      setShowContent(false);
      setCurrentContent(null);
      setShowMenu(true);
      setMenuDelayOver(true);
      setIsTransitioning(false);
    } else if (!showMenu && !isTransitioning) {
      // Check if camera needs to return to character 
      const checkCameraMoved = (window as any).__checkIfCameraMoved;
      const resetCamera = (window as any).__resetCameraToCharacter;
      
      const needsCameraReset = checkCameraMoved ? checkCameraMoved() : false;
      
      if (needsCameraReset && resetCamera) {
        // Camera has been moved 
        resetCamera();
        
        setTimeout(() => {
          setShowMenu(true);
          if (menuTimerRef.current) {
            clearTimeout(menuTimerRef.current);
            menuTimerRef.current = null;
          }
          setMenuDelayOver(true);
        }, 1000);
      } else {
        // Camera is already on character
        setShowMenu(true);
        if (menuTimerRef.current) {
          clearTimeout(menuTimerRef.current);
          menuTimerRef.current = null;
        }
        setMenuDelayOver(true);
      }
    } else if (showMenu && !isTransitioning) {
      setShowMenu(false);
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
    }
  }, [showMenu, showContent, isTransitioning, introComplete, showLoadingScreen, showCharacterSelection]);

  const handleNavigateToLocation = useCallback((location: string) => {
    // Hide menu
    setShowMenu(false);
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current);
      menuTimerRef.current = null;
    }
    
    // Teleport character to location
    if (characterControllerRef.current) {
      characterControllerRef.current.teleportToLocation(location);
      
      setTimeout(() => {
        const newPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
        const content = getContentForSlab(newPos[0], newPos[2]);
        const slabKey = getSlabKeyFromPosition(newPos[0], newPos[2]);
        
        if (content) {
          setCurrentContent(content);
          setCurrentSlabKey(slabKey);
          setShowContent(true);
          // Track content tab opening for achievements
          if (slabKey) {
            const slabIdMatch = slabKey.match(/staircase-slab-(\d)/);
            if (slabIdMatch) {
              trackContentTabOpen(`lo${slabIdMatch[1]}`);
            }
          }
        }
      }, 1200); 
    }
  }, [trackContentTabOpen]);

  // Navigate to next slab with magic transition
  const handleNavigateNext = useCallback(() => {
    if (!currentSlabKey || !characterControllerRef.current || isNavigatingSlabs) return;
    
    const currentIndex = slabNavigationOrder.indexOf(currentSlabKey);
    const nextIndex = (currentIndex + 1) % slabNavigationOrder.length;
    const nextSlabKey = slabNavigationOrder[nextIndex];
    const nextLocation = getLocationFromSlabKey(nextSlabKey);
    const nextContent = contentData[nextSlabKey];
    
    if (!nextContent) return;
    
    // Start slab navigation mode 
    setIsNavigatingSlabs(true);
    
    // Quick fade out effect 
    const fadeOutDuration = 600; 
    const startTime = Date.now();
    
    const magicalFadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / fadeOutDuration, 1);
      
      // Fast easing - quickly fade to invisible
      const eased = progress * progress * (3 - 2 * progress); 
      
      // Fade out opacity VERY quickly
      setCharacterOpacity(Math.pow(1 - eased, 2)); 
      
      // Minimal scale effect 
      setCharacterScale(1 - eased * 0.2); 
      
      // Spin rotation effect 
      const spinEased = 1 - Math.pow(1 - progress, 3);
      const spinSpeed = spinEased * 2; 
      setCharacterRotationY(spinSpeed * Math.PI);
      
      const floatHeight = eased * 0.5; 
      setCharacterPositionOffset([0, floatHeight, 0]); 
      
      if (progress < 1) {
        requestAnimationFrame(magicalFadeOut);
      } else {
        // Character is now invisible 
        setCharacterOpacity(0);
        setCharacterScale(1);
        setCharacterRotationY(0);
        setCharacterPositionOffset([0, 0, 0]);
        
        // Teleport while hidden
        setTimeout(() => {
          characterControllerRef.current.teleportToLocation(nextLocation);
          
          // Update content immediately
          setCurrentContent(nextContent);
          setCurrentSlabKey(nextSlabKey);
          
          // Track content tab opening for achievements (Q/E navigation)
          if (nextSlabKey) {
            const slabIdMatch = nextSlabKey.match(/staircase-slab-(\d)/);
            if (slabIdMatch) {
              trackContentTabOpen(`lo${slabIdMatch[1]}`);
            }
          }
          
          setTimeout(() => {
            shiftElevator.wasOnElevator = false;
            shiftElevator.isMoving = false;
            if (nextSlabKey === 'artwork-platform-slab') {
              shiftElevator.currentY = shiftElevator.bottomY;
            } else {
              shiftElevator.currentY = shiftElevator.topY;
            }
          }, 50);
          
          // Wait for camera to arrive, then reappear at slab
          setTimeout(() => {
            setIsNavigatingSlabs(false);
            
            const fadeInStartTime = Date.now();
            const fadeInDuration = 400; 
            
            const magicalFadeIn = () => {
              const elapsed = Date.now() - fadeInStartTime;
              const progress = Math.min(elapsed / fadeInDuration, 1);
              
              // Smooth easing
              const eased = progress * progress * (3 - 2 * progress);
              
              // Fade in opacity smoothly
              setCharacterOpacity(eased);
              
              // Always normal scale
              setCharacterScale(1);
              
              // No rotation during fade in 
              setCharacterRotationY(0);
              
              // No vertical offset 
              setCharacterPositionOffset([0, 0, 0]);
              
              if (progress < 1) {
                requestAnimationFrame(magicalFadeIn);
              } else {
                // Reset all effects to normal
                setCharacterOpacity(1);
                setCharacterScale(1);
                setCharacterRotationY(0);
                setCharacterPositionOffset([0, 0, 0]);
                // Reset movement state to fix animation bug after navigation
                if (characterControllerRef.current && characterControllerRef.current.resetMovementState) {
                  characterControllerRef.current.resetMovementState();
                }
              }
            };
            
            magicalFadeIn();
          }, 400);
        }, 100);
      }
    };
    
    magicalFadeOut();
  }, [currentSlabKey, isNavigatingSlabs, trackContentTabOpen]);

  // Navigate to previous slab with magic transition
  const handleNavigatePrev = useCallback(() => {
    if (!currentSlabKey || !characterControllerRef.current || isNavigatingSlabs) return;
    
    const currentIndex = slabNavigationOrder.indexOf(currentSlabKey);
    const prevIndex = (currentIndex - 1 + slabNavigationOrder.length) % slabNavigationOrder.length;
    const prevSlabKey = slabNavigationOrder[prevIndex];
    const prevLocation = getLocationFromSlabKey(prevSlabKey);
    const prevContent = contentData[prevSlabKey];
    
    if (!prevContent) return;
    
    // Start slab navigation mode 
    setIsNavigatingSlabs(true);
    
    // Quick fade out effect 
    const fadeOutDuration = 600; 
    const startTime = Date.now();
    
    const magicalFadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / fadeOutDuration, 1);
      
      // Fast easing 
      const eased = progress * progress * (3 - 2 * progress);
      
      // Fade out opacityy
      setCharacterOpacity(Math.pow(1 - eased, 2)); 
      
      // Minimal scale effect 
      setCharacterScale(1 - eased * 0.2); 
      
      const spinEased = 1 - Math.pow(1 - progress, 3);
      const spinSpeed = spinEased * -2; 
      setCharacterRotationY(spinSpeed * Math.PI);
      
      // Minimal vertical float, no wobble
      const floatHeight = eased * 0.5;
      setCharacterPositionOffset([0, floatHeight, 0]); 
      
      if (progress < 1) {
        requestAnimationFrame(magicalFadeOut);
      } else {
        // Character is now invisible 
        setCharacterOpacity(0);
        setCharacterScale(1);
        setCharacterRotationY(0);
        setCharacterPositionOffset([0, 0, 0]);
        
        // Teleport while hidden
        setTimeout(() => {
          characterControllerRef.current.teleportToLocation(prevLocation);
          
          // Update content immediately
          setCurrentContent(prevContent);
          setCurrentSlabKey(prevSlabKey);
          
          // Track content tab opening for achievements (Q/E navigation)
          if (prevSlabKey) {
            const slabIdMatch = prevSlabKey.match(/staircase-slab-(\d)/);
            if (slabIdMatch) {
              trackContentTabOpen(`lo${slabIdMatch[1]}`);
            }
          }
          
          setTimeout(() => {
            shiftElevator.wasOnElevator = false;
            shiftElevator.isMoving = false;
            if (prevSlabKey === 'artwork-platform-slab') {
              shiftElevator.currentY = shiftElevator.bottomY;
            } else {
              shiftElevator.currentY = shiftElevator.topY;
            }
          }, 50);
          
          // Wait for camera to arrive, then reappear at slab
          setTimeout(() => {
            setIsNavigatingSlabs(false);
            
            const fadeInStartTime = Date.now();
            const fadeInDuration = 400; 
            
            const magicalFadeIn = () => {
              const elapsed = Date.now() - fadeInStartTime;
              const progress = Math.min(elapsed / fadeInDuration, 1);
              
              // Smooth easing
              const eased = progress * progress * (3 - 2 * progress);
              
              // Fade in opacity smoothly
              setCharacterOpacity(eased);
              
              // Always normal scale
              setCharacterScale(1);
              
              // No rotation during fade in 
              setCharacterRotationY(0);
              
              // No vertical offset 
              setCharacterPositionOffset([0, 0, 0]);
              
              if (progress < 1) {
                requestAnimationFrame(magicalFadeIn);
              } else {
                // Reset all effects to normal
                setCharacterOpacity(1);
                setCharacterScale(1);
                setCharacterRotationY(0);
                setCharacterPositionOffset([0, 0, 0]);
                // Reset movement state to fix animation bug after navigation
                if (characterControllerRef.current && characterControllerRef.current.resetMovementState) {
                  characterControllerRef.current.resetMovementState();
                }
              }
            };
            
            magicalFadeIn();
          }, 400);
        }, 100);
      }
    };
    
    magicalFadeOut();
  }, [currentSlabKey, isNavigatingSlabs, trackContentTabOpen]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
      }
    };
  }, []);
  
  // Cleanup textures and resources on app unmount
  React.useEffect(() => {
    return () => {
      disposeBillboardTextures(); // Dispose all preloaded textures
    };
  }, []);

  // Character selection handlers
  const handleCharacterSelect = useCallback((character: CharacterOption) => {
    setSelectedCharacter(character);
  }, []);

  const handleCharacterSelectionStart = useCallback(() => {
    setShowCharacterSelection(false);
    setShowLoadingScreen(false);
    
    // Start music on user interaction (bypasses autoplay restrictions)
    if (audioRef.current && !isMusicPlayingRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsMusicPlaying(true);
          isMusicPlayingRef.current = true;
          // Track first song
          trackSongPlayed(0);
        }).catch((error) => {
          console.log('Audio playback failed:', error);
        });
      }
    }
  }, [trackSongPlayed]);

  // Toggle music handler
  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
        isMusicPlayingRef.current = false;
      } else {
        audioRef.current.play();
        setIsMusicPlaying(true);
        isMusicPlayingRef.current = true;
      }
    }
  }, [isMusicPlaying]);

  // Initialize music on app start
  useEffect(() => {
    const playlist = playlistRef.current;
    audioRef.current = new Audio(playlist[0]);
    audioRef.current.volume = 0.5;
    
    // Handle song end 
    const handleSongEnd = () => {
      currentSongIndexRef.current = (currentSongIndexRef.current + 1) % playlist.length;
      if (audioRef.current) {
        audioRef.current.src = playlist[currentSongIndexRef.current];
        // Use ref to get current playing state
        if (isMusicPlayingRef.current) {
          audioRef.current.play().then(() => {
            // Track song when it starts playing
            trackSongPlayed(currentSongIndexRef.current);
          }).catch(() => {
            // Ignore play errors
          });
        }
      }
    };
    
    audioRef.current.addEventListener('ended', handleSongEnd);
    
    // Try to autoplay (may be blocked by browser)
    audioRef.current.play().then(() => {
      setIsMusicPlaying(true);
      isMusicPlayingRef.current = true;
      // Track first song
      trackSongPlayed(0);
    }).catch(() => {
      // music will start when user clicks START button
      setIsMusicPlaying(false);
      isMusicPlayingRef.current = false;
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleSongEnd);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [trackSongPlayed]);

  // Preload collision system, character models, and billboard textures on app start
  useEffect(() => {
    preloadCommonPlatforms();
    preloadCharacterModels();
    preloadBillboardTextures(); // Preload billboard textures to prevent stuttering
  }, []);

  // Check if character is on an interactable slab and update position (optimized with 150ms interval)
  useEffect(() => {
    if (!introComplete || showMenu || showContent || isBillboardFullscreen || showWebsiteOverlay) {
      // Don't clear canInteract if on train
      if (!isOnTrain) {
        setCanInteract(false);
      }
      return;
    }

    const checkInterval = setInterval(() => {
      const characterPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
      setCurrentCharacterPosition(characterPos);
      
      // If on train, don't check other interactions
      if (isOnTrain) {
        return;
      }
      
      const isInTrainZone = characterPos[2] > 15 && characterPos[2] < 25 && 
                            characterPos[0] > -10 && characterPos[0] < 10;
      
      if (isInTrainZone) {
        const currentTrainState = trainStateRef.current;
        if (currentTrainState.isStopped) {
          const distanceToTrain = Math.sqrt(
            Math.pow(characterPos[0] - currentTrainState.position[0], 2) +
            Math.pow(characterPos[2] - currentTrainState.position[2], 2)
          );
          
          if (distanceToTrain < 4) {
            // Near stopped train
            setInteractionText('Board Train');
            setInteractionKeyText('SPACE');
            const centerX = window.innerWidth / 2;
            const bottomY = window.innerHeight - 250;
            setOverlayPosition({ x: centerX, y: bottomY });
            setShowInteractionOverlay(true);
            setCanInteract(true);
            return;
          }
        }
      }
      
      const content = getContentForSlab(characterPos[0], characterPos[2]);
      const isOnMiddleSlab = characterPos[0] >= -0.45 && characterPos[0] <= 0.45 && 
                            characterPos[2] >= -0.45 && characterPos[2] <= 0.45;
      const isOnElevatorPressurePlate = isOnElevator(characterPos[0], characterPos[2]);
      
      // Check if on GitHub project slabs (MOVED SOUTH)
      const githubProjectSlabs = [
        { x: 1.2, z: 9.15 },
        { x: 1.2, z: 16.65 },
        { x: 1.2, z: 24.15 },
        { x: 1.2, z: 31.65 }
      ];
      
      // Check if on NEW WEBSITE BUTTON SLABS
      const websiteButtonSlabs = [
        { x: -1, z: 9.15 },
        { x: -1, z: 16.65 },
        { x: -1, z: 24.15 },
        { x: -1, z: 31.65 }
      ];
      
      const isOnGithubSlab = githubProjectSlabs.some(slab => 
        characterPos[0] >= slab.x - 0.45 && characterPos[0] <= slab.x + 0.45 && 
        characterPos[2] >= slab.z - 0.45 && characterPos[2] <= slab.z + 0.45
      );
      
      const isOnWebsiteButtonSlab = websiteButtonSlabs.some(slab => 
        characterPos[0] >= slab.x - 0.45 && characterPos[0] <= slab.x + 0.45 && 
        characterPos[2] >= slab.z - 0.45 && characterPos[2] <= slab.z + 0.45
      );
      
      setCanInteract(!!(content || isOnMiddleSlab || isOnElevatorPressurePlate || isOnGithubSlab || isOnWebsiteButtonSlab));
    }, 200); 

    return () => clearInterval(checkInterval);
  }, [introComplete, showMenu, showContent, isBillboardFullscreen, showWebsiteOverlay, isOnTrain]);

  // Handle ESC key to open/close menu or content, and clear hover on movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Clear hover state when movement keys are pressed 
      if (key === 'w' || key === 'a' || key === 's' || key === 'd' || 
          key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
        setHoveredSlabId(null);
        setIsHoveringBillboard(false);
        document.body.style.cursor = 'default';
      }
      
      if (event.key === 'Escape' && !isTransitioning) {
        // Disable ESC during intro/loading/character selection
        if (!introComplete || showLoadingScreen || showCharacterSelection) return;
        
        if (showContent) {
          handleCloseContent();
        } else if (showMenu) {
          handleCloseMenu();
        } else {
          handleMenuIconClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu, showContent, isTransitioning, handleMenuIconClick, handleCloseContent, handleCloseMenu, introComplete, showLoadingScreen, showCharacterSelection]);

  // Auto-rotate character when menu or content opens for better presentation
  useEffect(() => {
    if (showMenu) {
      // Face character diagonally towards camera 
      setCharacterRotationY( Math.PI / 4);
    } else if (showContent) {
      // Face character SOUTH 
      setCharacterRotationY(Math.PI / 2); 
    } else {
      // When both close
      setCharacterRotationY(0);
    }
  }, [showMenu, showContent]);

  return (
    <Router>
      <div className="App">
        {/* ClickSpark overlay for the entire app */}
        <ClickSpark
          sparkColor='#fff'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <div style={{ 
            width: '100vw', 
            height: '100vh', 
            position: 'relative',
            background: 'linear-gradient(180deg, #E5D3FF 0%, #D9C7FF 28%, #D19DDB 55%, #B244E5 78%, #51258E 100%)',
          }}>
            {/* SVG Noise Filter Definition */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <defs>
                <filter id="perlin-noise" x="0%" y="0%" width="100%" height="100%">
                  <feTurbulence 
                    type="fractalNoise" 
                    baseFrequency="0.7" 
                    numOctaves="4" 
                    stitchTiles="stitch"
                    result="noise"
                  />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
              </defs>
            </svg>
            
            {/* Noise Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              filter: 'url(#perlin-noise)',
              opacity: 0.1,
              pointerEvents: 'none',
              zIndex: 0,
            }} />
            
            {/* Three.js Canvas for the isometric world - always visible */}
            <Canvas
          camera={{
            position: [10, 10, 10],
            fov: 50
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance', 
            stencil: false, 
            depth: true,
            preserveDrawingBuffer: false, 
            failIfMajorPerformanceCaveat: false,
            precision: 'highp', 
            logarithmicDepthBuffer: false,
            outputColorSpace: 'srgb'
          }}
          dpr={[1, 2]}
          performance={{
            min: 0.5, 
            max: 1.0, 
            debounce: 200
          }}
          style={{ 
            position: 'relative',
            zIndex: 1,
            width: '100vw', 
            height: '100vh',
            background: 'transparent',
            filter: `brightness(${0.7 + 0.3 * introProgress})`,
            touchAction: 'none',
            pointerEvents: 'auto'
          }}
          onTouchStart={(e) => {
            if (e.target !== e.currentTarget || !characterControllerRef.current) return;

            const touch = e.touches[0];
            const controlZoneHeight = window.innerHeight * 0.35;
            const isInControlZone =
              touch.clientY > window.innerHeight - controlZoneHeight;

            if (isInControlZone) return;

            e.preventDefault();
            characterControllerRef.current.handleTouch(touch);
          }}
          onTouchEnd={(e) => {
            if (e.target === e.currentTarget && characterControllerRef.current) {
              e.preventDefault();
              characterControllerRef.current.stopMovement();
            }
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget && characterControllerRef.current) {
              e.preventDefault();
              characterControllerRef.current.handleTouch(e.touches[0]);
            }
          }}
        >
                <IsometricScene
                  onIntroComplete={handleIntroComplete}
                  introComplete={introComplete}
                  showMenu={showMenu}
                  showContent={showContent}
                  isTransitioning={isTransitioning}
                  onMovementStart={handleMovementStart}
                  onSpacePress={handleSpacePress}
                  onNavigatePrev={handleNavigatePrev}
                  onNavigateNext={handleNavigateNext}
                  characterControllerRef={characterControllerRef}
                  showLoadingScreen={showLoadingScreen}
                  characterOpacity={characterOpacity}
                  characterScale={characterScale}
                  characterRotationY={characterRotationY}
                  characterPositionOffset={characterPositionOffset}
                  isNavigatingSlabs={isNavigatingSlabs}
                  selectedCharacterModel={selectedCharacter.modelPath}
                  onPositionUpdate={handlePositionUpdate}
                  onSlabInteraction={handleSlabInteraction}
                  onBillboardInteraction={handleBillboardInteraction}
                  onBillboardFullscreenStart={handleBillboardFullscreenStart}
                  onBillboardFullscreenEnd={handleBillboardFullscreenEnd}
                  onShowWebsite={handleShowWebsite}
                  onHideWebsite={handleHideWebsite}
                  showWebsiteOverlay={showWebsiteOverlay}
                  triggerBillboardExit={triggerBillboardExit}
                  onBillboardExitComplete={() => setTriggerBillboardExit(false)}
                  currentCharacterPosition={currentCharacterPosition}
                  onBillboardRef={handleBillboardRef}
                  onSlabHover={handleSlabHover}
                  onSlabClick={handleSlabClick}
                  activeSlabId={activeSlabId}
                  onIntroProgress={setIntroProgress}
                  introProgress={introProgress}
                  onTrainStateUpdate={handleTrainStateUpdate}
                  isOnTrain={isOnTrain}
                  trainPosition={trainState.position}
                  trainRotation={trainState.rotation}
                />
            </Canvas>
            
            {/* Controls UI Overlay - always mounted, handles its own visibility */}
            <ControlsUI introComplete={introComplete} showCharacterSelection={showCharacterSelection} />
        
            {/* UI Overlay - always mounted; controls hint visible after intro and after menu delay, hidden when website overlay is open */}
            <UI 
              visible={introComplete && !showMenu && menuDelayOver && !showWebsiteOverlay} 
              canInteract={canInteract}
              showContent={showContent}
            />

            {/* Menu Overlay - hidden when loading screen is visible */}
            {!showLoadingScreen && (
              <MenuOverlay 
                isVisible={showMenu} 
                onNavigateToLocation={handleNavigateToLocation} 
                onClose={handleCloseMenu} 
                isMusicPlaying={isMusicPlaying} 
                onToggleMusic={toggleMusic}
                selectedCharacter={selectedCharacter}
                onCharacterSelect={handleCharacterSelect}
              />
            )}

            {/* Content Box - hidden when loading screen is visible */}
            {!showLoadingScreen && (
              <Content 
                isVisible={showContent} 
                content={currentContent}
                onNavigatePrev={handleNavigatePrev}
                onNavigateNext={handleNavigateNext}
                canNavigatePrev={!!currentSlabKey}
                canNavigateNext={!!currentSlabKey}
                onClose={handleCloseContent}
                onGSplatLoad={trackGSplatViewerUsage}
              />
            )}

            {/* Menu Icon - visible when intro is complete and website overlay is not open */}
            {!showLoadingScreen && introComplete && !showWebsiteOverlay && (
              <MenuIcon onClick={handleMenuIconClick} isVisible={true} isMenuOpen={showMenu} />
            )}

            {/* Character Selection Screen */}
            <CharacterSelection
              isVisible={showCharacterSelection}
              onCharacterSelect={handleCharacterSelect}
              onStart={handleCharacterSelectionStart}
            />

            {/* Location Discovery Notification */}
            <LocationDiscovery
              isVisible={showLocationDiscovery}
              onComplete={handleLocationDiscoveryComplete}
            />

            {/* Project & Studio Discovery Notification */}
            <LocationDiscovery
              isVisible={showProjectStudioDiscovery}
              onComplete={handleProjectStudioDiscoveryComplete}
              locationName="Project & Studio"
            />

            {/* Learning Outcomes Discovery Notification */}
            <LocationDiscovery
              isVisible={showLearningOutcomesDiscovery}
              onComplete={handleLearningOutcomesDiscoveryComplete}
              locationName="Learning Outcomes"
            />

            {/* Artwork Discovery Notification */}
            <LocationDiscovery
              isVisible={showArtworkDiscovery}
              onComplete={handleArtworkDiscoveryComplete}
              locationName="Artwork"
            />

            {/* Work Discovery Notification */}
            <LocationDiscovery
              isVisible={showWorkDiscovery}
              onComplete={handleWorkDiscoveryComplete}
              locationName="Work"
            />

            {/* Achievement Notification */}
            <AchievementNotification
              isVisible={showAchievementNotification}
              onComplete={handleAchievementNotificationComplete}
              achievementTitle={currentAchievementTitle}
            />

            {/* Interaction Overlay */}
            <InteractionOverlay
              isVisible={!isSlabClickAnimating && ((showInteractionOverlay && !showMenu && !showContent && (canInteract || isHoveringBillboard)) || (hoveredSlabId !== null && !showMenu && !showContent && !isBillboardFullscreen))}
              interactionText={hoveredSlabId ? getSlabInteractionText(hoveredSlabId) : interactionText}
              position={hoveredSlabId ? hoveredSlabPosition : overlayPosition}
              keyText={hoveredSlabId ? 'CLICK' : interactionKeyText}
            />

            {/* Website Overlay */}
            <WebsiteOverlay
              isVisible={showWebsiteOverlay}
              websiteUrl={currentWebsiteUrl}
              billboardKey={currentBillboardKey}
              onClose={handleHideWebsite}
            />

            {/* Top HUD Navigation */}
            {!showLoadingScreen && introComplete && !showWebsiteOverlay && (
              <TopHUD
                characterPosition={currentCharacterPosition}
                isVisible={true}
                showMenu={showMenu}
                showContent={showContent}
                currentContent={currentContent}
              />
            )}

            {/* Rotate Phone Screen - Only on mobile in portrait */}
            <RotatePhoneScreen />

            {/* Add to Home Screen Prompt */}
            <AddToHomeScreenPrompt />

            {/* Mobile D-pad Controls */}
            <MobileDpad
              onDirectionChange={handleMobileDpadDirection}
              visible={introComplete && !showMenu && !showContent && !showLoadingScreen && !showWebsiteOverlay}
            />

            {/* Mobile Interact Button */}
            <MobileInteractButton
              onInteract={handleMobileInteract}
              visible={introComplete && !showMenu && !showContent && !showLoadingScreen && !showWebsiteOverlay}
            />

            {/* Repository Links - Fixed on right side */}
            <RepoLinks
              isVisible={introComplete && !showLoadingScreen && !showWebsiteOverlay}
              isMusicPlaying={isMusicPlaying}
              onToggleMusic={toggleMusic}
              hideWhenMenuOpen={showMenu}
            />
        
          </div>
        </ClickSpark>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AchievementProvider>
      <AppContent />
    </AchievementProvider>
  );
}

export default App;
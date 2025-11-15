import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './components/IsometricScene';
import UI from './components/UI';
import ControlsUI from './components/ControlsUI';
import MenuOverlay from './components/MenuOverlay';
import InfoPanel from './components/InfoPanel';
import MenuIcon from './components/MenuIcon';
import Content from './components/Content';
import TopHUD from './components/TopHUD';
import CharacterSelection, { CharacterOption } from './components/CharacterSelection';
import LocationDiscovery from './components/LocationDiscovery';
import InteractionOverlay from './components/InteractionOverlay';
import WebsiteOverlay from './components/WebsiteOverlay';
import ClickSpark from './components/ClickSpark';
import RotatePhoneScreen from './components/RotatePhoneScreen';
import MobileDpad from './components/MobileDpad';
import MobileInteractButton from './components/MobileInteractButton';
import { getContentForSlab, ContentItem, slabNavigationOrder, getSlabKeyFromPosition, getLocationFromSlabKey, contentData } from './data/ContentData';
import { preloadCommonPlatforms } from './utils/collisionSystem';
import { shiftElevator, isOnElevator } from './utils/elevatorSystem';
import { preloadCharacterModels } from './components/Character';
import { preloadBillboardTextures, disposeBillboardTextures } from './utils/texturePreloader';
import './App.css';
import './styles/fonts.css';

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showCharacterSelection, setShowCharacterSelection] = useState(true);
  const [showLocationDiscovery, setShowLocationDiscovery] = useState(false);
  const [showProjectStudioDiscovery, setShowProjectStudioDiscovery] = useState(false);
  const [hasVisitedProjectStudio, setHasVisitedProjectStudio] = useState(false);
  const [showLearningOutcomesDiscovery, setShowLearningOutcomesDiscovery] = useState(false);
  const [hasVisitedLearningOutcomes, setHasVisitedLearningOutcomes] = useState(false);
  const [showArtworkDiscovery, setShowArtworkDiscovery] = useState(false);
  const [hasVisitedArtwork, setHasVisitedArtwork] = useState(false);
  const [showWorkDiscovery, setShowWorkDiscovery] = useState(false);
  const [hasVisitedWork, setHasVisitedWork] = useState(false);
  const [showAllLocationsDiscovered, setShowAllLocationsDiscovered] = useState(false);
  const [hasShownAllLocationsDiscovered, setHasShownAllLocationsDiscovered] = useState(false);
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
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption>({
    id: 'character-a',
    name: 'Alex',
    modelPath: '/models/character-a.glb',
    imagePath: '/images/character-a.png'
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
  const [mobileDpadDirection, setMobileDpadDirection] = useState<{ x: number; y: number } | null>(null);
  const [mobileInteractPressed, setMobileInteractPressed] = useState(false);
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const characterControllerRef = useRef<any>(null);
  
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

  // Mobile D-pad handlers
  const handleMobileDpadDirection = useCallback((direction: { x: number; y: number } | null) => {
    console.log('App handleMobileDpadDirection:', direction);
    console.log('characterControllerRef.current:', characterControllerRef.current);
    setMobileDpadDirection(direction);
    if (characterControllerRef.current && characterControllerRef.current.handleMobileInput) {
      console.log('Calling handleMobileInput...');
      characterControllerRef.current.handleMobileInput(direction, false);
    } else {
      console.log('characterControllerRef or handleMobileInput not available!');
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

  const handleAllLocationsDiscoveredComplete = useCallback(() => {
    setShowAllLocationsDiscovered(false);
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
    setShowWebsiteOverlay(false);
    setCurrentWebsiteUrl('');
    setCurrentBillboardKey('');
    // Trigger billboard exit animation
    setTriggerBillboardExit(true);
  }, []);

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
      }
    }
  }, [hasVisitedProjectStudio, showProjectStudioDiscovery, hasVisitedLearningOutcomes, showLearningOutcomesDiscovery, hasVisitedArtwork, showArtworkDiscovery, hasVisitedWork, showWorkDiscovery]);

  // Check if all locations have been discovered
  useEffect(() => {
    if (hasVisitedProjectStudio && hasVisitedLearningOutcomes && hasVisitedArtwork && hasVisitedWork && !hasShownAllLocationsDiscovered) {
      // delay before showing the congratulations
      const timer = setTimeout(() => {
        setShowAllLocationsDiscovered(true);
        setHasShownAllLocationsDiscovered(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [hasVisitedProjectStudio, hasVisitedLearningOutcomes, hasVisitedArtwork, hasVisitedWork, hasShownAllLocationsDiscovered]);

  // Handle slab interaction overlay
  const handleSlabInteraction = useCallback((isOnSlab: boolean, slabType?: string, githubUrl?: string) => {
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
          setInteractionText('IronFilms');
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
  }, [canInteract]);

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
    if (!showMenu && !showContent) {
      const characterPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
      
      // Check interaction conditions directly here (don't rely on canInteract state)
      const contentCheck = getContentForSlab(characterPos[0], characterPos[2]);
      const isOnMiddleSlabCheck = characterPos[0] >= -0.45 && characterPos[0] <= 0.45 && 
                                 characterPos[2] >= -0.45 && characterPos[2] <= 0.45;
      const isOnElevatorPressurePlateCheck = isOnElevator(characterPos[0], characterPos[2]);
      
      // Check GitHub slabs directly
      const githubSlabsCheck = [
        { x: 1.2, z: 9.15, url: 'https://git.fhict.nl/I503826/castleportfolio' },
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
        { x: -1, z: 9.15, url: 'https://i503826.hera.fontysict.net/castle/', key: 'billboard1' },
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
        // Open GitHub link in new tab
        window.open(currentGithubSlab.url, '_blank');
        return;
      }
      
      
      if (currentWebsiteButtonSlab) {
        // Trigger billboard animation (same as clicking billboard)
        triggerBillboardClick(currentWebsiteButtonSlab.key);
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
      } else if (isOnMiddleSlab) {
        setShowMenu(true);
      } else {
        setShowMenu(true);
      }
    }
  }, [showMenu, showContent, triggerBillboardClick]);

  // Mobile interact button handler (must be after handleSpacePress)
  const handleMobileInteract = useCallback((isPressed: boolean) => {
    setMobileInteractPressed(isPressed);
    // Trigger space press when button is pressed
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
    if (showContent && !isTransitioning) {
      setIsTransitioning(true);
      setShowContent(false);
      setCurrentContent(null);
      
      // Wait for content to close, then open menu
      setTimeout(() => {
        setShowMenu(true);
        setMenuDelayOver(true);
        setIsTransitioning(false);
      }, 400); 
    } else if (!showMenu && !isTransitioning) {
      setShowMenu(true);
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
      setMenuDelayOver(true);
    } else if (showMenu && !isTransitioning) {
      setShowMenu(false);
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
    }
  }, [showMenu, showContent, isTransitioning]);

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
        }
      }, 1200); 
    }
  }, []);

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
  }, [currentSlabKey, isNavigatingSlabs]);

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
  }, [currentSlabKey, isNavigatingSlabs]);

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
  }, []);

  // Preload collision system, character models, and billboard textures on app start
  useEffect(() => {
    preloadCommonPlatforms();
    preloadCharacterModels();
    preloadBillboardTextures(); // Preload billboard textures to prevent stuttering
  }, []);

  // Check if character is on an interactable slab and update position (optimized with 150ms interval)
  useEffect(() => {
    if (!introComplete || showMenu || showContent || isBillboardFullscreen || showWebsiteOverlay) {
      setCanInteract(false);
      return;
    }

    const checkInterval = setInterval(() => {
      const characterPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
      setCurrentCharacterPosition(characterPos);
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
    }, 150); // Increased from 100ms to 150ms for better performance

    return () => clearInterval(checkInterval);
  }, [introComplete, showMenu, showContent, isBillboardFullscreen, showWebsiteOverlay]);

  // Handle ESC key to close menu or content
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isTransitioning) {
        if (showContent) {
          handleCloseContent();
        } else if (showMenu) {
          handleMenuIconClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu, showContent, isTransitioning, handleMenuIconClick, handleCloseContent]);


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
          <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* Three.js Canvas for the isometric world - always visible */}
            <Canvas
          camera={{
            position: [10, 10, 10],
            fov: 50
          }}
          style={{ 
            width: '100vw', 
            height: '100vh',
            background: 'linear-gradient(135deg, #E5D3FF 0%, #C5A3FF 50%, #A580FF 100%)',
            touchAction: 'none',
            pointerEvents: 'auto'
          }}
          onTouchStart={(e) => {
            // Only handle touch on the canvas, not UI elements
            if (e.target === e.currentTarget && characterControllerRef.current) {
              e.preventDefault();
              characterControllerRef.current.handleTouch(e.touches[0]);
            }
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
                />
            </Canvas>
            
            {/* Controls UI Overlay - hidden when loading screen is visible or website overlay is open */}
            {!showLoadingScreen && !showWebsiteOverlay && <ControlsUI introComplete={introComplete} />}
        
            {/* UI Overlay - always mounted; controls hint visible after intro and after menu delay, hidden when website overlay is open */}
            <UI 
              visible={introComplete && !showMenu && menuDelayOver && !showWebsiteOverlay} 
              canInteract={canInteract}
              showContent={showContent}
            />

            {/* Menu Overlay - hidden when loading screen is visible */}
            {!showLoadingScreen && <MenuOverlay isVisible={showMenu} onNavigateToLocation={handleNavigateToLocation} onClose={handleCloseMenu} />}

            {/* Info Panel - hidden when loading screen is visible */}
            {!showLoadingScreen && <InfoPanel isVisible={showMenu} />}

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

            {/* All Locations Discovered Notification */}
            <LocationDiscovery
              isVisible={showAllLocationsDiscovered}
              onComplete={handleAllLocationsDiscoveredComplete}
              locationName="Congratulations!|All Locations Discovered"
              isCongratulatoryMessage={true}
            />

            {/* Interaction Overlay */}
            <InteractionOverlay
              isVisible={showInteractionOverlay && !showMenu && !showContent && (canInteract || isHoveringBillboard)}
              interactionText={interactionText}
              position={overlayPosition}
              keyText={interactionKeyText}
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
        
          </div>
        </ClickSpark>
      </div>
    </Router>
  );
}

export default App;
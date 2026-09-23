import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SceneCanvas from './components/SceneCanvas';
import UI from './components/UI';
import ControlsUI from './components/ControlsUI';
import MenuOverlay from './components/MenuOverlay';
import MenuIcon from './components/MenuIcon';
import Content from './components/Content';
import TopHUD from './components/TopHUD';
import CharacterSelection, { CharacterOption } from './components/CharacterSelection';
import DiscoveryNotifications from './components/DiscoveryNotifications';
import InteractionOverlay from './components/InteractionOverlay';
import WebsiteOverlay from './components/WebsiteOverlay';
import ContactModal from './components/ContactModal';
import ClickSpark from './components/ClickSpark';
import RotatePhoneScreen from './components/RotatePhoneScreen';
import MobileDpad from './components/MobileDpad';
import MobileInteractButton from './components/MobileInteractButton';
import AddToHomeScreenPrompt from './components/AddToHomeScreenPrompt';
import RepoLinks from './components/RepoLinks';
import { getContentForSlab, ContentItem, getSlabKeyFromPosition, contentData } from './data/ContentData';
import {
  WEBSITE_SLABS,
  getBillboard,
  openInNewTab,
  openSocialLink,
  SOCIAL_SLABS,
  LO_SLAB_TARGETS,
  CONTENT_SLAB_TARGETS,
  findSlabAt,
  isOnMiddleSlab,
  getSlabHoverText,
  getSlabPromptText
} from './data/InteractionZones';
import { preloadCommonPlatforms } from './utils/collisionSystem';
import { isOnElevator, triggerElevator } from './utils/elevatorSystem';
import { preloadCharacterModels } from './components/Character';
import { preloadBillboardTextures, disposeBillboardTextures } from './utils/texturePreloader';
import { AchievementProvider, useAchievements } from './contexts/AchievementContext';
import { useStableCallback } from './hooks/useStableCallback';
import { useLocationDiscovery } from './hooks/useLocationDiscovery';
import { useSlabNavigation } from './hooks/useSlabNavigation';
import { useInteractionPrompt } from './hooks/useInteractionPrompt';
import { getSkyCssGradient } from './utils/dayNight';
import './App.css';
import './styles/fonts.css';

type TrainState = {
  isStopped: boolean;
  position: [number, number, number];
  rotation: number;
};

const SLAB_CLICK_ANIMATION_MS = 1200;
const INITIAL_SKY_BACKGROUND = getSkyCssGradient();

function AppContent() {
  const { trackLocationVisit, trackGSplatViewerUsage, trackBillboardOpen, newlyUnlockedAchievement, clearNewlyUnlocked } = useAchievements();

  const [introComplete, setIntroComplete] = useState(false);
  const [introProgress, setIntroProgress] = useState(0);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showCharacterSelection, setShowCharacterSelection] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption>({
    id: 'character-r',
    name: 'Ninja',
    modelPath: '/models/character-r.glb',
    imagePath: '/images/character-r.png'
  });
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const [currentAchievementTitle, setCurrentAchievementTitle] = useState('');

  const [showMenu, setShowMenu] = useState(false);
  const [menuDelayOver, setMenuDelayOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [currentSlabKey, setCurrentSlabKey] = useState<string | null>(null);

  const [isHoveringBillboard, setIsHoveringBillboard] = useState(false);
  const [isBillboardFullscreen, setIsBillboardFullscreen] = useState(false);
  const [showWebsiteOverlay, setShowWebsiteOverlay] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [currentWebsiteUrl, setCurrentWebsiteUrl] = useState('');
  const [currentBillboardKey, setCurrentBillboardKey] = useState('');
  const [triggerBillboardExit, setTriggerBillboardExit] = useState(false);

  const [activeSlabId, setActiveSlabId] = useState<string | null>(null);
  const [canInteract, setCanInteract] = useState(false);
  const [currentCharacterPosition, setCurrentCharacterPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [hoveredSlabId, setHoveredSlabId] = useState<string | null>(null);
  const [hoveredSlabPosition, setHoveredSlabPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSlabClickAnimating, setIsSlabClickAnimating] = useState(false);

  const [isOnTrain, setIsOnTrain] = useState(false);
  const [trainState, setTrainState] = useState<TrainState>({
    isStopped: false,
    position: [0, 0, 0],
    rotation: 0
  });
  // Ref to track latest train state for synchronous access
  const trainStateRef = useRef<TrainState>({
    isStopped: false,
    position: [0, 0, 0],
    rotation: 0
  });
  // Store position where character boarded the train
  const trainBoardingPositionRef = useRef<[number, number, number]>([0, 0, 0]);

  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const characterControllerRef = useRef<any>(null);
  // Billboard refs for programmatic triggering
  const billboardRefs = useRef<{ [key: string]: any }>({});

  const { handlePositionUpdate: updateDiscoveredLocations, showInitialDiscovery, ...discoveryBanners } = useLocationDiscovery(trackLocationVisit);
  const {
    showInteractionOverlay,
    interactionText,
    interactionKeyText,
    overlayPosition,
    showPrompt,
    hidePrompt
  } = useInteractionPrompt();
  const {
    isNavigatingSlabs,
    characterOpacity,
    characterScale,
    characterRotationY,
    setCharacterRotationY,
    characterPositionOffset,
    navigateNext,
    navigatePrev
  } = useSlabNavigation({
    characterControllerRef,
    currentSlabKey,
    setCurrentContent,
    setCurrentSlabKey
  });

  const clearMenuTimer = useCallback(() => {
    if (menuTimerRef.current) {
      clearTimeout(menuTimerRef.current);
      menuTimerRef.current = null;
    }
  }, []);

  const openContent = useCallback((content: ContentItem, slabKey: string | null) => {
    setCurrentContent(content);
    setCurrentSlabKey(slabKey);
    setShowContent(true);
  }, []);

  // Function to trigger billboard click programmatically
  const triggerBillboardClick = useCallback((billboardKey: string) => {
    const billboard = billboardRefs.current[billboardKey];
    if (billboard && billboard.handleBillboardClick) {
      billboard.handleBillboardClick();
    }
  }, []);

  // Social buttons on the tall wall: the email one opens the contact popup, the rest open their link
  const activateSocialSlab = useCallback((slab: { url?: string; opensContactForm?: boolean }) => {
    if (slab.opensContactForm) {
      setShowContactForm(true);
    } else {
      openSocialLink(slab.url);
    }
  }, []);

  const handleOpenContactForm = useCallback(() => setShowContactForm(true), []);
  const handleCloseContactForm = useCallback(() => setShowContactForm(false), []);

  // Floor button in front of a billboard: websites open in a new tab, docs zoom into the billboard
  const activateWebsiteButton = useCallback((slab: { url?: string; billboardKey: string }) => {
    if (slab.url) {
      openInNewTab(slab.url);
    } else {
      triggerBillboardClick(slab.billboardKey);
    }
  }, [triggerBillboardClick]);

  // ---------------------------------------------------------------------------
  // Callbacks passed into the 3D scene. They're stable (useStableCallback) so the
  // memoized SceneCanvas only re-renders when real scene props change.
  // ---------------------------------------------------------------------------

  const handleBillboardRef = useCallback((key: string, ref: any) => {
    billboardRefs.current[key] = ref;
  }, []);

  const handleSlabHover = useStableCallback((slabId: string | null, screenPosition?: { x: number; y: number }) => {
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
  });

  // Teleport to a slab, then open its content once the camera arrives
  const teleportAndOpenContent = useCallback((location: string, contentKey: string) => {
    const content = contentData[contentKey];
    if (!content || !characterControllerRef.current) return;

    setIsSlabClickAnimating(true);
    characterControllerRef.current.teleportToLocation(location);
    setTimeout(() => {
      openContent(content, contentKey);
      setIsSlabClickAnimating(false);
    }, SLAB_CLICK_ANIMATION_MS);
  }, [openContent]);

  const handleSlabClick = useStableCallback((slabId: string) => {
    // Disable slab clicks during intro/loading/character selection
    if (!introComplete || showLoadingScreen || showCharacterSelection) return;
    if (isBillboardFullscreen || showMenu || showContent) return;

    // Hide both interaction overlays when clicking
    setHoveredSlabId(null);
    hidePrompt();

    if (LO_SLAB_TARGETS[slabId]) {
      const { location, contentKey } = LO_SLAB_TARGETS[slabId];
      teleportAndOpenContent(location, contentKey);
    } else if (slabId.startsWith('website-')) {
      const slab = WEBSITE_SLABS.find(s => s.id === slabId);
      if (slab) activateWebsiteButton(slab);
    } else if (slabId.startsWith('social-')) {
      const slab = SOCIAL_SLABS.find(s => s.id === slabId);
      if (slab) activateSocialSlab(slab);
    } else if (slabId === 'main-slab') {
      if (characterControllerRef.current) {
        setIsSlabClickAnimating(true);
        characterControllerRef.current.teleportToLocation('home');
        setTimeout(() => {
          setShowMenu(true);
          setIsSlabClickAnimating(false);
        }, SLAB_CLICK_ANIMATION_MS);
      }
    } else if (CONTENT_SLAB_TARGETS[slabId]) {
      const { location, contentKey } = CONTENT_SLAB_TARGETS[slabId];
      teleportAndOpenContent(location, contentKey);
    }
  });

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    showInitialDiscovery();
    setMenuDelayOver(true);
  }, [showInitialDiscovery]);

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

  const handleHideWebsite = useStableCallback(() => {
    // Track billboard opening for achievements when user exits
    if (currentBillboardKey) {
      trackBillboardOpen(currentBillboardKey);
    }
    setShowWebsiteOverlay(false);
    setCurrentWebsiteUrl('');
    setCurrentBillboardKey('');
    // Trigger billboard exit animation
    setTriggerBillboardExit(true);
  });

  const handleBillboardExitComplete = useCallback(() => setTriggerBillboardExit(false), []);

  const handlePositionUpdate = useStableCallback(updateDiscoveredLocations);

  // Called by the character controller as it moves over slabs
  const handleSlabInteraction = useCallback((isOnSlab: boolean, slabType?: string) => {
    const slabId = !slabType ? null : slabType === 'main' ? 'main-slab' : slabType;
    setActiveSlabId(isOnSlab ? slabId : null);

    if (isOnSlab) {
      showPrompt(getSlabPromptText(slabType), 'SPACE');
    } else {
      hidePrompt();
    }
  }, [showPrompt, hidePrompt]);

  const handleBillboardInteraction = useStableCallback((isHovering: boolean, billboardKey?: string) => {
    if (!introComplete || showLoadingScreen) {
      return;
    }

    if (isHovering && billboardKey) {
      showPrompt(getBillboard(billboardKey)?.label || 'View Project', 'CLICK');
      setIsHoveringBillboard(true);
    } else {
      setIsHoveringBillboard(false);
      // Only hide overlay if not on a slab
      if (!canInteract) {
        hidePrompt();
      }
    }
  });

  const handleTrainStateUpdate = useStableCallback((state: TrainState) => {
    const prevStopped = trainStateRef.current.isStopped;
    // Update ref immediately
    trainStateRef.current = state;
    // Update state for React re-renders
    setTrainState(state);

    // If on train and it stopped, show exit prompt
    if (isOnTrain && state.isStopped) {
      showPrompt('Exit Train', 'SPACE');
      setCanInteract(true);
      return;
    }

    // If on train and moving, hide prompt
    if (isOnTrain && !state.isStopped) {
      hidePrompt();
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
        const distanceToTrain = Math.hypot(characterPos[0] - state.position[0], characterPos[2] - state.position[2]);

        // If character is within 4 units of stopped train, show boarding prompt
        if (distanceToTrain < 4) {
          showPrompt('Board Train', 'SPACE');
          setCanInteract(true);
        }
      }
    }

    // Clear prompt when train starts moving again
    if (!state.isStopped && prevStopped && !isOnTrain) {
      hidePrompt();
      setCanInteract(false);
    }
  });

  const handleMovementStart = useStableCallback(() => {
    if (showMenu) {
      setShowMenu(false);
      clearMenuTimer();
    }
    if (showContent) {
      setShowContent(false);
      setCurrentContent(null);
      setCurrentSlabKey(null);
    }
    setMenuDelayOver(true);
  });

  const handleSpacePress = useStableCallback(() => {
    // Disable space press during intro/loading/character selection
    if (!introComplete || showLoadingScreen || showCharacterSelection) return;
    if (showMenu || showContent || showContactForm) return;

    const characterPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
    const [x, , z] = characterPos;

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
        hidePrompt();
        setCanInteract(false);
      }
      return;
    } else if (currentTrainState.isStopped) {
      // Check if near train
      const distanceToTrain = Math.hypot(x - currentTrainState.position[0], z - currentTrainState.position[2]);

      if (distanceToTrain < 4) {
        // Store boarding position before hiding character
        trainBoardingPositionRef.current = [...characterPos] as [number, number, number];
        // Board the train
        setIsOnTrain(true);
        hidePrompt();
        setCanInteract(false);
        return;
      }
    }

    // Check interaction conditions directly here (don't rely on canInteract state)
    const content = getContentForSlab(x, z);
    const isOnElevatorPressurePlate = isOnElevator(x, z);
    const currentWebsiteButtonSlab = findSlabAt(WEBSITE_SLABS, x, z);
    const currentSocialSlab = findSlabAt(SOCIAL_SLABS, x, z);

    const canInteractNow = !!(content || isOnMiddleSlab(x, z) || isOnElevatorPressurePlate || currentWebsiteButtonSlab || currentSocialSlab);
    if (!canInteractNow) {
      return;
    }

    if (currentWebsiteButtonSlab) {
      activateWebsiteButton(currentWebsiteButtonSlab);
      return;
    }

    if (currentSocialSlab) {
      activateSocialSlab(currentSocialSlab);
      return;
    }

    // Check if on elevator and trigger it
    if (isOnElevatorPressurePlate) {
      triggerElevator();
      return;
    }

    if (content) {
      const slabKey = getSlabKeyFromPosition(x, z);
      openContent(content, slabKey);
    } else {
      // Middle slab opens the menu
      setShowMenu(true);
    }
  });

  const handleNavigateNext = useStableCallback(navigateNext);
  const handleNavigatePrev = useStableCallback(navigatePrev);

  // ---------------------------------------------------------------------------
  // HUD / overlay handlers
  // ---------------------------------------------------------------------------

  // Mobile D-pad handlers
  const handleMobileDpadDirection = useCallback((direction: { x: number; y: number } | null) => {
    if (characterControllerRef.current && characterControllerRef.current.handleMobileInput) {
      characterControllerRef.current.handleMobileInput(direction, false);
    }
  }, []);

  // Mobile interact button handler
  const handleMobileInteract = useCallback((isPressed: boolean) => {
    if (isPressed) {
      handleSpacePress();
    }
  }, [handleSpacePress]);

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

  const handleCloseContent = useCallback(() => {
    setShowContent(false);
    setCurrentContent(null);
    setCurrentSlabKey(null);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setShowMenu(false);
    clearMenuTimer();
  }, [clearMenuTimer]);

  const handleMenuIconClick = useCallback(() => {
    // Disable menu icon clicks during intro/loading/character selection
    if (!introComplete || showLoadingScreen || showCharacterSelection) return;

    const openMenu = () => {
      setShowMenu(true);
      clearMenuTimer();
      setMenuDelayOver(true);
    };

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
        setTimeout(openMenu, 1000);
      } else {
        // Camera is already on character
        openMenu();
      }
    } else if (showMenu && !isTransitioning) {
      setShowMenu(false);
      clearMenuTimer();
    }
  }, [showMenu, showContent, isTransitioning, introComplete, showLoadingScreen, showCharacterSelection, clearMenuTimer]);

  const handleNavigateToLocation = useCallback((location: string) => {
    // Hide menu
    setShowMenu(false);
    clearMenuTimer();

    // Teleport character to location
    if (characterControllerRef.current) {
      characterControllerRef.current.teleportToLocation(location);

      setTimeout(() => {
        const newPos = characterControllerRef.current?.getPosition() || [0, 0, 0];
        const content = getContentForSlab(newPos[0], newPos[2]);
        const slabKey = getSlabKeyFromPosition(newPos[0], newPos[2]);

        if (content) {
          openContent(content, slabKey);
        }
      }, SLAB_CLICK_ANIMATION_MS);
    }
  }, [clearMenuTimer, openContent]);

  // Character selection handlers
  const handleCharacterSelect = useCallback((character: CharacterOption) => {
    setSelectedCharacter(character);
  }, []);

  const handleCharacterSelectionStart = useCallback(() => {
    setShowCharacterSelection(false);
    setShowLoadingScreen(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
      }
    };
  }, []);

  // Cleanup textures and resources on app unmount
  useEffect(() => {
    return () => {
      disposeBillboardTextures(); // Dispose all preloaded textures
    };
  }, []);

  // Preload collision system, character models, and billboard textures on app start
  useEffect(() => {
    preloadCommonPlatforms();
    preloadCharacterModels();
    preloadBillboardTextures(); // Preload billboard textures to prevent stuttering
  }, []);

  // Check if character is on an interactable slab and update position
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
      const [x, , z] = characterPos;
      // Only update when the character actually moved, otherwise the whole app re-renders every tick while idle
      setCurrentCharacterPosition(prev =>
        prev[0] === characterPos[0] && prev[1] === characterPos[1] && prev[2] === characterPos[2]
          ? prev
          : [characterPos[0], characterPos[1], characterPos[2]]
      );

      // If on train, don't check other interactions
      if (isOnTrain) {
        return;
      }

      const isInTrainZone = z > 15 && z < 25 && x > -10 && x < 10;

      if (isInTrainZone) {
        const currentTrainState = trainStateRef.current;
        if (currentTrainState.isStopped) {
          const distanceToTrain = Math.hypot(x - currentTrainState.position[0], z - currentTrainState.position[2]);

          if (distanceToTrain < 4) {
            // Near stopped train
            showPrompt('Board Train', 'SPACE');
            setCanInteract(true);
            return;
          }
        }
      }

      setCanInteract(!!(
        getContentForSlab(x, z) ||
        isOnMiddleSlab(x, z) ||
        isOnElevator(x, z) ||
        findSlabAt(WEBSITE_SLABS, x, z) ||
        findSlabAt(SOCIAL_SLABS, x, z)
      ));
    }, 200);

    return () => clearInterval(checkInterval);
  }, [introComplete, showMenu, showContent, isBillboardFullscreen, showWebsiteOverlay, isOnTrain, showPrompt]);

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
      setCharacterRotationY(Math.PI / 4);
    } else if (showContent) {
      // Face character SOUTH
      setCharacterRotationY(Math.PI / 2);
    } else {
      // When both close
      setCharacterRotationY(0);
    }
  }, [showMenu, showContent, setCharacterRotationY]);

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
            // Matches the sky the canvas draws, so the first paint already fits the time of day
            background: INITIAL_SKY_BACKGROUND,
          }}>
            {/* Noise background + Three.js canvas with the isometric world */}
            <SceneCanvas
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
              onBillboardExitComplete={handleBillboardExitComplete}
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
                onOpenContactForm={handleOpenContactForm}
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

            {/* Location discovery banners + achievement toast */}
            <DiscoveryNotifications
              {...discoveryBanners}
              showAchievementNotification={showAchievementNotification}
              achievementTitle={currentAchievementTitle}
              onAchievementNotificationComplete={handleAchievementNotificationComplete}
            />

            {/* Interaction Overlay */}
            <InteractionOverlay
              isVisible={!isSlabClickAnimating && ((showInteractionOverlay && !showMenu && !showContent && (canInteract || isHoveringBillboard)) || (hoveredSlabId !== null && !showMenu && !showContent && !isBillboardFullscreen))}
              interactionText={hoveredSlabId ? getSlabHoverText(hoveredSlabId) : interactionText}
              position={hoveredSlabId ? hoveredSlabPosition : overlayPosition}
              keyText={hoveredSlabId ? 'CLICK' : interactionKeyText}
            />

            {/* Website Overlay */}
            <WebsiteOverlay
              isVisible={showWebsiteOverlay}
              websiteUrl={currentWebsiteUrl}
              docs={getBillboard(currentBillboardKey)?.docs}
              billboardKey={currentBillboardKey}
              onClose={handleHideWebsite}
            />

            {/* Contact popup (email button on the tall wall) */}
            <ContactModal isVisible={showContactForm} onClose={handleCloseContactForm} />

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

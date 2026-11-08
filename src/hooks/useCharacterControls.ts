import { useRef, useEffect } from 'react';
import { constrainToPlatform, getHeightAtPosition, getVisualGroundHeight } from '../utils/collisionSystem';
import { isOnElevator, triggerElevator, getElevatorHeight, shiftElevator } from '../utils/elevatorSystem';
import { SOCIAL_SLABS, WEBSITE_SLABS, findSlabAt } from '../data/InteractionZones';

interface CharacterState {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
}

interface CharacterControlsReturn {
  updateCharacter: (delta: number) => void;
  getCharacterState: () => CharacterState;
  positionRef: React.MutableRefObject<[number, number, number]>;
  rotationRef: React.MutableRefObject<number>;
  isMovingRef: React.MutableRefObject<boolean>;
  speedRef: React.MutableRefObject<number>;
  centerOnSlab: () => void;
  teleportToLocation: (location: string) => void;
  teleportTo: (position: [number, number, number]) => void;
  handleTouch: (touch: Touch) => void;
  stopMovement: () => void;
  resetMovementState: () => void;
  haltMotion: () => void;
  handleMobileInput: (direction: { x: number; y: number } | null, isRunning: boolean) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}

const VISUAL_OFFSET = 0.11;

// ---------------------------------------------------------------------------
// Movement tuning
// ---------------------------------------------------------------------------
export const WALK_SPEED = 4;
const RUN_MULTIPLIER = 1.5;
// How quickly the character reaches its target velocity (1/s). Higher = snappier.
const ACCELERATION = 16;
const DECELERATION = 22;
// Movement is integrated in fixed sub-steps so collision behaves the same at any frame rate
const MAX_FRAME_DELTA = 0.1;
const MAX_SUB_STEP = 1 / 60;
// Below this speed (units/s) a stopping character is considered at rest
const REST_SPEED = 0.02;

// Visual height. Ground changes up to this slope are followed exactly (stair ramps); bigger
// changes are eased: small steps and climbs with a stiff spring, the elevator with a soft one
// (so it reads as a ride), and long drops fall under gravity.
const RAMP_FOLLOW_SLOPE = 1.6;
const STEP_STIFFNESS = 26;
const ELEVATOR_STIFFNESS = 9;
const LARGE_DROP = 0.6;
const FALL_GRAVITY = 30;
// Hold the character on the elevator until the ride is nearly over
const ELEVATOR_RIDE_LOCK = 0.15;

type HeightMode = 'step' | 'ride' | 'fall';

// Frame-rate independent smoothing factor for exponential approach
const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export const useCharacterControls = (initialPosition: [number, number, number] = [0, 0, 0], onSpacePress?: () => void, onNavigatePrev?: () => void, onNavigateNext?: () => void): CharacterControlsReturn => {
  let adjustedPosition: [number, number, number];
  if (initialPosition[1] !== 0) {
    adjustedPosition = initialPosition;
  } else {
    const platformHeight = getHeightAtPosition(initialPosition[0], initialPosition[2]);
    adjustedPosition = platformHeight !== null
      ? [initialPosition[0], platformHeight, initialPosition[2]]
      : initialPosition;
  }

  // Rendered position (y includes the visual offset and the smoothed height)
  const positionRef = useRef<[number, number, number]>(adjustedPosition);
  // Facing the character is turning towards (the renderer eases into it)
  const rotationRef = useRef(0);
  const isMovingRef = useRef(false);
  // Current horizontal speed, used to pace the walk animation
  const speedRef = useRef(0);

  // Exact height of the ground under the character, used for all collision checks
  const groundYRef = useRef(adjustedPosition[1] - VISUAL_OFFSET);
  const velocityRef = useRef({ x: 0, z: 0 });
  // Visual height = smoothed ground + offset; the offset eases big steps instead of popping
  const visualGroundRef = useRef(adjustedPosition[1] - VISUAL_OFFSET);
  const heightOffsetRef = useRef(0);
  const heightOffsetVelRef = useRef(0);
  const heightModeRef = useRef<HeightMode>('step');

  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false,
  });

  // Store callback refs to avoid recreating event listeners
  const onSpacePressRef = useRef(onSpacePress);
  const onNavigatePrevRef = useRef(onNavigatePrev);
  const onNavigateNextRef = useRef(onNavigateNext);

  useEffect(() => {
    onNavigatePrevRef.current = onNavigatePrev;
  }, [onNavigatePrev]);

  useEffect(() => {
    onNavigateNextRef.current = onNavigateNext;
  }, [onNavigateNext]);

  useEffect(() => {
    onSpacePressRef.current = onSpacePress;
  }, [onSpacePress]);

  // Put the character exactly on the ground at (x, z), with no easing left over
  const snapTo = (x: number, groundY: number, z: number) => {
    groundYRef.current = groundY;
    visualGroundRef.current = getVisualGroundHeight(x, z, groundY);
    heightOffsetRef.current = 0;
    heightOffsetVelRef.current = 0;
    positionRef.current = [x, visualGroundRef.current + VISUAL_OFFSET, z];
  };

  const haltMotion = () => {
    velocityRef.current.x = 0;
    velocityRef.current.z = 0;
    speedRef.current = 0;
  };

  // Handle keyboard input
  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Typing in a form (e.g. the contact popup) shouldn't walk the character around
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      // Check if content is open
      const isContentOpen = document.querySelector('.content-box.visible') !== null;

      if (isContentOpen) {
        if (key === 'q') {
          e.preventDefault();
          // Clear all movement state before navigation
          resetMovementState();
          if (onNavigatePrevRef.current) {
            onNavigatePrevRef.current();
          }
          return;
        } else if (key === 'e') {
          e.preventDefault();
          // Clear all movement state before navigation
          resetMovementState();
          if (onNavigateNextRef.current) {
            onNavigateNextRef.current();
          }
          return;
        }
      }

      // Normal movement controls
      if (key === 'w' || key === 'arrowup') {
        keysRef.current.forward = true;
      } else if (key === 's' || key === 'arrowdown') {
        keysRef.current.backward = true;
      } else if (key === 'a' || key === 'arrowleft') {
        keysRef.current.left = true;
      } else if (key === 'd' || key === 'arrowright') {
        keysRef.current.right = true;
      } else if (key === 'shift') {
        keysRef.current.shift = true;
      } else if (key === ' ') {
        if (!keysRef.current.space) {
          keysRef.current.space = true;
          // Check if on elevator and trigger it
          const [x, , z] = positionRef.current;
          if (isOnElevator(x, z)) {
            triggerElevator();
            // The ground moves at once; the character rides there smoothly (see updateCharacter)
            groundYRef.current = getElevatorHeight();
          } else {
            // Check if on smaller-block-slab
            const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;
            // Check if on a social link button
            const isOnSocialButton = !!findSlabAt(SOCIAL_SLABS, x, z);
            // Check if on middle bone white slab
            const isOnMiddleSlab = x >= -0.45 && x <= 0.45 && z >= -0.45 && z <= 0.45;

            // Check staircase slabs
            const isOnStaircaseSlab1 = x >= -11.075 && x <= -10.175 && z >= 1.05 && z <= 1.95;
            const isOnStaircaseSlab2 = x >= -14.075 && x <= -13.175 && z >= 1.05 && z <= 1.95;
            const isOnStaircaseSlab3 = x >= -14.075 && x <= -13.175 && z >= -1.95 && z <= -1.05;
            const isOnStaircaseSlab4 = x >= -11.075 && x <= -10.175 && z >= -1.95 && z <= -1.05;
            const isOnStaircaseSlab5 = x >= -8.075 && x <= -7.175 && z >= -1.95 && z <= -1.05;

            // Check artwork platform slab
            const isOnArtworkSlab = x >= 10.05 && x <= 10.95 && z >= -0.45 && z <= 0.45;

            // Check billboard button slabs on the work platform
            const isOnWebsiteButton = !!findSlabAt(WEBSITE_SLABS, x, z);

            const isOnInteractableSlab = isOnSmallerBlockSlab || isOnSocialButton || isOnMiddleSlab ||
                 isOnStaircaseSlab1 || isOnStaircaseSlab2 || isOnStaircaseSlab3 ||
                 isOnStaircaseSlab4 || isOnStaircaseSlab5 || isOnArtworkSlab ||
                 isOnWebsiteButton;

            if (isOnInteractableSlab && onSpacePressRef.current) {
              centerOnSlab();
              onSpacePressRef.current();
            } else if (onSpacePressRef.current) {
              // Not on a slab, but still call onSpacePress for other interactions
              onSpacePressRef.current();
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Always allow movement key releases to prevent stuck keys
      if (key === 'w' || key === 'arrowup') {
        keysRef.current.forward = false;
      } else if (key === 's' || key === 'arrowdown') {
        keysRef.current.backward = false;
      } else if (key === 'a' || key === 'arrowleft') {
        keysRef.current.left = false;
      } else if (key === 'd' || key === 'arrowright') {
        keysRef.current.right = false;
      } else if (key === 'shift') {
        keysRef.current.shift = false;
      } else if (key === ' ') {
        keysRef.current.space = false;
      }
    };

    // Keyups are lost when focus leaves the page (e.g. a slab opens a new tab), so release everything
    const handleBlur = () => {
      keysRef.current.forward = false;
      keysRef.current.backward = false;
      keysRef.current.left = false;
      keysRef.current.right = false;
      keysRef.current.shift = false;
      keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []); // Remove dependencies to prevent event listener recreation

  // One fixed-size movement step: velocity, collision and the logical ground height
  const stepMovement = (dt: number, inputX: number, inputZ: number, hasInput: boolean) => {
    const velocity = velocityRef.current;
    const maxSpeed = WALK_SPEED * (keysRef.current.shift ? RUN_MULTIPLIER : 1);
    const targetVX = inputX * maxSpeed;
    const targetVZ = inputZ * maxSpeed;

    // Ease towards the target velocity: quick to start, slightly quicker to stop
    const k = damp(hasInput ? ACCELERATION : DECELERATION, dt);
    velocity.x += (targetVX - velocity.x) * k;
    velocity.z += (targetVZ - velocity.z) * k;

    if (!hasInput && velocity.x * velocity.x + velocity.z * velocity.z < REST_SPEED * REST_SPEED) {
      velocity.x = 0;
      velocity.z = 0;
      return;
    }

    const [currentX, , currentZ] = positionRef.current;
    const newX = currentX + velocity.x * dt;
    const newZ = currentZ + velocity.z * dt;

    const moved = constrainToPlatform(newX, newZ, groundYRef.current, currentX, currentZ);

    // Drop the part of the velocity that ran into something so we don't keep pushing into walls
    if (!moved.movedX) velocity.x = 0;
    if (!moved.movedZ) velocity.z = 0;

    groundYRef.current = moved.y;
    positionRef.current = [moved.x, positionRef.current[1], moved.z];
  };

  // Ease the rendered height towards the ground: follow ramps exactly, ease over real steps
  const updateVisualHeight = (dt: number, horizontalDistance: number) => {
    const [x, , z] = positionRef.current;
    const target = getVisualGroundHeight(x, z, groundYRef.current);
    const jump = target - visualGroundRef.current;
    visualGroundRef.current = target;

    if (Math.abs(jump) > horizontalDistance * RAMP_FOLLOW_SLOPE + 0.005) {
      // A real step: keep the character where it was and ease it over from there
      heightOffsetRef.current -= jump;
      const previousMode = heightModeRef.current;
      const mode: HeightMode = isOnElevator(x, z) ? 'ride'
        : heightOffsetRef.current > LARGE_DROP ? 'fall'
        : previousMode === 'ride' ? 'ride'
        : 'step';
      // Falling tracks downward speed, the spring tracks signed velocity: don't mix them
      if (mode !== previousMode && (mode === 'fall' || previousMode === 'fall')) {
        heightOffsetVelRef.current = 0;
      }
      heightModeRef.current = mode;
    }

    let offset = heightOffsetRef.current;
    if (offset !== 0) {
      if (heightModeRef.current === 'fall') {
        // Falling: speed up under gravity until we land
        heightOffsetVelRef.current += FALL_GRAVITY * dt;
        offset = Math.max(0, offset - heightOffsetVelRef.current * dt);
        if (offset === 0) heightOffsetVelRef.current = 0;
      } else {
        // Critically damped spring (exact for any dt): eases in and out without overshoot
        const omega = heightModeRef.current === 'ride' ? ELEVATOR_STIFFNESS : STEP_STIFFNESS;
        const vel = heightOffsetVelRef.current;
        const exp = Math.exp(-omega * dt);
        const temp = (vel + omega * offset) * dt;
        heightOffsetVelRef.current = (vel - omega * temp) * exp;
        offset = (offset + temp) * exp;

        if (Math.abs(offset) < 0.0005 && Math.abs(heightOffsetVelRef.current) < 0.01) {
          offset = 0;
          heightOffsetVelRef.current = 0;
        }
      }
      if (offset === 0) heightModeRef.current = 'step';
      heightOffsetRef.current = offset;
    }

    // Only replace the array when something changed (readers compare by reference to spot movement)
    const y = target + offset + VISUAL_OFFSET;
    if (y !== positionRef.current[1]) {
      positionRef.current = [x, y, z];
    }
  };

  const updateCharacter = (delta: number) => {
    const keys = keysRef.current;

    // Elevator: the ground under the character is wherever the elevator currently is
    const [startX, renderedY, startZ] = positionRef.current;
    let ridingElevator = false;
    if (isOnElevator(startX, startZ)) {
      groundYRef.current = getElevatorHeight();
      shiftElevator.wasOnElevator = true;
      // Still travelling if the character hasn't caught up with the elevator yet
      ridingElevator = Math.abs(renderedY - VISUAL_OFFSET - groundYRef.current) > ELEVATOR_RIDE_LOCK;
    } else {
      shiftElevator.wasOnElevator = false;
    }

    const hasInput = !ridingElevator && (keys.forward || keys.backward || keys.left || keys.right);

    // Movement direction from input
    let inputX = 0;
    let inputZ = 0;
    if (hasInput) {
      if (keys.forward) inputX -= 1;
      if (keys.backward) inputX += 1;
      if (keys.left) inputZ += 1;
      if (keys.right) inputZ -= 1;
    }

    // Normalize diagonal movement
    if (inputX !== 0 && inputZ !== 0) {
      inputX *= Math.SQRT1_2;
      inputZ *= Math.SQRT1_2;
    }

    if (inputX !== 0 || inputZ !== 0) {
      rotationRef.current = Math.atan2(inputX, inputZ);
    }

    // Integrate in equal sub-steps (also caps huge deltas, e.g. after switching tabs)
    const frameDelta = Math.min(Math.max(delta, 0), MAX_FRAME_DELTA);
    const steps = Math.max(1, Math.ceil(frameDelta / MAX_SUB_STEP));
    const dt = frameDelta / steps;
    for (let i = 0; i < steps; i++) {
      stepMovement(dt, inputX, inputZ, hasInput);
    }

    const [endX, , endZ] = positionRef.current;
    const horizontalDistance = Math.hypot(endX - startX, endZ - startZ);
    updateVisualHeight(frameDelta, horizontalDistance);

    const velocity = velocityRef.current;
    speedRef.current = Math.hypot(velocity.x, velocity.z);
    // Walking = the player is asking to move (the walk animation keeps playing when pushing into a wall)
    isMovingRef.current = hasInput;
  };

  const getCharacterState = (): CharacterState => ({
    position: positionRef.current,
    rotation: rotationRef.current,
    isMoving: isMovingRef.current,
  });

  const centerOnSlab = () => {
    const [x, , z] = positionRef.current;

    // Determine which slab we're on and center accordingly
    const isOnSmallerBlockSlab = x >= -1.95 && x <= -1.05 && z >= -10.8 && z <= -9.9;
    const socialSlab = findSlabAt(SOCIAL_SLABS, x, z);
    const isOnMiddleSlab = x >= -0.45 && x <= 0.45 && z >= -0.45 && z <= 0.45;

    // Check staircase slabs
    const isOnStaircaseSlab1 = x >= -11.075 && x <= -10.175 && z >= 1.05 && z <= 1.95;
    const isOnStaircaseSlab2 = x >= -14.075 && x <= -13.175 && z >= 1.05 && z <= 1.95;
    const isOnStaircaseSlab3 = x >= -14.075 && x <= -13.175 && z >= -1.95 && z <= -1.05;
    const isOnStaircaseSlab4 = x >= -11.075 && x <= -10.175 && z >= -1.95 && z <= -1.05;
    const isOnStaircaseSlab5 = x >= -8.075 && x <= -7.175 && z >= -1.95 && z <= -1.05;

    // Check artwork platform slab
    const isOnArtworkSlab = x >= 10.05 && x <= 10.95 && z >= -0.45 && z <= 0.45;

    let centerX = x;
    let centerZ = z;

    if (isOnSmallerBlockSlab) {
      centerX = -1.5;
      centerZ = -10.35;
    } else if (socialSlab) {
      centerX = socialSlab.x;
      centerZ = socialSlab.z;
    } else if (isOnMiddleSlab) {
      centerX = 0;
      centerZ = 0;
    } else if (isOnStaircaseSlab1) {
      centerX = -10.625;
      centerZ = 1.5;
    } else if (isOnStaircaseSlab2) {
      centerX = -13.625;
      centerZ = 1.5;
    } else if (isOnStaircaseSlab3) {
      centerX = -13.625;
      centerZ = -1.5;
    } else if (isOnStaircaseSlab4) {
      centerX = -10.625;
      centerZ = -1.5;
    } else if (isOnStaircaseSlab5) {
      centerX = -7.625;
      centerZ = -1.5;
    } else if (isOnArtworkSlab) {
      centerX = 10.5;
      centerZ = 0;
    }

    const centerHeight = getHeightAtPosition(centerX, centerZ);
    haltMotion();
    snapTo(centerX, centerHeight || 0.22, centerZ);
  };

  const teleportToLocation = (location: string) => {
    let targetPosition: [number, number, number] = [0, 0, 0];

    switch (location) {
      case 'transferable':
        targetPosition = [-13.625, 4.22, 1.5];
        break;
      case 'conceptualize':
        targetPosition = [-10.625, 3.74, 1.5];
        break;
      case 'creative':
        targetPosition = [-13.625, 4.73, -1.5];
        break;
      case 'professional':
        targetPosition = [-10.625, 5.23, -1.5];
        break;
      case 'leadership':
        targetPosition = [-7.625, 5.73, -1.5];
        break;
      case 'ironfilms':
        targetPosition = [-1.5, 1.78, -10.4];
        break;
      case 'artwork':
        targetPosition = [10.50, -1.90, -0.01];
        break;
      case 'projects':
        targetPosition = [0, -2.6, 15.9];
        break;
      default:
        const centerHeight = getHeightAtPosition(0, 0);
        targetPosition = [0, centerHeight || 0.22, 0];
    }

    // Fix elevator state when teleporting
    if (location === 'artwork') {
      shiftElevator.currentY = shiftElevator.bottomY;
    }
    shiftElevator.wasOnElevator = false;

    // Ensure movement state is stopped before teleportation
    resetMovementState();

    // Land on the actual ground at the target
    const groundY = getHeightAtPosition(targetPosition[0], targetPosition[2]) ?? targetPosition[1];
    snapTo(targetPosition[0], groundY, targetPosition[2]);

    // Ensure character is in idle state after teleportation
    isMovingRef.current = false;
  };

  // Place the character at an exact position (e.g. stepping off the train)
  const teleportTo = (position: [number, number, number]) => {
    resetMovementState();
    const groundY = getHeightAtPosition(position[0], position[2]) ?? position[1] - VISUAL_OFFSET;
    snapTo(position[0], groundY, position[2]);
  };

  // Touch handler for mobile devices
  const handleTouch = (touch: Touch) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;

    // Determine direction based on touch position relative to center
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal movement
      if (deltaX > 0) {
        keysRef.current.right = true;
        keysRef.current.left = false;
      } else {
        keysRef.current.left = true;
        keysRef.current.right = false;
      }
      keysRef.current.forward = false;
      keysRef.current.backward = false;
    } else {
      // Vertical movement
      if (deltaY > 0) {
        keysRef.current.backward = true;
        keysRef.current.forward = false;
      } else {
        keysRef.current.forward = true;
        keysRef.current.backward = false;
      }
      keysRef.current.left = false;
      keysRef.current.right = false;
    }
  };

  const stopMovement = () => {
    keysRef.current.forward = false;
    keysRef.current.backward = false;
    keysRef.current.left = false;
    keysRef.current.right = false;
  };

  const resetMovementState = () => {
    // Reset all movement keys to ensure clean state after navigation
    keysRef.current.forward = false;
    keysRef.current.backward = false;
    keysRef.current.left = false;
    keysRef.current.right = false;
    keysRef.current.space = false;
    keysRef.current.shift = false;
    isMovingRef.current = false;
    haltMotion();
  };

  // Handle mobile D-pad input
  const handleMobileInput = (direction: { x: number; y: number } | null, isRunning: boolean) => {
    if (!direction) {
      // Stop all movement
      keysRef.current.forward = false;
      keysRef.current.backward = false;
      keysRef.current.left = false;
      keysRef.current.right = false;
      keysRef.current.shift = false;
      return;
    }

    keysRef.current.left = direction.x < 0;
    keysRef.current.right = direction.x > 0;
    keysRef.current.forward = direction.y < 0;
    keysRef.current.backward = direction.y > 0;
    keysRef.current.shift = isRunning;
  };

  // Monitor content visibility and reset movement state when content opens
  useEffect(() => {
    const checkContentVisibility = () => {
      const isContentOpen = document.querySelector('.content-box.visible') !== null;
      if (isContentOpen) {
        // Clear movement state when content opens to prevent stuck keys
        resetMovementState();
      }
    };

    // Check every 250ms for content visibility changes (optimized)
    const interval = setInterval(checkContentVisibility, 250);

    return () => clearInterval(interval);
  }, []);

  return {
    updateCharacter,
    getCharacterState,
    positionRef,
    rotationRef,
    isMovingRef,
    speedRef,
    centerOnSlab,
    teleportToLocation,
    teleportTo,
    handleTouch,
    stopMovement,
    resetMovementState,
    haltMotion,
    handleMobileInput,
    onNavigatePrev,
    onNavigateNext,
  };
};

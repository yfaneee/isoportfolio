import React, { useState, useCallback } from 'react';
import { ContentItem, slabNavigationOrder, getLocationFromSlabKey, contentData } from '../data/ContentData';
import { shiftElevator } from '../utils/elevatorSystem';

interface SlabNavigationOptions {
  characterControllerRef: React.MutableRefObject<any>;
  currentSlabKey: string | null;
  setCurrentContent: (content: ContentItem | null) => void;
  setCurrentSlabKey: (slabKey: string | null) => void;
}

/**
 * Q/E navigation between content slabs, including the character's
 * spin/fade-out, teleport, and fade-in transition.
 */
export function useSlabNavigation({
  characterControllerRef,
  currentSlabKey,
  setCurrentContent,
  setCurrentSlabKey
}: SlabNavigationOptions) {
  const [isNavigatingSlabs, setIsNavigatingSlabs] = useState(false);
  const [characterOpacity, setCharacterOpacity] = useState(1);
  const [characterScale, setCharacterScale] = useState(1);
  const [characterRotationY, setCharacterRotationY] = useState(0);
  const [characterPositionOffset, setCharacterPositionOffset] = useState<[number, number, number]>([0, 0, 0]);

  // direction: 1 = next slab, -1 = previous slab
  const navigate = useCallback((direction: 1 | -1) => {
    if (!currentSlabKey || !characterControllerRef.current || isNavigatingSlabs) return;

    const currentIndex = slabNavigationOrder.indexOf(currentSlabKey);
    const targetIndex = (currentIndex + direction + slabNavigationOrder.length) % slabNavigationOrder.length;
    const targetSlabKey = slabNavigationOrder[targetIndex];
    const targetLocation = getLocationFromSlabKey(targetSlabKey);
    const targetContent = contentData[targetSlabKey];

    if (!targetContent) return;

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

      // Spin rotation effect (direction decides spin direction)
      const spinEased = 1 - Math.pow(1 - progress, 3);
      const spinSpeed = spinEased * 2 * direction;
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
          characterControllerRef.current.teleportToLocation(targetLocation);

          // Update content immediately
          setCurrentContent(targetContent);
          setCurrentSlabKey(targetSlabKey);

          setTimeout(() => {
            shiftElevator.wasOnElevator = false;
            shiftElevator.isMoving = false;
            if (targetSlabKey === 'artwork-platform-slab') {
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

              setCharacterOpacity(eased);
              setCharacterScale(1);
              setCharacterRotationY(0);
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
  }, [currentSlabKey, isNavigatingSlabs, characterControllerRef, setCurrentContent, setCurrentSlabKey]);

  const navigateNext = useCallback(() => navigate(1), [navigate]);
  const navigatePrev = useCallback(() => navigate(-1), [navigate]);

  return {
    isNavigatingSlabs,
    characterOpacity,
    characterScale,
    characterRotationY,
    setCharacterRotationY,
    characterPositionOffset,
    navigateNext,
    navigatePrev
  };
}

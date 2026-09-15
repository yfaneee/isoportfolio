import { useState, useCallback } from 'react';

/**
 * State for the bottom-center "[SPACE] Do something" prompt.
 */
export function useInteractionPrompt() {
  const [showInteractionOverlay, setShowInteractionOverlay] = useState(false);
  const [interactionText, setInteractionText] = useState('Menu');
  const [interactionKeyText, setInteractionKeyText] = useState('SPACE');
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });

  const showPrompt = useCallback((text: string, keyText: string) => {
    const centerX = window.innerWidth / 2;
    const bottomY = window.innerHeight - 250;
    // Keep the same object when nothing changed so repeated calls don't re-render
    setOverlayPosition(prev => (prev.x === centerX && prev.y === bottomY ? prev : { x: centerX, y: bottomY }));
    setInteractionText(text);
    setInteractionKeyText(keyText);
    setShowInteractionOverlay(true);
  }, []);

  const hidePrompt = useCallback(() => {
    setShowInteractionOverlay(false);
  }, []);

  return {
    showInteractionOverlay,
    interactionText,
    interactionKeyText,
    overlayPosition,
    showPrompt,
    hidePrompt
  };
}

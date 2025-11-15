import React, { useEffect, useRef, useState } from 'react';
import './MobileInteractButton.css';

interface MobileInteractButtonProps {
  onInteract: (isPressed: boolean) => void;
  visible: boolean;
}

const MobileInteractButton: React.FC<MobileInteractButtonProps> = ({ onInteract, visible }) => {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!buttonRef.current || !visible) return;
      
      const touch = e.touches[0];
      const rect = buttonRef.current.getBoundingClientRect();
      
      // Check if touch is within button bounds
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        e.preventDefault();
        touchIdRef.current = touch.identifier;
        setIsPressed(true);
        onInteract(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      
      const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
      if (touch) {
        if (e.type === 'touchend') {
          e.preventDefault();
        }
        touchIdRef.current = null;
        setIsPressed(false);
        onInteract(false);
      }
    };

    const handleTouchCancel = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      
      const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
      if (touch) {
        touchIdRef.current = null;
        setIsPressed(false);
        onInteract(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [onInteract, visible]);

  if (!visible) return null;

  return (
    <div className="mobile-interact-controls">
      <div 
        ref={buttonRef}
        className={`interact-button-container ${isPressed ? 'active' : ''}`}
      >
        <img 
          src="/images/button_hexagon.png" 
          alt="Interact" 
          className="interact-button-image"
          draggable={false}
        />
        <div className="interact-label">INTERACT</div>
      </div>
    </div>
  );
};

export default MobileInteractButton;


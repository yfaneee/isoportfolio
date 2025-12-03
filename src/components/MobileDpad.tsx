import React, { useEffect, useRef, useState } from 'react';
import './MobileDpad.css';

interface MobileDpadProps {
  onDirectionChange: (direction: { x: number; y: number } | null) => void;
  visible: boolean;
}

const MobileDpad: React.FC<MobileDpadProps> = ({ onDirectionChange, visible }) => {
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const dpadRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!visible) return;
      
      const touch = e.touches[0];
      
      e.preventDefault();
      e.stopPropagation();
      touchIdRef.current = touch.identifier;
      handleTouchMove(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dpadRef.current || touchIdRef.current === null || !visible) return;
      
      const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
      if (!touch) return;

      e.preventDefault();
      
      const rect = dpadRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = touch.clientX - centerX;
      const deltaY = touch.clientY - centerY;
      
      // Calculate angle and determine direction
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Only register if touch is far enough from center
      if (distance > 20) {
        let direction = null;
        let directionVector = { x: 0, y: 0 };

        // Isometric directions mapped to WASD
        if (angle >= -22.5 && angle < 22.5) {
          // Right - maps to D
          direction = 'right';
          directionVector = { x: 1, y: 0 };
        } else if (angle >= 22.5 && angle < 67.5) {
          // Down-Right - maps to S+D
          direction = 'down-right';
          directionVector = { x: 1, y: 1 };
        } else if (angle >= 67.5 && angle < 112.5) {
          // Down - maps to S
          direction = 'down';
          directionVector = { x: 0, y: 1 };
        } else if (angle >= 112.5 && angle < 157.5) {
          // Down-Left - maps to S+A
          direction = 'down-left';
          directionVector = { x: -1, y: 1 };
        } else if (angle >= 157.5 || angle < -157.5) {
          // Left - maps to A
          direction = 'left';
          directionVector = { x: -1, y: 0 };
        } else if (angle >= -157.5 && angle < -112.5) {
          // Up-Left - maps to W+A
          direction = 'up-left';
          directionVector = { x: -1, y: -1 };
        } else if (angle >= -112.5 && angle < -67.5) {
          // Up - maps to W
          direction = 'up';
          directionVector = { x: 0, y: -1 };
        } else if (angle >= -67.5 && angle < -22.5) {
          // Up-Right - maps to W+D
          direction = 'up-right';
          directionVector = { x: 1, y: -1 };
        }

        setActiveDirection(direction);
        onDirectionChange(directionVector);
      } else {
        setActiveDirection(null);
        onDirectionChange(null);
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
        setActiveDirection(null);
        onDirectionChange(null);
      }
    };

    const handleTouchCancel = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      
      const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
      if (touch) {
        touchIdRef.current = null;
        setActiveDirection(null);
        onDirectionChange(null);
      }
    };

    const dpadElement = dpadRef.current;
    if (!dpadElement) return;

    dpadElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    dpadElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    dpadElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    dpadElement.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      dpadElement.removeEventListener('touchstart', handleTouchStart);
      dpadElement.removeEventListener('touchmove', handleTouchMove);
      dpadElement.removeEventListener('touchend', handleTouchEnd);
      dpadElement.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [onDirectionChange, visible]);

  if (!visible) return null;

  return (
    <div className="mobile-controls">
      {/* D-pad Controller */}
      <div 
        ref={dpadRef}
        className={`dpad-container ${activeDirection ? 'active' : ''}`}
      >
        <img 
          src="/images/newdpad.png" 
          alt="D-pad" 
          className="dpad-image"
          draggable={false}
        />
        <div className={`dpad-indicator ${activeDirection || ''}`}></div>
      </div>
    </div>
  );
};

export default MobileDpad;


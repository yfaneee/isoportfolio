import React from 'react';
import './InteractionOverlay.css';

interface InteractionOverlayProps {
  isVisible: boolean;
  interactionText: string;
  position: { x: number; y: number };
  keyText?: string;
}

const InteractionOverlay: React.FC<InteractionOverlayProps> = ({
  isVisible,
  interactionText,
  position,
  keyText = 'SPACE'
}) => {
  if (!isVisible) return null;

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 960 && window.innerHeight <= 500;

  return (
    <div 
      className="interaction-overlay"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="interaction-content">
        <div className="interaction-key">
          {isMobile && keyText === 'SPACE' ? (
            <img 
              src="/images/button_hexagon.png" 
              alt="Interact" 
              className="key-icon-mobile"
            />
          ) : (
            <span className="key-icon">{keyText}</span>
          )}
        </div>
        <div className="interaction-text">{interactionText}</div>
      </div>
    </div>
  );
};

export default InteractionOverlay;

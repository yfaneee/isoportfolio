import React from 'react';
import './InteractionOverlay.css';

interface InteractionOverlayProps {
  isVisible: boolean;
  interactionText: string;
  position: { x: number; y: number };
}

const InteractionOverlay: React.FC<InteractionOverlayProps> = ({
  isVisible,
  interactionText,
  position
}) => {
  if (!isVisible) return null;

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
          <span className="key-icon">SPACE</span>
        </div>
        <div className="interaction-text">{interactionText}</div>
      </div>
    </div>
  );
};

export default InteractionOverlay;

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
          <span className="key-icon">{keyText}</span>
        </div>
        <div className="interaction-text">{interactionText}</div>
      </div>
    </div>
  );
};

export default InteractionOverlay;

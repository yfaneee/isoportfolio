import React from 'react';
import './ControlsUI.css';

interface ControlsUIProps {
  introComplete: boolean;
}

const ControlsUI: React.FC<ControlsUIProps> = ({ introComplete }) => {
  if (!introComplete) {
    return (
      <div className="intro-overlay">
        <div className="intro-text">Welcome to My Portfolio</div>
      </div>
    );
  }

  return null;
};

export default ControlsUI;


import React from 'react';
import './ControlsUI.css';
import TextType from './TextType';

interface ControlsUIProps {
  introComplete: boolean;
}

const ControlsUI: React.FC<ControlsUIProps> = ({ introComplete }) => {
  if (!introComplete) {
    return (
      <div className="intro-overlay">
        <TextType 
          text={["Welcome to My Portfolio"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
          className="intro-text"
        />
      </div>
    );
  }

  return null;
};

export default ControlsUI;


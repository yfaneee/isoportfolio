import React, { useState, useEffect, memo } from 'react';
import './ControlsUI.css';
import TextType from './TextType';

interface ControlsUIProps {
  introComplete: boolean;
  showCharacterSelection: boolean;
}

const ControlsUI: React.FC<ControlsUIProps> = memo(({ introComplete, showCharacterSelection }) => {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (!showCharacterSelection && !introComplete) {
      setShowIntro(true);
    }
    if (introComplete) {
      setShowIntro(false);
    }
  }, [showCharacterSelection, introComplete]);

  if (showIntro) {
    return (
      <div className="intro-overlay">
        <TextType 
          text={["Welcome to My Portfolio"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter=""
          className="intro-text"
          loop={false}
        />
      </div>
    );
  }

  return null;
});

export default ControlsUI;


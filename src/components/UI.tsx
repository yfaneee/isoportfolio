import React from 'react';
import './UI.css';

interface UIProps {
  visible: boolean;
  canInteract?: boolean;
  showContent?: boolean;
}

const UI: React.FC<UIProps> = ({ visible, canInteract = false, showContent = false }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return (
    <div className="ui-overlay">
      {visible && (
        <div className="controls-hint" aria-label="Controls hint">
          {isMobile ? (
            // Mobile controls
            <>
              <div className="control-row">
                <span className="label">Touch to move</span>
              </div>
              {canInteract && !showContent && (
                <div className="control-row">
                  <span className="keys">
                    <kbd>Space</kbd>
                  </span>
                  <span className="label">Interact</span>
                </div>
              )}
            </>
          ) : (
            // Desktop controls
            <>
              <div className="control-row">
                <span className="keys">
                  <kbd>W</kbd>
                  <kbd>A</kbd>
                  <kbd>S</kbd>
                  <kbd>D</kbd>
                </span>
                <span className="label">Move</span>
              </div>
              <div className="control-row">
                <span className="keys">
                  <kbd>Shift</kbd>
                </span>
                <span className="label">Run</span>
              </div>
              {canInteract && !showContent && (
                <div className="control-row">
                  <span className="keys">
                    <kbd>Space</kbd>
                  </span>
                  <span className="label">Interact</span>
                </div>
              )}
              {showContent && (
                <div className="control-row">
                  <span className="keys">
                    <kbd>←</kbd>
                    <kbd>→</kbd>
                    <kbd>Q</kbd>
                    <kbd>E</kbd>
                  </span>
                  <span className="label">Navigate platforms</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UI;

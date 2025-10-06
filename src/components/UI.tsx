import React from 'react';
import './UI.css';

interface UIProps {
  visible: boolean;
}

const UI: React.FC<UIProps> = ({ visible }) => {
  return (
    <div className="ui-overlay">
      {visible && (
        <div className="controls-hint" aria-label="Controls hint">
          <div className="control-row">
            <span className="keys">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
            <span className="or">or</span>
            <span className="keys arrows">
              <kbd>↑</kbd>
              <kbd>←</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd>
            </span>
            <span className="label">Move</span>
          </div>
          <div className="control-row">
            <span className="keys">
              <kbd>Space</kbd>
            </span>
            <span className="label">Interact</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UI;

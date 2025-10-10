import React from 'react';
import './InfoPanel.css';

interface InfoPanelProps {
  isVisible: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ isVisible }) => {
  return (
    <div className={`info-panel ${isVisible ? 'visible' : ''}`} style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
      <div className="info-content">
        <div className="info-section">
          <h3>Menu</h3>
          <p>
            Welcome to my interactive 3D portfolio! Navigate through my work and projects 
            using the menu to quickly jump to different sections, or explore by walking 
            around the world. Each platform contains information about my work.
          </p>
        </div>

         <div className="info-section">
           <h3>Controls</h3>
           <div className="controls-list">
             <div className="control-row">
               <span className="key">W A S D</span>
               <span className="control-desc">Move around</span>
             </div>
             <div className="control-row">
               <span className="key">SPACE</span>
               <span className="control-desc">Interact / Activate elevator</span>
             </div>
             <div className="control-row">
               <span className="key">← → Q E</span>
               <span className="control-desc">Navigate between platforms</span>
             </div>
             <div className="control-row">
               <span className="key">ESC</span>
               <span className="control-desc">Open/Close menu</span>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default InfoPanel;

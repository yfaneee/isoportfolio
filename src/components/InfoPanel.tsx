import React from 'react';
import './InfoPanel.css';
import ElectricBorder from './ElectricBorder';

interface InfoPanelProps {
  isVisible: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ isVisible }) => {
  return (
    <div className={`info-panel ${isVisible ? 'visible' : ''}`} style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
      {isVisible ? (
        <ElectricBorder
          color="#E6E0FF" 
          speed={1}
          chaos={0.5}
          thickness={2}
          style={{ borderRadius: 16, width: '100%', height: '100%' }}
        >
          <div className="info-content" style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
        <div className="info-section">
          <div className="section-title-with-dividers">
            <div className="divider-left">
              <img src="/images/divider-003.png" alt="" />
            </div>
            <h3>Menu</h3>
            <div className="divider-right">
              <img src="/images/divider-003.png" alt="" />
            </div>
          </div>
          <p>
            Welcome to my interactive 3D portfolio! Navigate through my work and projects 
            using the menu to quickly jump to different sections, or explore by walking 
            around the world. Each platform contains information about my work.
          </p>
        </div>

         <div className="info-section">
           <div className="section-title-with-dividers">
             <div className="divider-left">
               <img src="/images/divider-003.png" alt="" />
             </div>
             <h3>Controls</h3>
             <div className="divider-right">
               <img src="/images/divider-003.png" alt="" />
             </div>
           </div>
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
               <span className="key">Q E</span>
               <span className="control-desc">Navigate between platforms</span>
             </div>
             <div className="control-row">
               <span className="key">ESC</span>
               <span className="control-desc">Open/Close menu</span>
             </div>
           </div>
         </div>
          </div>
        </ElectricBorder>
      ) : (
        <div className="info-content" style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
          <div className="info-section">
            <div className="section-title-with-dividers">
              <div className="divider-left">
                <img src="/images/divider-003.png" alt="" />
              </div>
              <h3>Menu</h3>
              <div className="divider-right">
                <img src="/images/divider-003.png" alt="" />
              </div>
            </div>
            <p>
              Welcome to my interactive 3D portfolio! Navigate through my work and projects 
              using the menu to quickly jump to different sections, or explore by walking 
              around the world. Each platform contains information about my work.
            </p>
          </div>

           <div className="info-section">
             <div className="section-title-with-dividers">
               <div className="divider-left">
                 <img src="/images/divider-003.png" alt="" />
               </div>
               <h3>Controls</h3>
               <div className="divider-right">
                 <img src="/images/divider-003.png" alt="" />
               </div>
             </div>
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
                 <span className="key">Q E</span>
                 <span className="control-desc">Navigate between platforms</span>
               </div>
               <div className="control-row">
                 <span className="key">ESC</span>
                 <span className="control-desc">Open/Close menu</span>
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;

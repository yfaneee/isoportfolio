import React, { useState, useEffect } from 'react';
import './RotatePhoneScreen.css';

const RotatePhoneScreen: React.FC = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // Check if device is in landscape mode
        const landscape = window.innerWidth > window.innerHeight;
        setIsLandscape(landscape);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Only show on mobile in portrait mode
  if (!isMobile || isLandscape) {
    return null;
  }

  return (
    <div className="rotate-phone-overlay">
      <div className="rotate-phone-content">
        <div className="phone-icon">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="10" width="40" height="70" rx="5" fill="none" stroke="white" strokeWidth="3"/>
            <circle cx="50" cy="75" r="3" fill="white"/>
            <path d="M 35 15 L 65 15" stroke="white" strokeWidth="2"/>
          </svg>
          <div className="rotate-arrow">↻</div>
        </div>
        <h2>Please Rotate Your Device</h2>
        <p>This experience works best in landscape mode</p>
      </div>
    </div>
  );
};

export default RotatePhoneScreen;


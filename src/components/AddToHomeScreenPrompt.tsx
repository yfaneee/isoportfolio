import React, { useState, useEffect } from 'react';
import './AddToHomeScreenPrompt.css';

const AddToHomeScreenPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if app is already in standalone mode (PWA)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               (window.navigator as any).standalone ||
                               document.referrer.includes('android-app://');

    // Check if user is on mobile and not in standalone mode
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/.test(navigator.userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(android);

    // Show prompt only if on mobile and not in standalone mode
    if ((iOS || android) && !isInStandaloneMode) {
      const hasSeenPrompt = localStorage.getItem('a2hs-prompt-dismissed');
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 1000);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('a2hs-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="a2hs-prompt-overlay">
      <div className="a2hs-prompt">
        <button className="a2hs-close" onClick={handleDismiss}>×</button>
        <h2>For the Best Experience</h2>
        <p>Add this app to your home screen for fullscreen mode without browser bars!</p>
        
        {isIOS && (
          <div className="a2hs-instructions">
            <p>Tap the <strong>Share</strong> button <span className="ios-share-icon">⎙</span></p>
            <p>Then select <strong>"Add to Home Screen"</strong></p>
          </div>
        )}
        
        {isAndroid && (
          <div className="a2hs-instructions">
            <p>Tap the <strong>Menu</strong> button <span className="android-menu-icon">⋮</span></p>
            <p>Then select <strong>"Add to Home Screen"</strong></p>
          </div>
        )}
        
        <button className="a2hs-dismiss-btn" onClick={handleDismiss}>
          Continue in Browser
        </button>
      </div>
    </div>
  );
};

export default AddToHomeScreenPrompt;


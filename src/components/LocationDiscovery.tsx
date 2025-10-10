import React, { useEffect, useState } from 'react';
import './LocationDiscovery.css';

interface LocationDiscoveryProps {
  isVisible: boolean;
  onComplete: () => void;
  locationName?: string;
  isCongratulatoryMessage?: boolean;
}

const LocationDiscovery: React.FC<LocationDiscoveryProps> = ({ isVisible, onComplete, locationName = "Luca's Portfolio", isCongratulatoryMessage = false }) => {
  const [showContent, setShowContent] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Small delay before showing content for dramatic effect
      const showTimer = setTimeout(() => {
        setShowContent(true);
      }, 300);

      // Start fade out after 3 seconds
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 3000);

      // Complete after fade animation
      const completeTimer = setTimeout(() => {
        onComplete();
        setShowContent(false);
        setFadeOut(false);
      }, 4000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(fadeTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`location-discovery-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className={`location-discovery-container ${showContent ? 'show' : ''}`}>
        {/* Background with border shading */}
        <div className="location-discovery-background">
          {/* Left divider */}
          <div className="divider-left">
            <img src="/images/divider-003.png" alt="" />
          </div>
          
          {/* Content */}
          <div className="location-content">
            {!isCongratulatoryMessage && (
              <div className="location-discovered-text">Location discovered</div>
            )}
            <div className="location-name">
              {locationName.includes('|') ? (
                locationName.split('|').map((line, index) => (
                  <div key={index}>{line}</div>
                ))
              ) : (
                locationName
              )}
            </div>
          </div>
          
          {/* Right divider (rotated) */}
          <div className="divider-right">
            <img src="/images/divider-003.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDiscovery;

import React, { useState, useEffect, useRef } from 'react';

interface WebsiteOverlayProps {
  isVisible: boolean;
  websiteUrl: string;
  billboardKey: string;
  onClose: () => void;
}

const WebsiteOverlay: React.FC<WebsiteOverlayProps> = ({
  isVisible,
  websiteUrl,
  billboardKey,
  onClose
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC key handler 
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // Use both capture and bubble phases
    document.addEventListener('keydown', handleKeyDown, true); 
    document.addEventListener('keydown', handleKeyDown, false); 
    
    // Also add to window for extra coverage
    window.addEventListener('keydown', handleKeyDown, true);
    
    // Add to document.body as well
    document.body.addEventListener('keydown', handleKeyDown, true);
    
    // Capture the current ref value for cleanup
    const currentOverlay = overlayRef.current;
    
    // Focus the overlay and make it stay focused
    let focusInterval: NodeJS.Timeout | undefined;
    if (currentOverlay) {
      currentOverlay.focus();
      // Keep refocusing the overlay periodically when iframe might steal focus
      focusInterval = setInterval(() => {
        if (overlayRef.current && document.activeElement?.tagName === 'IFRAME') {
          overlayRef.current.focus();
        }
      }, 500);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, false);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.body.removeEventListener('keydown', handleKeyDown, true);
      
      // Clean up focus interval using the captured value
      if (focusInterval) {
        clearInterval(focusInterval);
      }
    };
  }, [isVisible, onClose]);

  // Reset iframe error when overlay becomes visible
  useEffect(() => {
    if (isVisible) {
      setIframeError(false);
    }
  }, [isVisible]);

  // Hide instructions after 5 seconds
  useEffect(() => {
    if (isVisible) {
      setShowInstructions(true);
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Add CSS animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
          @keyframes fadeOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(10px); }
          }
        `}
      </style>
      
      <div 
        ref={overlayRef}
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none'
        }}
        onMouseDown={(e) => {
          // Prevent iframe from losing focus when clicking outside
          if (e.target === e.currentTarget) {
            e.preventDefault();
          }
        }}
      >
      <div style={{ 
        width: '90%', 
        height: '90%', 
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 0 50px rgba(165, 128, 255, 0.5)'
      }}>
        {!iframeError ? (
          <iframe
            src={websiteUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '10px'
            }}
            title={`Website - ${billboardKey}`}
            onError={() => setIframeError(true)}
            onLoad={() => setIframeError(false)}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            padding: '40px'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '2rem' }}>🚀 Website Preview</h2>
            <p style={{ marginBottom: '30px', fontSize: '1.2rem', opacity: 0.9 }}>
              This website cannot be embedded, but you can visit it directly!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(websiteUrl, '_blank');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🌐 Open Website in New Tab
            </button>
            <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.7 }}>
              {websiteUrl}
            </p>
          </div>
        )}
        
        {/* Exit button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(165, 128, 255, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}
        >
          ×
        </button>
        
        {/* Instructions - more prominent with fade out */}
        {showInstructions && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(165, 128, 255, 0.9)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            zIndex: 1001,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            animation: showInstructions ? 'fadeIn 0.3s ease-in' : 'fadeOut 0.5s ease-out',
            transition: 'opacity 0.5s ease-out'
          }}>
            Press ESC or click × to return to 3D world
          </div>
        )}
        
        {/* Top ESC reminder */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>ESC</span>
          Exit
        </div>
      </div>
      </div>
    </>
  );
};

export default WebsiteOverlay;
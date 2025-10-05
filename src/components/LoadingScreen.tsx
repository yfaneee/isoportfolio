import React from 'react';

interface LoadingScreenProps {
  onStart: () => void;
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onStart, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      pointerEvents: 'none' // Allow clicks to pass through to the 3D scene
    }}>
      <button
        onClick={onStart}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.5rem',
          fontFamily: '"Coolvetica Rg", sans-serif',
          backgroundColor: '#FAA32B',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'normal',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto' // Re-enable pointer events for the button
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#E8931F';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#FAA32B';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        }}
      >
        START
      </button>
    </div>
  );
};

export default LoadingScreen;

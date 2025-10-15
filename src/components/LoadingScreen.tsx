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
      pointerEvents: 'none'
    }}>
      <button
        onClick={onStart}
        style={{
          padding: window.innerWidth <= 768 ? '0.8rem 1.5rem' : '1rem 2rem',
          fontSize: window.innerWidth <= 768 ? '1rem' : '1.3rem',
          fontFamily: '"Satoshi-Medium", sans-serif',
          backgroundColor: '#E6E0FF',
          color: '#2E003E',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'normal',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto' 
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#2E003E';
          e.currentTarget.style.color = '#E6E0FF';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#E6E0FF';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.color = '#2E003E';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        }}
      >
        START
      </button>
    </div>
  );
};

export default LoadingScreen;

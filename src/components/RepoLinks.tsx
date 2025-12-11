import React from 'react';
import './RepoLinks.css';

interface RepoLinksProps {
  isVisible: boolean;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

const RepoLinks: React.FC<RepoLinksProps> = ({ isVisible, isMusicPlaying, onToggleMusic }) => {
  if (!isVisible) return null;

  return (
    <div className="repo-links-fixed">
      <button 
        onClick={(e) => {
          onToggleMusic();
          e.currentTarget.blur(); 
        }}
        className={`repo-link-fixed music-button ${isMusicPlaying ? 'playing' : ''}`}
        title={isMusicPlaying ? 'Mute Music' : 'Unmute Music'}
      >
        {isMusicPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="repo-icon-fixed">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="repo-icon-fixed">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        )}
      </button>
      <a 
        href="https://github.com/yfaneee/isoportfolio" 
        target="_blank" 
        rel="noopener noreferrer"
        className="repo-link-fixed github-link"
        title="View on GitHub"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="repo-icon-fixed">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>
      <a 
        href="https://git.fhict.nl/I503826/isometricportfolio" 
        target="_blank" 
        rel="noopener noreferrer"
        className="repo-link-fixed gitlab-link"
        title="View on GitLab"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="repo-icon-fixed">
          <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 00-.867 0L1.388 9.452.046 13.587a.924.924 0 00.331 1.023L12 23.054l11.623-8.443a.92.92 0 00.332-1.024"/>
        </svg>
      </a>
    </div>
  );
};

export default RepoLinks;


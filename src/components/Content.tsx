import React from 'react';
import { ContentItem } from '../data/ContentData';
import './Content.css';

interface ContentProps {
  isVisible: boolean;
  content: ContentItem | null;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
}

const Content: React.FC<ContentProps> = ({ 
  isVisible, 
  content, 
  onNavigatePrev, 
  onNavigateNext,
  canNavigatePrev = true,
  canNavigateNext = true
}) => {
  if (!content) return null;

  return (
    <div className={`content-box ${isVisible ? 'visible' : ''}`} style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
      <div className="content-box-content">
        <div className="content-box-header">
          {canNavigatePrev && (
            <button 
              className="nav-arrow nav-arrow-left" 
              onClick={onNavigatePrev}
              aria-label="Previous slab"
            >
              ◄
            </button>
          )}
          <h2>{content.title}</h2>
          {canNavigateNext && (
            <button 
              className="nav-arrow nav-arrow-right" 
              onClick={onNavigateNext}
              aria-label="Next slab"
            >
              ►
            </button>
          )}
        </div>
        <div className="content-box-body">
          <p className="description">{content.description}</p>
          <ul className="details-list">
            {content.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Content;

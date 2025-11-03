import React from 'react';
import { ContentItem, ExampleItem } from '../data/ContentData';
import './Content.css';

interface ContentProps {
  isVisible: boolean;
  content: ContentItem | null;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  onClose?: () => void;
}

const Content: React.FC<ContentProps> = ({ 
  isVisible, 
  content, 
  onNavigatePrev, 
  onNavigateNext,
  canNavigatePrev = true,
  canNavigateNext = true,
  onClose
}) => {
  if (!content) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handlePdfOpen = (pdfUrl: string, page?: number) => {
    const fullUrl = page ? `${pdfUrl}#page=${page}` : pdfUrl;
    window.open(fullUrl, '_blank');
  };

  const renderExample = (example: ExampleItem) => (
    <div key={example.id} className="example-card">
      <div className="example-image-container">
        <img 
          src={example.image} 
          alt={example.title}
          className="example-image"
        />
      </div>
      <div className="example-content">
        <h3 className="example-title">{example.title}</h3>
        <p className="example-description">{example.description}</p>
        <button 
          className="pdf-link-button"
          onClick={() => handlePdfOpen(example.pdfUrl, example.pdfPage)}
        >
          View More →
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop overlay */}
      {isVisible && (
        <div 
          className="content-backdrop" 
          onClick={handleBackdropClick}
          style={{ visibility: isVisible ? 'visible' : 'hidden' }}
        />
      )}
      <div 
        className={`content-box ${isVisible ? 'visible' : ''}`} 
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
        onClick={handleContentClick}
      >
        <div className="content-box-content">
        <div className="content-box-header">
          {canNavigatePrev && <span className="nav-key nav-key-left">Q</span>}
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
          {canNavigateNext && <span className="nav-key nav-key-right">E</span>}
        </div>
        <div className="content-box-body">
          {content.examples && content.examples.length > 0 ? (
            <div className="examples-container">
              {content.examples.map(renderExample)}
            </div>
          ) : (
            <>
              {content.description && <p className="description">{content.description}</p>}
              <ul className="details-list">
                {content.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default Content;

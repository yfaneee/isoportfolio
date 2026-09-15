import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ContentItem, ExampleItem } from '../data/ContentData';
import GSplatViewer from './GSplatViewer';
import './Content.css';

// Lazy image component with intersection observer
const LazyArtworkImage: React.FC<{
  src: string;
  index: number;
  onLoad: (src: string) => void;
  isLoaded: boolean;
  onClick: (src: string) => void;
}> = React.memo(({ src, index, onLoad, isLoaded, onClick }) => {
  const [isInView, setIsInView] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = itemRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } 
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={itemRef}
      className={`artwork-masonry-item ${isLoaded ? 'loaded' : 'loading'}`}
      onClick={() => onClick(src)}
    >
      {isInView ? (
        <img 
          src={src} 
          alt={`Artwork ${index + 1}`}
          className="artwork-masonry-image"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={() => onLoad(src)}
        />
      ) : null}
      {!isLoaded && <div className="artwork-masonry-skeleton" />}
    </div>
  );
});

interface ContentProps {
  isVisible: boolean;
  content: ContentItem | null;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  onClose?: () => void;
  onGSplatLoad?: () => void;
}

const Content: React.FC<ContentProps> = React.memo(({ 
  isVisible, 
  content, 
  onNavigatePrev, 
  onNavigateNext,
  canNavigatePrev = true,
  canNavigateNext = true,
  onClose,
  onGSplatLoad
}) => {
  const examplesContainerRef = useRef<HTMLDivElement>(null);
  const contentBoxBodyRef = useRef<HTMLDivElement>(null);
  const previousContentTitleRef = useRef<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [showGallery, setShowGallery] = useState(false);

  // Reset scroll position when content changes 
  useEffect(() => {
    if (content && isVisible) {
      const currentTitle = content.title;
      const contentChanged = previousContentTitleRef.current !== currentTitle;
      
      if (contentChanged || previousContentTitleRef.current === null) {
        previousContentTitleRef.current = currentTitle;
        // Reset loaded images when content changes
        setLoadedImages(new Set());
        setSelectedImage(null);
        setShowGallery(false);
        
        // ensure DOM is updated
        requestAnimationFrame(() => {
          if (examplesContainerRef.current) {
            examplesContainerRef.current.scrollTop = 0;
          }
          if (contentBoxBodyRef.current) {
            contentBoxBodyRef.current.scrollTop = 0;
          }
        });
      }
    }
  }, [content, isVisible]);

  useEffect(() => {
    if (!content?.artworkGallery || !isVisible) {
      setShowGallery(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setShowGallery(true);
    }, 200); 
    
    return () => clearTimeout(timer);
  }, [content, isVisible]);

  // Preload first few images while panel is animating
  useEffect(() => {
    if (!content?.artworkGallery || !isVisible) return;
    
    // Preload first 6 images in background
    const imagesToPreload = content.artworkGallery.images.slice(0, 6);
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [content, isVisible]); 

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };
    
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage]);

  // Handle image load for progressive loading
  const handleImageLoad = useCallback((imageSrc: string) => {
    setLoadedImages(prev => new Set(prev).add(imageSrc));
  }, []);

  // Handle image click to open modal
  const handleImageClick = useCallback((imageSrc: string) => {
    setSelectedImage(imageSrc);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

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

  const handleBrandGuideClick = (url: string) => {
    window.open(url, '_blank');
  };

  const renderExample = (example: ExampleItem) => (
    <div 
      key={example.id} 
      className="example-card"
      onClick={() => handlePdfOpen(example.pdfUrl)}
    >
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
        <div className="content-box-body" ref={contentBoxBodyRef}>
          {content.portfolioContent ? (
            <div className="portfolio-container" ref={examplesContainerRef}>
              {/* Live site preview - the whole card is the link */}
              <a
                className="portfolio-hero"
                href={content.portfolioContent.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${content.title} in a new tab`}
              >
                <img
                  src={content.portfolioContent.previewImage}
                  alt={`${content.title} homepage`}
                  className="portfolio-hero-image"
                  decoding="async"
                />
                <span className="portfolio-hero-overlay">
                  <span className="portfolio-hero-cta">Visit live site ↗</span>
                </span>
              </a>

              <div className="portfolio-intro">
                <span className="portfolio-eyebrow">{content.portfolioContent.eyebrow}</span>
                <p className="portfolio-summary">{content.portfolioContent.summary}</p>
              </div>

              {content.portfolioContent.sections.map((section, index) => (
                <section key={section.title} className="portfolio-section">
                  <h3 className="portfolio-section-title">
                    <span className="portfolio-section-index">{String(index + 1).padStart(2, '0')}</span>
                    {section.title}
                  </h3>
                  <button
                    type="button"
                    className="portfolio-section-image-button"
                    onClick={() => handleImageClick(section.image)}
                    aria-label={`Enlarge image: ${section.imageAlt}`}
                  >
                    <img
                      src={section.image}
                      alt={section.imageAlt}
                      className="portfolio-section-image"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                  <ul className="portfolio-points">
                    {section.points.map(point => (
                      <li key={point} className="portfolio-point">{point}</li>
                    ))}
                  </ul>
                </section>
              ))}

              {/* Source code */}
              <div className="portfolio-repo">
                <a
                  className="portfolio-repo-button"
                  href={content.portfolioContent.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View the code on GitHub"
                  aria-label={`View the code for ${content.title} on GitHub`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="portfolio-repo-icon">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          ) : content.projectContent ? (
            <div className="project-content-container" ref={examplesContainerRef}>
              {/* Project Logo */}
              {content.projectContent.logo && (
                <div className="studio-logo-container">
                  <img 
                    src={content.projectContent.logo} 
                    alt={`${content.title} logo`}
                    className="studio-logo"
                  />
                </div>
              )}

              {/* Project Header */}
              <div className="project-header">
                <p className="project-description">{content.projectContent.description}</p>
              </div>

              {/* GSplat Viewer */}
              <div className="project-viewer-section">
                <GSplatViewer 
                  plyUrl={content.projectContent.gsplatUrl} 
                  onLoad={onGSplatLoad}
                />
              </div>

              {/* Project Process / Notes */}
              {content.projectContent.processText && (
                <div className="project-notes">
                  <p className="project-description">{content.projectContent.processText}</p>
                </div>
              )}

              {/* Project Process Points */}
              {content.projectContent.processPoints && content.projectContent.processPoints.length > 0 && (
                <div className="project-process-points">
                  <ul className="project-points-list">
                    {content.projectContent.processPoints.map((point, idx) => (
                      <li key={idx} className="project-point-item">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Optional Images */}
              {content.projectContent.images && content.projectContent.images.length > 0 && (
                <div className="project-images">
                  {content.projectContent.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Project ${idx + 1}`}
                      className="project-image"
                      onClick={() => handleImageClick(img)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : content.studioContent ? (
            <div className="studio-content-container" ref={examplesContainerRef}>
              {/* Logo */}
              <div className="studio-logo-container">
                <img 
                  src={content.studioContent.logo} 
                  alt="SeaMonkeys Logo"
                  className="studio-logo"
                />
              </div>

              {/* Mission Statement */}
              <div className="studio-section">
                <h3 className="studio-section-title">{content.studioContent.missionTitle}</h3>
                <p className="studio-section-text">{content.studioContent.missionText}</p>
              </div>

              {/* Core Values */}
              <div className="studio-section">
                <h3 className="studio-section-title">{content.studioContent.coreValuesTitle}</h3>
                <div className="studio-core-values">
                  {content.studioContent.coreValues.map((value, index, array) => (
                    <React.Fragment key={index}>
                      <span className="studio-core-value">{value}</span>
                      {index < array.length - 1 && (
                        <span className="studio-core-value-separator">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Brand Guide Image with Hover Effect */}
              <div className="studio-brand-guide-container">
                <div 
                  className="studio-brand-guide-image-wrapper"
                  onClick={() => handleBrandGuideClick(content.studioContent!.brandGuideUrl)}
                >
                  <img 
                    src={content.studioContent.brandGuideImage} 
                    alt="Brand Guide"
                    className="studio-brand-guide-image"
                  />
                  <div className="studio-brand-guide-overlay">
                    <span className="studio-brand-guide-overlay-text">Click to view</span>
                  </div>
                </div>
              </div>

              {/* Artwork */}
              <div className="studio-section">
                <h3 className="studio-artwork-title">{content.studioContent.artworkTitle}</h3>
                <div className="studio-artwork-container">
                  <img 
                    src={content.studioContent.artworkImage} 
                    alt="Artwork"
                    className="studio-artwork-image"
                  />
                </div>
              </div>
            </div>
          ) : content.artworkGallery ? (
            <div className="artwork-masonry-container" ref={examplesContainerRef}>
              {showGallery ? (
                <div className="artwork-masonry">
                  {content.artworkGallery.images.map((image, index) => (
                    <LazyArtworkImage
                      key={image}
                      src={image}
                      index={index}
                      onLoad={handleImageLoad}
                      isLoaded={loadedImages.has(image)}
                      onClick={handleImageClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="artwork-loading-placeholder">
                  <div className="artwork-loading-spinner" />
                </div>
              )}
            </div>
          ) : content.examples && content.examples.length > 0 ? (
            <div className="examples-container" ref={examplesContainerRef}>
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="artwork-modal-overlay" onClick={closeModal}>
          <div className="artwork-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="artwork-modal-close" onClick={closeModal}>×</button>
            <img 
              src={selectedImage} 
              alt="Full size artwork" 
              className="artwork-modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
});

export default Content;

import React, { useState } from 'react';
import { DocsImage, ProjectDocs } from '../data/InteractionZones';
import './BillboardDocs.css';

interface BillboardDocsProps {
  docs: ProjectDocs;
}

// Written documentation shown on a billboard that has no live site to embed
const BillboardDocs: React.FC<BillboardDocsProps> = ({ docs }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const renderFigures = (images: DocsImage[], variant: 'wide' | 'phones') => {
    const modifier = variant === 'phones'
      ? ' is-phones'
      : images.length > 1 ? ' is-grid' : '';

    return (
      <div className={`billboard-docs-figures${modifier}`}>
        {images.map(image => (
          <figure key={image.src} className="billboard-docs-figure">
            <img
              src={image.src}
              alt={image.caption}
              loading="lazy"
              onClick={() => setExpandedImage(image.src)}
            />
            <figcaption>{image.caption}</figcaption>
          </figure>
        ))}
      </div>
    );
  };

  return (
    <div className="billboard-docs">
      <article className="billboard-docs-body">
        <h1 className="billboard-docs-title">{docs.title}</h1>
        <p className="billboard-docs-intro">{docs.intro}</p>

        {docs.sections?.map(section => (
          <section key={section.heading} className="billboard-docs-section">
            <h2 className="billboard-docs-heading">{section.heading}</h2>

            {section.paragraphs?.map((paragraph, idx) => (
              <p key={idx} className="billboard-docs-paragraph">{paragraph}</p>
            ))}

            {section.points && section.points.length > 0 && (
              <ul className="billboard-docs-points">
                {section.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            )}

            {section.phones && section.phones.length > 0 && renderFigures(section.phones, 'phones')}

            {section.images && section.images.length > 0 && renderFigures(section.images, 'wide')}
          </section>
        ))}
      </article>

      {expandedImage && (
        <div className="billboard-docs-lightbox" onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} alt="" />
          <span className="billboard-docs-lightbox-hint">Click anywhere to close</span>
        </div>
      )}
    </div>
  );
};

export default BillboardDocs;

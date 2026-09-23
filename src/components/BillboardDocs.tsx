import React, { useState } from 'react';
import { ProjectDocs } from '../data/InteractionZones';
import './BillboardDocs.css';

interface BillboardDocsProps {
  docs: ProjectDocs;
}

// Written documentation shown on a billboard that has no live site to embed
const BillboardDocs: React.FC<BillboardDocsProps> = ({ docs }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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

            {section.images && section.images.length > 0 && (
              <div className={`billboard-docs-figures${section.images.length > 1 ? ' is-grid' : ''}`}>
                {section.images.map(image => (
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
            )}
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

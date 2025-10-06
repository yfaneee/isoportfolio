import React from 'react';
import { ContentItem } from '../data/ContentData';
import './Content.css';

interface ContentProps {
  isVisible: boolean;
  content: ContentItem | null;
}

const Content: React.FC<ContentProps> = ({ isVisible, content }) => {
  if (!content) return null;

  return (
    <div className={`content-box ${isVisible ? 'visible' : ''}`} style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
      <div className="content-box-content">
        <div className="content-box-header">
          <h2>{content.title}</h2>
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

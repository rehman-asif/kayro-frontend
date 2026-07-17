import type { ReactNode } from 'react';
import { OptimizedImage } from './OptimizedImage';

interface SplitSectionProps {
  tag: string;
  title: string;
  children: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  reverse?: boolean;
  action?: ReactNode;
}

export function SplitSection({
  tag,
  title,
  children,
  imageSrc = '/products/soap-bars.jpg',
  imageAlt = 'The Precious Creations handcrafted products',
  reverse = false,
  action,
}: SplitSectionProps) {
  return (
    <section className="section">
      <div className="container">
        <div className={`split-section${reverse ? ' reverse' : ''}`}>
          <div className="split-content">
            <span className="section-tag">{tag}</span>
            <h2>{title}</h2>
            {children}
            {action}
          </div>
          <div className="split-image">
            <OptimizedImage
              src={imageSrc}
              alt={imageAlt}
              sizes="(max-width: 992px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { BRAND_IMAGES } from '../../data/images';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  fallback?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority,
  sizes,
  fallback = BRAND_IMAGES.heroProducts,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`optimized-image${loaded ? ' is-loaded' : ''} ${className}`.trim()}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
    />
  );
}

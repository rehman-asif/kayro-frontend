import { Link } from 'react-router-dom';
import { BRAND } from '../../data/brand';
import { BRAND_IMAGES } from '../../data/images';
import { OptimizedImage } from '../ui/OptimizedImage';

export function Hero() {
  return (
    <section className="hero hero-landing">
      <div className="hero-leaf hero-leaf--left" aria-hidden="true" />
      <div className="hero-leaf hero-leaf--right" aria-hidden="true" />

      <div className="hero-content">
        <span className="hero-eyebrow">{BRAND.name}</span>

        <h1 className="hero-title">
          {BRAND.tagline}
        </h1>

        <p className="hero-subtext">
          Premium skincare and wellness — blending nature&apos;s finest botanicals with
          science-backed formulations for healthy, radiant skin.
        </p>

        <Link to="/products" className="btn btn-forest hero-cta">
          SHOP NOW <i className="fas fa-arrow-right" style={{ marginLeft: 8 }} />
        </Link>
      </div>

      <div className="hero-image">
        <OptimizedImage
          src={BRAND_IMAGES.heroProducts}
          alt="The Precious Creations Turmeric Glow Up body lotion, rose bath salts, and handcrafted soap"
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 992px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { BRAND_IMAGES } from '../../data/images';
import { OptimizedImage } from '../ui/OptimizedImage';

export function Hero() {
  return (
    <section className="hero hero-landing">
      <div className="hero-leaf hero-leaf--left" aria-hidden="true" />
      <div className="hero-leaf hero-leaf--right" aria-hidden="true" />

      <div className="hero-content">
        <span className="hero-eyebrow">PURE INGREDIENTS. REAL RESULTS.</span>

        <h1 className="hero-title">
          Skincare &amp; Haircare
          <span className="hero-italic">
            crafted with nature&apos;s
            <span className="hero-title-line">
              finest.
              <svg className="hero-flourish-svg" width="45" height="15" viewBox="0 0 45 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 9.5C12 9.5 42 9.5 42 9.5" stroke="var(--peach-dark)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M15 9.5C18 6.5 20 3.5 20 3.5C20 3.5 19 7.5 16 9" fill="var(--peach-dark)"/>
                <path d="M25 9.5C28 6.5 30 3.5 30 3.5C30 3.5 29 7.5 26 9" fill="var(--peach-dark)"/>
                <path d="M18 9.5C15 12.5 13 15.5 13 15.5C13 15.5 14 11.5 17 10" fill="var(--peach-dark)"/>
                <path d="M28 9.5C25 12.5 23 15.5 23 15.5C23 15.5 24 11.5 27 10" fill="var(--peach-dark)"/>
              </svg>
            </span>
          </span>
        </h1>

        <p className="hero-subtext">
          Handcrafted with love using natural ingredients for healthy, radiant you.
        </p>

        <Link to="/products" className="btn btn-forest hero-cta">
          SHOP NOW <i className="fas fa-arrow-right" style={{ marginLeft: 8 }} />
        </Link>
      </div>

      <div className="hero-image">
        <OptimizedImage
          src={BRAND_IMAGES.heroProducts}
          alt="The Precious Creations natural skincare and haircare products on stone with botanicals"
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 992px) 100vw, 50vw"
        />
      </div>
    </section>
  );
}

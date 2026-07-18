import { Link } from 'react-router-dom';
import { CATEGORY_CARDS } from '../../data/products';
import { OptimizedImage } from '../ui/OptimizedImage';

export function ShopByCategory() {
  return (
    <section className="category-section">
      <span className="category-deco category-deco--tl" aria-hidden="true">
        <i className="fas fa-leaf" />
      </span>
      <span className="category-deco category-deco--br" aria-hidden="true">
        <i className="fas fa-leaf" />
      </span>

      <div className="container">
        <header className="category-section-header">
          <h2>Our Signature Range</h2>
          <p>Serums, soaps, hair care, body care, bundles, diffusers, and perfumes — handcrafted for every ritual</p>
        </header>

        <div className="category-grid">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.label}
              to={cat.slug ? `/products?category=${encodeURIComponent(cat.slug)}` : '/products'}
              className="category-card"
            >
              <div className="category-card-image-wrapper">
                <div className="category-card-image">
                  <OptimizedImage
                    src={cat.image}
                    alt={`${cat.label} — The Precious Creations`}
                    sizes="(max-width: 768px) 45vw, 220px"
                  />
                </div>
                <span className="category-card-badge">
                  <i className="fas fa-leaf" />
                </span>
              </div>
              <h3>{cat.label}</h3>
            </Link>
          ))}
        </div>

        <div className="category-section-cta">
          <Link to="/products" className="btn btn-terracotta">
            View All Products <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
}

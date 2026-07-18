import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '../ui/OptimizedImage';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../data/products';
import { fetchCategories, type StoreCategory } from '../../services/categoryService';

export function ShopByCategory() {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCategories();
        if (!cancelled) setCategories(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--charcoal-light)' }}>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--charcoal-light)' }}>
            Categories coming soon — photos will appear once uploaded from the admin dashboard.
          </p>
        ) : (
          <div className="category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.slug ? `/products?category=${encodeURIComponent(cat.slug)}` : '/products'}
                className="category-card"
              >
                <div className="category-card-image-wrapper">
                  <div className="category-card-image">
                    <OptimizedImage
                      src={cat.placeholder ? PRODUCT_PLACEHOLDER_IMAGE : cat.imageUrl}
                      alt={`${cat.label} — The Precious Creations`}
                      sizes="(max-width: 768px) 45vw, 220px"
                      fallback={PRODUCT_PLACEHOLDER_IMAGE}
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
        )}

        <div className="category-section-cta">
          <Link to="/products" className="btn btn-terracotta">
            View All Products <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
}

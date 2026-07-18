import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../data/products';
import { ProductGrid } from '../components/products/ProductGrid';
import { PageHero } from '../components/ui/PageHero';
import { useAIChat } from '../context/AppContext';
import { useProductCatalog } from '../context/ProductCatalogContext';

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const { openChat } = useAIChat();
  const { products, loading } = useProductCatalog();

  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <>
      <PageHero
        title="Discover All Products"
        description="Handcrafted skincare, hair care, and wellness from Maseru, Lesotho"
      />

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / Shop
        </div>
        <div className="products-layout">
          <aside className="filter-sidebar">
            <h3>Shop by Category</h3>
            <ul className="filter-list">
              {CATEGORIES.map((cat) => (
                <li
                  key={cat}
                  className={activeCategory === cat ? 'active' : ''}
                  onClick={() => setActiveCategory(cat)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveCategory(cat)}
                  role="button"
                  tabIndex={0}
                >
                  {cat === 'All' ? 'All Products' : cat}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-peach btn-block btn-sm"
                onClick={() => openChat('productFinder')}
              >
                <i className="fas fa-robot" /> AI Product Finder
              </button>
            </div>
          </aside>
          <main>
            {loading ? (
              <p style={{ color: 'var(--charcoal-light)' }}>Loading products...</p>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--charcoal-light)' }}>
                <p style={{ fontSize: 18, marginBottom: 8 }}>Products coming soon</p>
                <p>Combo bestsellers will appear here. Individual products will be added with correct photos.</p>
              </div>
            ) : (
              <ProductGrid products={filtered} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

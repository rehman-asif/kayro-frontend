import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATEGORIES, getProductsByCategory } from '../data/products';
import { ProductGrid } from '../components/products/ProductGrid';
import { PageHero } from '../components/ui/PageHero';
import { useAIChat } from '../context/AppContext';

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const { openChat } = useAIChat();

  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const products = getProductsByCategory(activeCategory);

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
            <ProductGrid products={products} />
          </main>
        </div>
      </div>
    </>
  );
}

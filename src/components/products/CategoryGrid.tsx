import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '../ui/OptimizedImage';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../data/products';
import { fetchCategories, type StoreCategory } from '../../services/categoryService';

export function CategoryGrid() {
  const [categories, setCategories] = useState<StoreCategory[]>([]);

  useEffect(() => {
    void fetchCategories().then(setCategories);
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="category-grid">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={cat.slug ? `/products?category=${encodeURIComponent(cat.slug)}` : '/products'}
          className="category-card"
        >
          <div className="category-card-image">
            <OptimizedImage
              src={cat.placeholder ? PRODUCT_PLACEHOLDER_IMAGE : cat.imageUrl}
              alt={`${cat.label} collection — The Precious Creations`}
              sizes="(max-width: 768px) 45vw, 200px"
              fallback={PRODUCT_PLACEHOLDER_IMAGE}
            />
            <span className="category-card-badge">
              <i className="fas fa-leaf" />
            </span>
          </div>
          <h3>{cat.label}</h3>
        </Link>
      ))}
    </div>
  );
}

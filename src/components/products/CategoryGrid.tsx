import { Link } from 'react-router-dom';
import { CATEGORY_CARDS } from '../../data/products';
import { OptimizedImage } from '../ui/OptimizedImage';

export function CategoryGrid() {
  return (
    <div className="category-grid">
      {CATEGORY_CARDS.map((cat) => (
        <Link
          key={cat.label}
          to={cat.slug ? `/products?category=${encodeURIComponent(cat.slug)}` : '/products'}
          className="category-card"
        >
          <div className="category-card-image">
            <OptimizedImage
              src={cat.image}
              alt={`${cat.label} collection — The Precious Creations`}
              sizes="(max-width: 768px) 45vw, 200px"
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

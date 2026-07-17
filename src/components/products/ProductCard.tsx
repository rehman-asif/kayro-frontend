import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { formatPrice } from '../../data/products';
import { getProductImage } from '../../data/images';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/AppContext';
import { OptimizedImage } from '../ui/OptimizedImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const imageSrc = getProductImage(product);

  const handleAdd = () => {
    addToCart(product.id);
    showToast(`${product.name} added to cart`);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-card-image">
          {product.comingSoon && <span className="product-badge soon">Coming Soon</span>}
          {!product.comingSoon && product.featured && <span className="product-badge">Featured</span>}
          <OptimizedImage
            src={imageSrc}
            alt={`${product.name} — ${product.category} by The Precious Creations`}
            sizes="(max-width: 768px) 50vw, 280px"
          />
        </div>
      </Link>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
        <div className="product-price">{formatPrice(product.price)}</div>
        <div className="product-card-actions">
          {product.comingSoon ? (
            <button type="button" className="btn btn-sm btn-outline btn-block" disabled>Coming Soon</button>
          ) : (
            <>
              <button type="button" className="btn btn-sm btn-primary" onClick={handleAdd}>Add to Cart</button>
              <Link to={`/product/${product.id}`} className="btn btn-sm btn-outline">View</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

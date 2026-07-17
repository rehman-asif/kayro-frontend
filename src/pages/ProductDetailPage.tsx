import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById, formatPrice } from '../data/products';
import { getProductImage } from '../data/images';
import { useCart } from '../context/CartContext';
import { useToast, useAIChat } from '../context/AppContext';
import { OptimizedImage } from '../components/ui/OptimizedImage';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : undefined;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { openChat } = useAIChat();

  if (!product) {
    return (
      <div className="container section">
        <p>Product not found.</p>
        <Link to="/products" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const imageSrc = getProductImage(product);

  const handleAdd = () => {
    addToCart(product.id, quantity);
    showToast(`${product.name} added to cart`);
  };

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Shop</Link> / {product.name}
      </div>
      <div className="product-detail">
        <div className="product-detail-image">
          <OptimizedImage
            src={imageSrc}
            alt={`${product.name} — handcrafted ${product.category} by The Precious Creations`}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 992px) 100vw, 500px"
          />
        </div>
        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-rating">
            ★★★★★ <span className="product-rating-note">(Handcrafted in Maseru)</span>
          </div>
          <div className="product-detail-price">{formatPrice(product.price)}</div>
          <p className="product-description">{product.description}</p>
          {product.ingredients && (
            <p className="product-ingredients"><strong>Key Ingredients:</strong> {product.ingredients}</p>
          )}
          {product.benefits && (
            <ul className="product-benefits">
              {product.benefits.map((b) => <li key={b}>{b}</li>)}
            </ul>
          )}
          {product.comingSoon ? (
            <p className="coming-soon-text">Coming Soon — Stay tuned!</p>
          ) : (
            <>
              <div className="quantity-selector">
                <label htmlFor="qty">Quantity:</label>
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input id="qty" type="number" value={quantity} min={1} max={99} readOnly />
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button type="button" className="btn btn-primary btn-block" onClick={handleAdd}>Add to Bag</button>
            </>
          )}
        </div>
      </div>
      <div className="product-detail-cta">
        <button type="button" className="btn btn-peach" onClick={() => openChat('beauty')}>
          <i className="fas fa-robot" /> Ask Beauty AI About This Product
        </button>
      </div>
    </div>
  );
}

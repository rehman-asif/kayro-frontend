import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { getCartItemImage } from '../data/images';
import { PageHero } from '../components/ui/PageHero';
import { OptimizedImage } from '../components/ui/OptimizedImage';

export function CartPage() {
  const { items, total, removeFromCart, updateQuantity } = useCart();

  if (!items.length) {
    return (
      <>
        <PageHero title="Shopping Cart" />
        <section className="section">
          <div className="container">
            <div className="cart-empty">
              <div className="cart-empty-image">
                <OptimizedImage
                  src="/products/hero-products.jpg"
                  alt="The Precious Creations products"
                  sizes="200px"
                />
              </div>
              <h2>Your cart is empty</h2>
              <p>Discover our handcrafted skincare collection.</p>
              <Link to="/products" className="btn btn-primary">Shop Now</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero title="Shopping Cart" />
      <section className="section">
        <div className="container">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="cart-item-info">
                      <div className="cart-item-image">
                        <OptimizedImage
                          src={getCartItemImage(item.id, item.category)}
                          alt={item.name}
                          sizes="80px"
                        />
                      </div>
                      <div>
                        <strong>{item.name}</strong>
                        <br />
                        <small>{item.category}</small>
                      </div>
                    </div>
                  </td>
                  <td>{formatPrice(item.price)}</td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      aria-label={`Quantity for ${item.name}`}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    />
                  </td>
                  <td><strong>{formatPrice(item.price * item.quantity)}</strong></td>
                  <td>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary">
            <div className="cart-summary-row"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="cart-summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
            <div className="cart-summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
            <Link to="/checkout" className="btn btn-primary btn-block cart-checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

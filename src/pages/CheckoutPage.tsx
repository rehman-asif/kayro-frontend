import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND } from '../data/brand';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/AppContext';
import { placeOnlineOrder } from '../services/crmService';

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSubmitting(true);
    setError('');
    try {
      const res = await placeOnlineOrder({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country || 'Lesotho',
        notes: data.notes,
        deliveryMethod: 'delivery',
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      clearCart();
      showToast(`Order ${res.data.orderNumber} placed! We'll contact you to confirm.`);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Checkout</h1>
          <p>Complete your order — we&apos;ll contact you to confirm payment & delivery</p>
        </div>
      </section>

      <div className="container checkout-grid">
        <div>
          {error && <div className="auth-error" role="alert" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
          <form id="checkout-form" className="contact-form" onSubmit={(e) => void handleSubmit(e)}>
            <div className="checkout-form-section">
              <h3>Contact Information</h3>
              <div className="form-group"><label>Full Name *</label><input type="text" name="name" required /></div>
              <div className="form-row">
                <div className="form-group"><label>Email *</label><input type="email" name="email" required /></div>
                <div className="form-group"><label>Phone *</label><input type="tel" name="phone" required placeholder="+266 ..." /></div>
              </div>
            </div>
            <div className="checkout-form-section">
              <h3>Delivery Address</h3>
              <div className="form-group"><label>Street Address *</label><input type="text" name="address" required /></div>
              <div className="form-row">
                <div className="form-group"><label>City *</label><input type="text" name="city" required defaultValue="Maseru" /></div>
                <div className="form-group"><label>Country</label><input type="text" name="country" defaultValue="Lesotho" readOnly /></div>
              </div>
            </div>
            <div className="checkout-form-section">
              <h3>Order Notes</h3>
              <div className="form-group"><label>Special Instructions</label><textarea name="notes" placeholder="Delivery preferences, product questions..." /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || items.length === 0}>
              {submitting ? 'Placing order…' : 'Place Order'}
            </button>
          </form>
        </div>
        <div>
          <div className="cart-summary" style={{ marginTop: 0, maxWidth: '100%' }}>
            <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-serif)' }}>Order Summary</h3>
            {items.map((item) => (
              <div key={item.id} className="cart-summary-row">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="cart-summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <p style={{ fontSize: 13, color: '#888', marginTop: 16, textAlign: 'center' }}>
            Payment collected on delivery or via arrangement.<br />
            Questions? Call <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
          </p>
        </div>
      </div>
    </>
  );
}

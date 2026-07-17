import { Link, useLocation } from 'react-router-dom';
import { useAIChat } from '../../context/AppContext';

export function MobileBottomNav() {
  const location = useLocation();
  const { toggleChat } = useAIChat();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        <Link to="/" className={isActive('/')}>
          <i className="fas fa-home" />Home
        </Link>
        <Link to="/products" className={isActive('/products')}>
          <i className="fas fa-store" />Shop
        </Link>
        <Link to="/cart" className={isActive('/cart')}>
          <i className="fas fa-shopping-bag" />Cart
        </Link>
        <button type="button" onClick={toggleChat} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', fontSize: 10, color: 'var(--charcoal-light)' }}>
          <i className="fas fa-robot" style={{ display: 'block', fontSize: 20, marginBottom: 2 }} />AI
        </button>
        <Link to="/contact" className={isActive('/contact')}>
          <i className="fas fa-envelope" />Contact
        </Link>
      </div>
    </nav>
  );
}

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAIChat } from '../../context/AppContext';

const SHOP_CATEGORIES = [
  { label: 'Skincare', path: '/products?category=Serums' },
  { label: 'Haircare', path: '/products?category=Hair%20Care' },
  { label: 'Soaps', path: '/products?category=Soaps' },
  { label: 'Body Care', path: '/products?category=Body%20Care' },
];

const COLLECTIONS = [
  { label: 'Bundles', path: '/products?category=Bundles' },
  { label: 'Diffusers', path: '/products?category=Diffusers' },
  { label: 'Perfumes', path: '/products?category=Perfumes' },
];

export function Header() {
  const { count } = useCart();
  const { openChat } = useAIChat();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="The Precious Creations" width={180} height={60} />
          </Link>

          <nav className="nav">
            <NavLink to="/" end>HOME</NavLink>
            <div className="nav-dropdown">
              <NavLink to="/products">SHOP ▾</NavLink>
              <div className="nav-dropdown-menu">
                {SHOP_CATEGORIES.map((cat) => (
                  <Link key={cat.label} to={cat.path}>{cat.label}</Link>
                ))}
              </div>
            </div>
            <div className="nav-dropdown">
              <NavLink to="/products">COLLECTIONS ▾</NavLink>
              <div className="nav-dropdown-menu">
                {COLLECTIONS.map((cat) => (
                  <Link key={cat.label} to={cat.path}>{cat.label}</Link>
                ))}
              </div>
            </div>
            <NavLink to="/about">ABOUT US</NavLink>
            <NavLink to="/blog">BLOG</NavLink>
            <NavLink to="/contact">CONTACT</NavLink>
          </nav>

          <div className="header-actions">
            <div className="header-icons">
              <button type="button" aria-label="Search" onClick={() => openChat('productFinder')}>
                <i className="fas fa-search" />
              </button>
              <Link to="/login" aria-label="Account">
                <i className="fas fa-user" />
              </Link>
              <Link to="/cart" aria-label="Cart">
                <i className="fas fa-shopping-cart" />
                <span className="cart-count">{count}</span>
              </Link>
            </div>
            <button type="button" className="mobile-menu-btn" aria-label="Menu" onClick={() => setMobileOpen(true)}>
              <i className="fas fa-bars" />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <button type="button" className="mobile-nav-close" onClick={() => setMobileOpen(false)}>
          <i className="fas fa-times" />
        </button>
        <NavLink to="/" onClick={() => setMobileOpen(false)}>Home</NavLink>
        <NavLink to="/products" onClick={() => setMobileOpen(false)}>Shop</NavLink>
        <NavLink to="/about" onClick={() => setMobileOpen(false)}>About Us</NavLink>
        <NavLink to="/blog" onClick={() => setMobileOpen(false)}>Blog</NavLink>
        <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</NavLink>
        <NavLink to="/login" onClick={() => setMobileOpen(false)}>Admin Login</NavLink>
        <NavLink to="/admin" onClick={() => setMobileOpen(false)}>AI Dashboard</NavLink>
        <NavLink to="/cart" onClick={() => setMobileOpen(false)}>Cart</NavLink>
      </div>
    </>
  );
}

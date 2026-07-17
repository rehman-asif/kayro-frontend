import { Link } from 'react-router-dom';

export function TopBar() {
  return (
    <div className="top-bar">
      <span className="top-bar-ticker">
        🌱 NATURALLY MADE. CONSCIOUSLY CRAFTED. SERIOUSLY YOU... 🌱
      </span>
      <div className="top-bar-links">
        <Link to="/cart">Track Order</Link>
        <span className="top-bar-separator">|</span>
        <Link to="/blog">FAQ</Link>
        <span className="top-bar-separator">|</span>
        <Link to="/contact">Contact Us</Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { BRAND } from '../../data/brand';

export function TopBar() {
  return (
    <div className="top-bar">
      <span className="top-bar-ticker">
        {BRAND.ticker}
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

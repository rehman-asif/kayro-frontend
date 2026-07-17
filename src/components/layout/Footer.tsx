import { Link } from 'react-router-dom';
import { BRAND } from '../../data/brand';
import { SocialLinks } from '../ui/SocialLinks';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logo.png" alt={BRAND.name} width={160} height={52} />
            <p>
              Premium skincare and wellness brand based in Maseru, Lesotho. Nourishing skin
              from the inside out with nature&apos;s finest botanicals.
            </p>
            <SocialLinks />
          </div>
          <div>
            <h4>Shop</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=Serums">Serums</Link></li>
              <li><Link to="/products?category=Soaps">Soaps</Link></li>
              <li><Link to="/products?category=Hair%20Care">Hair Care</Link></li>
              <li><Link to="/products?category=Body%20Care">Body Care</Link></li>
              <li><Link to="/products?category=Bundles">Bundles</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/about#mission">Our Mission</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/admin">AI Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="footer-links">
              <li>NRH Mall, Room 13, Top Floor</li>
              <li>Kingsway, Maseru, Lesotho</li>
              <li><a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a></li>
              <li><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 {BRAND.name}. All rights reserved.</span>
          <span>Handcrafted in Maseru, Lesotho</span>
        </div>
      </div>
    </footer>
  );
}

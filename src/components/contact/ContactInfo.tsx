import { BRAND } from '../../data/brand';
import { SocialLinks } from '../ui/SocialLinks';
import { useAIChat } from '../../context/AppContext';

export function ContactInfo() {
  const { openChat } = useAIChat();

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Get In Touch</h2>
      <div className="contact-info-item">
        <div className="contact-info-icon"><i className="fas fa-map-marker-alt" /></div>
        <div>
          <strong>Location</strong>
          <p>NRH Mall, Room 13, Top Floor<br />Kingsway, Maseru, Lesotho</p>
        </div>
      </div>
      <div className="contact-info-item">
        <div className="contact-info-icon"><i className="fas fa-phone" /></div>
        <div>
          <strong>Phone</strong>
          <p><a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a></p>
        </div>
      </div>
      <div className="contact-info-item">
        <div className="contact-info-icon"><i className="fas fa-envelope" /></div>
        <div>
          <strong>Email</strong>
          <p><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
        </div>
      </div>
      <div className="contact-info-item">
        <div className="contact-info-icon"><i className="fas fa-share-alt" /></div>
        <div>
          <strong>Follow Us</strong>
          <SocialLinks className="footer-social" />
        </div>
      </div>
      <div style={{ marginTop: 32 }}>
        <button type="button" className="btn btn-peach" onClick={() => openChat('customer')}>
          <i className="fas fa-robot" /> Chat with Customer AI
        </button>
      </div>
    </div>
  );
}

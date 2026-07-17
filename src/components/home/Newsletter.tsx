import { useToast } from '../../context/AppContext';
import { saveLocally } from '../../services/storageService';

export function Newsletter() {
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    if (email) {
      saveLocally('newsletter_subscribers', { email });
      showToast('Thank you for subscribing!');
      form.reset();
    }
  };

  return (
    <section className="newsletter">
      <div className="container">
        <h2>Join Our Community</h2>
        <p>Subscribe for skincare tips, new product launches, and exclusive offers</p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Enter your email" required />
          <button type="submit" className="btn btn-primary">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

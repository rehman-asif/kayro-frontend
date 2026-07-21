import { useState } from 'react';
import { useToast } from '../../context/AppContext';
import { subscribeEmail } from '../../services/crmService';

export function Newsletter() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    if (!email) return;
    setLoading(true);
    try {
      await subscribeEmail(email);
      showToast('Thank you for subscribing!');
      form.reset();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not subscribe. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter">
      <div className="container">
        <h2>Join Our Community</h2>
        <p>Subscribe for skincare tips, new product launches, and exclusive offers</p>
        <form className="newsletter-form" onSubmit={(e) => void handleSubmit(e)}>
          <input type="email" name="email" placeholder="Enter your email" required />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}

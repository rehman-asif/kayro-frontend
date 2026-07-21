import { useState } from 'react';
import { useToast } from '../../context/AppContext';
import { submitContactLead } from '../../services/crmService';

export function ContactForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setLoading(true);
    try {
      await submitContactLead({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: `${data.subject || 'General'}: ${data.message}`,
      });
      showToast("Message sent! We'll get back to you soon.");
      form.reset();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={(e) => void handleSubmit(e)}>
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input type="text" id="name" name="name" required />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input type="tel" id="phone" name="phone" />
      </div>
      <div className="form-group">
        <label htmlFor="subject">Subject</label>
        <select id="subject" name="subject" defaultValue="General Inquiry">
          <option>General Inquiry</option>
          <option>Product Question</option>
          <option>Order Status</option>
          <option>Wholesale</option>
          <option>Other</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" required placeholder="How can we help you?" />
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

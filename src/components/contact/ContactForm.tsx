import { useToast } from '../../context/AppContext';
import { saveLocally } from '../../services/storageService';
import type { ContactFormData } from '../../types';

export function ContactForm() {
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as ContactFormData;
    saveLocally('contact_messages', data as unknown as Record<string, unknown>);
    showToast("Message sent! We'll get back to you soon.");
    e.currentTarget.reset();
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
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
      <button type="submit" className="btn btn-primary btn-block">Send Message</button>
    </form>
  );
}

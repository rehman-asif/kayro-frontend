import { TESTIMONIALS } from '../../data/brand';
import { SectionHeader } from '../ui/SectionHeader';

export function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader tag="Testimonials" title="Real Words, Real Results" />
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p>&quot;{t.text}&quot;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initial}</div>
                <div>
                  <strong>{t.name}</strong>
                  <br />
                  <small>{t.location}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

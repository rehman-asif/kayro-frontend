import { WHY_CHOOSE_US } from '../../data/brand';
import { SectionHeader } from '../ui/SectionHeader';

export function WhyChooseGrid() {
  return (
    <section className="section" style={{ background: 'var(--white)' }}>
      <div className="container">
        <SectionHeader tag="Why Choose Us" title="The Precious Creations Difference" />
        <div className="why-grid">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.title} className="why-item">
              <div className="why-icon"><i className={item.icon} /></div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

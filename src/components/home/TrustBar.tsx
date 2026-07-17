import { TRUST_ITEMS } from '../../data/brand';

export function TrustBar() {
  return (
    <section className="trust-bar trust-bar-landing">
      <div className="container">
        <div className="trust-bar-grid">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="trust-item">
              <span className="trust-item-icon">
                <i className={item.icon} />
              </span>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

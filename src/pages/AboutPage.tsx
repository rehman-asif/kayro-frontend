import { BRAND } from '../data/brand';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PageHero } from '../components/ui/PageHero';
import { SplitSection } from '../components/ui/SplitSection';
import { WhyChooseGrid } from '../components/home/WhyChooseGrid';

export function AboutPage() {
  return (
    <>
      <PageHero
        title={`About ${BRAND.name}`}
        description="Premium Skincare and Wellness — Handcrafted in Maseru, Lesotho"
      />

      <SplitSection
        tag="Our Story"
        title="Healthy Skin Is a Right, Not a Luxury"
        imageSrc="/products/soap-diffuser-collection.jpg"
        imageAlt="The Precious Creations artisan products"
      >
        <p>
          {BRAND.name} is a premium skincare and wellness brand proudly based in Maseru, Lesotho.
          By blending nature&apos;s most powerful botanical ingredients with science-backed
          formulations, we create effective, luxurious products designed to nourish the skin,
          hair, and body from the inside out.
        </p>
        <p>
          Every product is carefully handcrafted to deliver visible results while honouring
          sustainability, transparency, and inclusivity. We believe in beauty that is honest,
          effective, and accessible to everyone.
        </p>
      </SplitSection>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="quote-block" style={{ maxWidth: 700, margin: '0 auto' }}>
            &quot;Healthy skin is a reflection of overall wellness.&quot;
          </div>
          <p style={{ color: 'var(--charcoal-light)', fontStyle: 'italic' }}>— Our Philosophy</p>
        </div>
      </section>

      <section className="section" id="mission">
        <div className="container">
          <div className="values-grid">
            <div className="value-card">
              <h3>Our Mission</h3>
              <p>
                To empower individuals through healthy skin by providing effective, accessible,
                and naturally inspired products. We aim to promote self-confidence, wellbeing,
                and conscious beauty for every skin type.
              </p>
            </div>
            <div className="value-card">
              <h3>Our Vision</h3>
              <p>
                To lead a movement where beauty is defined by skin health, confidence, and
                sustainability, creating a future where personalized care and mindful
                formulations support healthy aging and natural radiance.
              </p>
            </div>
            <div className="value-card">
              <h3>Our Philosophy</h3>
              <p>
                Healthy skin is a reflection of overall wellness. We blend nature&apos;s finest
                botanicals with science-backed formulations to create products that nourish
                from the inside out.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <SectionHeader tag="Artisan Craftsmanship" title="A Legacy of Artisan Craftsmanship" />
          <p style={{
            maxWidth: 800, margin: '0 auto', textAlign: 'center',
            color: 'var(--charcoal-light)', fontSize: 17, lineHeight: 1.8,
          }}>
            Every creation at The Precious Creations is thoughtfully handcrafted in Maseru,
            where time-honoured artistry meets modern skincare science. From our signature soaps
            to our nourishing serums and botanical oils, each formulation is meticulously
            prepared with exceptional care, precision, and attention to detail.
          </p>
        </div>
      </section>

      <WhyChooseGrid />
    </>
  );
}

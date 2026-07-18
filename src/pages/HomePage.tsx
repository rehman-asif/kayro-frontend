import { Link } from 'react-router-dom';
import { BRAND } from '../data/brand';
import { getFeaturedProducts } from '../data/products';
import { BLOG_POSTS } from '../data/blogPosts';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProductGrid } from '../components/products/ProductGrid';
import { AISection } from '../components/ai/AISection';
import { Hero } from '../components/home/Hero';
import { TrustBar } from '../components/home/TrustBar';
import { ShopByCategory } from '../components/home/ShopByCategory';
import { WhyChooseGrid } from '../components/home/WhyChooseGrid';
import { Testimonials } from '../components/home/Testimonials';
import { Newsletter } from '../components/home/Newsletter';
import { SplitSection } from '../components/ui/SplitSection';
import { BlogGrid } from '../components/blog/BlogGrid';
import { useAIChat } from '../context/AppContext';

export function HomePage() {
  const { openChat } = useAIChat();
  const featured = getFeaturedProducts();

  return (
    <>
      <Hero />
      <TrustBar />
      <ShopByCategory />

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <SectionHeader
            tag="Best Sellers"
            title="Featured Products"
            description="Our most loved handcrafted creations"
          />
          <ProductGrid products={featured} />
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/products" className="btn btn-forest">View Full Collection</Link>
          </div>
        </div>
      </section>

      <SplitSection
        tag="Our Story"
        title="Healthy Skin Is a Right, Not a Luxury"
        imageSrc="/products/soap-diffuser-collection.jpg"
        imageAlt="The Precious Creations artisan collection"
        action={<Link to="/about" className="btn btn-forest">Learn More</Link>}
      >
        <p>
          {BRAND.name} is a premium skincare and wellness brand proudly based in Maseru, Lesotho.
          By blending nature&apos;s most powerful botanical ingredients with science-backed
          formulations, we create effective, luxurious products.
        </p>
        <p>
          Every product is carefully handcrafted to deliver visible results while honouring
          sustainability, transparency, and inclusivity.
        </p>
        <div className="quote-block">&quot;Healthy skin is a reflection of overall wellness.&quot;</div>
      </SplitSection>

      <section className="section" style={{ background: 'var(--cream)' }}>
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
          <p style={{
            maxWidth: 800, margin: '16px auto 0', textAlign: 'center',
            color: 'var(--charcoal-light)', fontSize: 17, lineHeight: 1.8,
          }}>
            We believe true luxury is never rushed. Every ingredient is intentionally selected,
            every formulation carefully perfected, and every product is created to deliver an
            elevated skincare experience that embodies purity, elegance, and uncompromising quality.
          </p>
        </div>
      </section>

      <WhyChooseGrid />

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <SectionHeader
            tag="Skincare Education"
            title="Knowledge Is Beautiful"
            description="Healthy skin begins with knowledge. Explore our educational content."
          />
          <BlogGrid posts={BLOG_POSTS.slice(0, 3)} />
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/blog" className="btn btn-outline">View All Articles</Link>
            <button
              type="button"
              className="btn btn-peach"
              style={{ marginLeft: 12 }}
              onClick={() => openChat('beauty')}
            >
              Ask Beauty AI
            </button>
          </div>
        </div>
      </section>

      <Testimonials />
      <AISection />
      <Newsletter />
    </>
  );
}

import { BLOG_POSTS } from '../data/blogPosts';
import { PageHero } from '../components/ui/PageHero';
import { BlogGrid } from '../components/blog/BlogGrid';
import { useAIChat } from '../context/AppContext';

export function BlogPage() {
  const { openChat, sendMessage } = useAIChat();

  const handleLearnMore = async (title: string) => {
    openChat('beauty');
    await sendMessage(`Tell me about: ${title}`);
  };

  return (
    <>
      <PageHero
        title="Skincare Education"
        description="Healthy skin begins with knowledge. Explore our educational content."
      />

      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button type="button" className="btn btn-peach" onClick={() => openChat('blogWriter')}>
              <i className="fas fa-robot" /> Ask Blog Writer AI
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginLeft: 12 }}
              onClick={() => openChat('beauty')}
            >
              <i className="fas fa-sparkles" /> Ask Beauty AI
            </button>
          </div>
          <BlogGrid posts={BLOG_POSTS} onLearnMore={handleLearnMore} />
        </div>
      </section>
    </>
  );
}

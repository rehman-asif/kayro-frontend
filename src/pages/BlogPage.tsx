import { useEffect, useState } from 'react';
import { PageHero } from '../components/ui/PageHero';
import { BlogGrid } from '../components/blog/BlogGrid';
import { useAIChat } from '../context/AppContext';
import { fetchBlogPosts } from '../services/blogService';
import type { BlogPost } from '../types';

export function BlogPage() {
  const { openChat, sendMessage } = useAIChat();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    void fetchBlogPosts().then(setPosts);
  }, []);

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
          <BlogGrid posts={posts} onLearnMore={handleLearnMore} />
        </div>
      </section>
    </>
  );
}

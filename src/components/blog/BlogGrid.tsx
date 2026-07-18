import { Link } from 'react-router-dom';
import type { BlogPost } from '../../types';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../data/products';
import { OptimizedImage } from '../ui/OptimizedImage';

interface BlogCardProps {
  post: BlogPost;
  onLearnMore?: (title: string) => void;
}

export function BlogCard({ post, onLearnMore }: BlogCardProps) {
  const imageSrc =
    post.placeholder || !post.imageUrl
      ? PRODUCT_PLACEHOLDER_IMAGE
      : post.imageUrl;

  return (
    <div className="blog-card">
      <div className="blog-card-image">
        <OptimizedImage
          src={imageSrc}
          alt={post.title}
          sizes="(max-width: 768px) 100vw, 360px"
          fallback={PRODUCT_PLACEHOLDER_IMAGE}
        />
      </div>
      <div className="blog-card-body">
        <div className="blog-meta">
          {post.category}
          {post.date && (
            <> · {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          )}
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        {onLearnMore ? (
          <button type="button" className="btn btn-sm btn-outline" onClick={() => onLearnMore(post.title)}>
            Learn More with AI
          </button>
        ) : (
          <Link to="/blog" className="btn btn-sm btn-outline">Read More</Link>
        )}
      </div>
    </div>
  );
}

interface BlogGridProps {
  posts: BlogPost[];
  onLearnMore?: (title: string) => void;
}

export function BlogGrid({ posts, onLearnMore }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--charcoal-light)' }}>
        Education articles coming soon.
      </p>
    );
  }

  return (
    <div className="blog-grid">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} onLearnMore={onLearnMore} />
      ))}
    </div>
  );
}

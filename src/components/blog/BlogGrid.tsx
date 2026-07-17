import { Link } from 'react-router-dom';
import type { BlogPost } from '../../types';
import { getBlogImage } from '../../data/images';
import { OptimizedImage } from '../ui/OptimizedImage';

interface BlogCardProps {
  post: BlogPost;
  onLearnMore?: (title: string) => void;
}

export function BlogCard({ post, onLearnMore }: BlogCardProps) {
  const imageSrc = getBlogImage(post.id, post.category);

  return (
    <div className="blog-card">
      <div className="blog-card-image">
        <OptimizedImage
          src={imageSrc}
          alt={post.title}
          sizes="(max-width: 768px) 100vw, 360px"
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
  return (
    <div className="blog-grid">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} onLearnMore={onLearnMore} />
      ))}
    </div>
  );
}

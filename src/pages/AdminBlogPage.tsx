import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import type { BlogPost } from '../types';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../data/products';
import { uploadToCloudinary } from '../services/cloudinaryService';
import {
  createBlogPostApi,
  deleteBlogPostApi,
  fetchBlogPosts,
  updateBlogPostApi,
} from '../services/blogService';

interface EditDraft {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  placeholder: boolean;
  previewUrl: string;
}

export function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newCategory, setNewCategory] = useState('Skincare');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await fetchBlogPosts());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);


  const startEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setDraft({
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      date: p.date || new Date().toISOString().slice(0, 10),
      imageUrl: p.imageUrl || PRODUCT_PLACEHOLDER_IMAGE,
      placeholder: Boolean(p.placeholder ?? true),
      previewUrl: p.placeholder || !p.imageUrl ? PRODUCT_PLACEHOLDER_IMAGE : p.imageUrl,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
    setUploading(false);
  };

  const handleImagePick = async (file: File | undefined) => {
    if (!file || !draft) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    setError('');
    setUploading(true);
    setUploadProgress(0);
    setDraft({ ...draft, previewUrl: URL.createObjectURL(file) });
    try {
      const uploaded = await uploadToCloudinary(file, setUploadProgress);
      setDraft((prev) =>
        prev
          ? {
              ...prev,
              imageUrl: uploaded.secureUrl,
              placeholder: false,
              previewUrl: uploaded.secureUrl,
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId || !draft) return;
    if (uploading) {
      setError('Wait for the image upload to finish.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateBlogPostApi(editingId, {
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim(),
        category: draft.category.trim(),
        date: draft.date,
        imageUrl: draft.imageUrl,
        placeholder: draft.placeholder,
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete “${title}”?`)) return;
    try {
      await deleteBlogPostApi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExcerpt.trim()) return;
    setAdding(true);
    setError('');
    try {
      await createBlogPostApi({
        title: newTitle.trim(),
        excerpt: newExcerpt.trim(),
        category: newCategory.trim() || 'Skincare',
        imageUrl: PRODUCT_PLACEHOLDER_IMAGE,
        placeholder: true,
        sortOrder: posts.length + 1,
      });
      setNewTitle('');
      setNewExcerpt('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="db-root">
      <AdminSidebar active="blog" />

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-topbar-title">Skincare Education</h1>
            <p className="db-topbar-date">Edit articles, change images, or delete posts</p>
          </div>
        </header>

        <div className="db-content">
          {error && (
            <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <section className="db-widget" style={{ marginBottom: 20 }}>
            <div className="db-widget-header">
              <h2 className="db-widget-title">Add article</h2>
            </div>
            <form className="auth-form" onSubmit={(e) => void handleAdd(e)} style={{ maxWidth: '100%' }}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="new-title">Title</label>
                <input id="new-title" className="auth-input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="new-excerpt">Excerpt</label>
                <textarea id="new-excerpt" className="auth-input" rows={2} value={newExcerpt} onChange={(e) => setNewExcerpt(e.target.value)} />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="new-cat">Category</label>
                <input id="new-cat" className="auth-input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={adding || !newTitle.trim() || !newExcerpt.trim()}>
                {adding ? 'Adding...' : 'Add article'}
              </button>
            </form>
          </section>

          <section className="db-widget">
            <div className="db-widget-header">
              <h2 className="db-widget-title">Articles ({posts.length})</h2>
              <button type="button" className="db-widget-action" onClick={() => void load()} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <p className="db-welcome-sub">Loading...</p>
            ) : posts.length === 0 ? (
              <p className="db-welcome-sub">No articles yet.</p>
            ) : (
              <div className="db-stock-indicator" style={{ gap: 14 }}>
                {posts.map((p) => (
                  <ArticleRow
                    key={p.id}
                    post={p}
                    editing={editingId === p.id}
                    draft={editingId === p.id ? draft : null}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    saving={saving}
                    onStartEdit={() => startEdit(p)}
                    onCancel={cancelEdit}
                    onSave={(e) => void saveEdit(e)}
                    onDelete={() => void handleDelete(p.id, p.title)}
                    onDraftChange={setDraft}
                    onImagePick={(file) => void handleImagePick(file)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function ArticleRow({
  post,
  editing,
  draft,
  uploading,
  uploadProgress,
  saving,
  onStartEdit,
  onCancel,
  onSave,
  onDelete,
  onDraftChange,
  onImagePick,
}: {
  post: BlogPost;
  editing: boolean;
  draft: EditDraft | null;
  uploading: boolean;
  uploadProgress: number;
  saving: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (e: FormEvent) => void;
  onDelete: () => void;
  onDraftChange: (d: EditDraft) => void;
  onImagePick: (file: File | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (editing && draft) {
    return (
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 }}>
        <form onSubmit={onSave} className="auth-form" style={{ maxWidth: '100%' }}>
          <div className="auth-field">
            <span className="auth-label">Article image</span>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <img
                src={draft.previewUrl}
                alt={draft.title}
                style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 10 }}
              />
              <div>
                <input
                  ref={inputRef}
                  id={`blog-img-${post.id}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="pp-file-input"
                  onChange={(e) => {
                    onImagePick(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <label htmlFor={`blog-img-${post.id}`} className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-camera" /> {uploading ? `Uploading ${uploadProgress}%` : 'Change image'}
                </label>
              </div>
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">Title</label>
            <input className="auth-input" value={draft.title} onChange={(e) => onDraftChange({ ...draft, title: e.target.value })} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Excerpt</label>
            <textarea className="auth-input" rows={3} value={draft.excerpt} onChange={(e) => onDraftChange({ ...draft, excerpt: e.target.value })} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Category</label>
            <input className="auth-input" value={draft.category} onChange={(e) => onDraftChange({ ...draft, category: e.target.value })} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Date</label>
            <input className="auth-input" type="date" value={draft.date} onChange={(e) => onDraftChange({ ...draft, date: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <img
          src={post.placeholder || !post.imageUrl ? PRODUCT_PLACEHOLDER_IMAGE : post.imageUrl}
          alt={post.title}
          style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 8 }}
        />
        <div>
          <p className="db-stock-name" style={{ margin: 0 }}>{post.title}</p>
          <p className="db-welcome-sub" style={{ margin: '4px 0 0' }}>
            {post.category}
            {post.date ? ` · ${post.date}` : ''}
            {post.placeholder ? ' · Placeholder photo' : ''}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-sm btn-outline" onClick={onStartEdit}>
          <i className="fas fa-edit" /> Edit / Image
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.4)' }}
          onClick={onDelete}
        >
          <i className="fas fa-trash" /> Delete
        </button>
      </div>
    </div>
  );
}

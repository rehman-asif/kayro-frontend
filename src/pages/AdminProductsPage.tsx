import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AuthContext';
import type { Product, ProductCategory } from '../types';
import { CATEGORIES, formatPrice, PRODUCT_PLACEHOLDER_IMAGE } from '../data/products';
import { getProductImage } from '../data/images';
import { uploadToCloudinary } from '../services/cloudinaryService';
import {
  deleteProductFromApi,
  syncPublishedProductsFromApi,
  updateProductOnApi,
} from '../services/productService';

const EDITABLE_CATEGORIES = CATEGORIES.filter((c): c is ProductCategory => c !== 'All');

interface EditDraft {
  name: string;
  price: string;
  category: ProductCategory;
  featured: boolean;
  description: string;
  imageUrl: string;
  placeholder: boolean;
  previewUrl: string;
}

export function AdminProductsPage() {
  const { admin, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await syncPublishedProductsFromApi();
      setProducts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setDraft({
      name: p.name,
      price: String(p.price),
      category: p.category,
      featured: Boolean(p.featured),
      description: p.description || '',
      imageUrl: p.imageUrl || PRODUCT_PLACEHOLDER_IMAGE,
      placeholder: Boolean(p.placeholder),
      previewUrl: getProductImage(p),
    });
    setUploadProgress(0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
    setUploading(false);
    setUploadProgress(0);
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
    const localPreview = URL.createObjectURL(file);
    setDraft({ ...draft, previewUrl: localPreview });
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
    const price = Number(draft.price);
    if (!draft.name.trim() || Number.isNaN(price) || price < 0) {
      setError('Enter a valid name and price.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateProductOnApi(editingId, {
        name: draft.name.trim(),
        price,
        category: draft.category,
        featured: draft.featured,
        description: draft.description.trim(),
        imageUrl: draft.imageUrl,
        placeholder: draft.placeholder,
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteProductFromApi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  return (
    <div className="db-root">
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <img src="/logo.png" alt="TPC" className="db-logo" />
          <h2 className="db-sidebar-title">Admin Dashboard</h2>
          <p className="db-sidebar-sub">The Precious Creations</p>
        </div>
        <nav className="db-nav">
          <Link to="/admin" className="db-nav-item"><i className="fas fa-chart-line" /> Dashboard</Link>
          <Link to="/admin/products" className="db-nav-item active"><i className="fas fa-boxes" /> Manage Products</Link>
          <Link to="/admin/publish" className="db-nav-item"><i className="fas fa-plus-circle" /> Publish Product</Link>
          <Link to="/admin/ai" className="db-nav-item"><i className="fas fa-robot" /> AI Center</Link>
          <Link to="/admin/hubspot" className="db-nav-item"><i className="fas fa-address-book" /> HubSpot CRM</Link>
        </nav>
        <div className="db-sidebar-footer">
          {admin && (
            <div className="db-admin-info">
              <p className="db-admin-name">{admin.name}</p>
              <p className="db-admin-email">{admin.email}</p>
            </div>
          )}
          <button type="button" className="db-logout-btn" onClick={() => void handleLogout()} disabled={loggingOut}>
            <i className="fas fa-sign-out-alt" />
            {loggingOut ? 'Signing out...' : 'Logout'}
          </button>
          <Link to="/" className="db-back-link" style={{ marginTop: 10 }}>
            <i className="fas fa-arrow-left" /> Back to Website
          </Link>
        </div>
      </aside>

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-topbar-title">Manage Products</h1>
            <p className="db-topbar-date">Edit image, price, details, or delete products</p>
          </div>
          <div className="db-actions">
            <Link to="/admin/publish" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
              <i className="fas fa-plus" /> Publish New
            </Link>
          </div>
        </header>

        <div className="db-content">
          {error && (
            <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <section className="db-widget">
            <div className="db-widget-header">
              <h2 className="db-widget-title">Product catalog ({products.length})</h2>
              <button type="button" className="db-widget-action" onClick={() => void load()} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <p className="db-welcome-sub">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="db-welcome-sub">
                No products yet. Use <Link to="/admin/publish">Publish Product</Link> to add items with photos.
              </p>
            ) : (
              <div className="db-stock-indicator" style={{ gap: 14 }}>
                {products.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    {editingId === p.id && draft ? (
                      <form onSubmit={(e) => void saveEdit(e)} className="auth-form" style={{ maxWidth: '100%' }}>
                        <div className="auth-field">
                          <span className="auth-label">Product image</span>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <img
                              src={draft.previewUrl}
                              alt={draft.name}
                              style={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.12)',
                                background: '#111',
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <input
                                ref={fileInputRef}
                                id={`image-${p.id}`}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                className="pp-file-input"
                                onChange={(e) => {
                                  void handleImagePick(e.target.files?.[0]);
                                  e.target.value = '';
                                }}
                              />
                              <label htmlFor={`image-${p.id}`} className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                                <i className="fas fa-camera" /> {uploading ? `Uploading ${uploadProgress}%` : 'Change image'}
                              </label>
                              <p className="db-welcome-sub" style={{ marginTop: 8 }}>
                                {draft.placeholder
                                  ? 'Still using a placeholder — upload the correct photo.'
                                  : 'New photo uploaded. Click Save changes to apply.'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="auth-field">
                          <label className="auth-label" htmlFor={`name-${p.id}`}>Name</label>
                          <input
                            id={`name-${p.id}`}
                            className="auth-input"
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          />
                        </div>
                        <div className="auth-field">
                          <label className="auth-label" htmlFor={`price-${p.id}`}>Price (M)</label>
                          <input
                            id={`price-${p.id}`}
                            className="auth-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft.price}
                            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                          />
                        </div>
                        <div className="auth-field">
                          <label className="auth-label" htmlFor={`cat-${p.id}`}>Category</label>
                          <select
                            id={`cat-${p.id}`}
                            className="auth-input"
                            value={draft.category}
                            onChange={(e) => setDraft({ ...draft, category: e.target.value as ProductCategory })}
                          >
                            {EDITABLE_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="auth-field">
                          <label className="auth-label" htmlFor={`desc-${p.id}`}>Description</label>
                          <textarea
                            id={`desc-${p.id}`}
                            className="auth-input"
                            rows={3}
                            value={draft.description}
                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                          />
                        </div>
                        <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#D1D5DB', fontSize: 13 }}>
                          <input
                            type="checkbox"
                            checked={draft.featured}
                            onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                          />
                          Best seller / featured
                        </label>
                        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                            {saving ? 'Saving...' : 'Save changes'}
                          </button>
                          <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                          <img
                            src={getProductImage(p)}
                            alt={p.name}
                            style={{
                              width: 56,
                              height: 56,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          />
                          <div className="db-stock-meta" style={{ flex: 1 }}>
                            <span className="db-stock-name">
                              {p.name}
                              {p.featured ? ' · Best seller' : ''}
                              {p.placeholder ? ' · Placeholder photo' : ''}
                            </span>
                            <span className="db-stock-count" style={{ color: '#A8A8C0' }}>{formatPrice(p.price)}</span>
                          </div>
                        </div>
                        <p className="db-welcome-sub" style={{ margin: '0 0 10px' }}>
                          {p.category} · ID: {p.id}
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-sm btn-outline" onClick={() => startEdit(p)}>
                            <i className="fas fa-edit" /> Edit / Image / Price
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.4)' }}
                            onClick={() => void handleDelete(p.id, p.name)}
                          >
                            <i className="fas fa-trash" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

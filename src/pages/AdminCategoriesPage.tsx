import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../data/products';
import { uploadToCloudinary } from '../services/cloudinaryService';
import {
  createCategoryApi,
  deleteCategoryApi,
  fetchCategories,
  updateCategoryApi,
  type StoreCategory,
} from '../services/categoryService';

interface EditDraft {
  label: string;
  slug: string;
  imageUrl: string;
  placeholder: boolean;
  previewUrl: string;
  sortOrder: string;
}

export function AdminCategoriesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setCategories(await fetchCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);


  const startEdit = (c: StoreCategory) => {
    setEditingId(c.id);
    setDraft({
      label: c.label,
      slug: c.slug,
      imageUrl: c.imageUrl || PRODUCT_PLACEHOLDER_IMAGE,
      placeholder: Boolean(c.placeholder),
      previewUrl: c.placeholder ? PRODUCT_PLACEHOLDER_IMAGE : c.imageUrl,
      sortOrder: String(c.sortOrder ?? 0),
    });
    setUploadProgress(0);
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
    if (!draft.label.trim() || !draft.slug.trim()) {
      setError('Label and slug are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateCategoryApi(editingId, {
        label: draft.label.trim(),
        slug: draft.slug.trim(),
        imageUrl: draft.imageUrl,
        placeholder: draft.placeholder,
        sortOrder: Number(draft.sortOrder) || 0,
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Delete category “${label}”?`)) return;
    setError('');
    try {
      await deleteCategoryApi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    setAdding(true);
    setError('');
    try {
      await createCategoryApi({
        label,
        slug: label,
        imageUrl: PRODUCT_PLACEHOLDER_IMAGE,
        placeholder: true,
        sortOrder: categories.length + 1,
      });
      setNewLabel('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="db-root">
      <AdminSidebar active="categories" />

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-topbar-title">Manage Categories</h1>
            <p className="db-topbar-date">Edit Signature Range cards — image, label, or delete</p>
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
              <h2 className="db-widget-title">Add category</h2>
            </div>
            <form className="hs-search-form" onSubmit={(e) => void handleAdd(e)}>
              <div className="hs-search-row">
                <input
                  className="auth-input"
                  placeholder="e.g. Serums"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={adding || !newLabel.trim()}>
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </section>

          <section className="db-widget">
            <div className="db-widget-header">
              <h2 className="db-widget-title">Categories ({categories.length})</h2>
              <button type="button" className="db-widget-action" onClick={() => void load()} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <p className="db-welcome-sub">Loading...</p>
            ) : categories.length === 0 ? (
              <p className="db-welcome-sub">No categories yet. Add one above — it will show a placeholder until you upload a photo.</p>
            ) : (
              <div className="db-stock-indicator" style={{ gap: 14 }}>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 }}
                  >
                    {editingId === c.id && draft ? (
                      <form onSubmit={(e) => void saveEdit(e)} className="auth-form" style={{ maxWidth: '100%' }}>
                        <div className="auth-field">
                          <span className="auth-label">Category image</span>
                          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <img
                              src={draft.previewUrl}
                              alt={draft.label}
                              style={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.12)',
                              }}
                            />
                            <div>
                              <input
                                ref={fileInputRef}
                                id={`cat-img-${c.id}`}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                className="pp-file-input"
                                onChange={(e) => {
                                  void handleImagePick(e.target.files?.[0]);
                                  e.target.value = '';
                                }}
                              />
                              <label htmlFor={`cat-img-${c.id}`} className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                                <i className="fas fa-camera" /> {uploading ? `Uploading ${uploadProgress}%` : 'Change image'}
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="auth-field">
                          <label className="auth-label" htmlFor={`label-${c.id}`}>Label</label>
                          <input
                            id={`label-${c.id}`}
                            className="auth-input"
                            value={draft.label}
                            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                          />
                        </div>
                        <div className="auth-field">
                          <label className="auth-label" htmlFor={`slug-${c.id}`}>Product filter slug</label>
                          <input
                            id={`slug-${c.id}`}
                            className="auth-input"
                            value={draft.slug}
                            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                          />
                        </div>
                        <div className="auth-field">
                          <label className="auth-label" htmlFor={`order-${c.id}`}>Sort order</label>
                          <input
                            id={`order-${c.id}`}
                            className="auth-input"
                            type="number"
                            value={draft.sortOrder}
                            onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
                          />
                        </div>
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
                            src={c.placeholder ? PRODUCT_PLACEHOLDER_IMAGE : c.imageUrl}
                            alt={c.label}
                            style={{
                              width: 64,
                              height: 64,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          />
                          <div>
                            <p className="db-stock-name" style={{ margin: 0 }}>{c.label}</p>
                            <p className="db-welcome-sub" style={{ margin: '4px 0 0' }}>
                              Slug: {c.slug}
                              {c.placeholder ? ' · Placeholder photo' : ''}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-sm btn-outline" onClick={() => startEdit(c)}>
                            <i className="fas fa-edit" /> Edit / Image
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.4)' }}
                            onClick={() => void handleDelete(c.id, c.label)}
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

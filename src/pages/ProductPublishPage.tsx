import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ProductCategory, PublishedProduct, AIMarketingContent } from '../types';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { savePublishedProduct, generateProductId } from '../services/productService';
import { getOpenAIKey } from '../services/storageService';

// ─── Types ───────────────────────────────────────────────
interface FormData {
  name: string;
  category: ProductCategory;
  price: string;
  ingredients: string;
  benefits: string;
  featured: boolean;
}

const CATEGORIES: ProductCategory[] = [
  'Serums', 'Soaps', 'Hair Care', 'Body Care', 'Bundles', 'Diffusers', 'Perfumes',
];

const STEPS = [
  { n: 1, label: 'Upload Image',    icon: '🖼️' },
  { n: 2, label: 'Product Details', icon: '📋' },
  { n: 3, label: 'AI Marketing',    icon: '🤖' },
  { n: 4, label: 'Review & Edit',   icon: '✏️' },
  { n: 5, label: 'Publish',         icon: '🚀' },
];

const MARKETING_FIELDS: { key: keyof AIMarketingContent; label: string; icon: string; rows: number }[] = [
  { key: 'productDescription',  label: 'Product Description',        icon: '📝', rows: 5 },
  { key: 'instagramCaption',    label: 'Instagram Caption',           icon: '📸', rows: 5 },
  { key: 'tiktokCaption',       label: 'TikTok Caption',              icon: '🎵', rows: 5 },
  { key: 'facebookCaption',     label: 'Facebook Caption',            icon: '👥', rows: 5 },
  { key: 'hashtags',            label: 'Hashtags',                    icon: '#️⃣', rows: 5 },
  { key: 'campaignIdeas',       label: 'Marketing Campaign Ideas',    icon: '🎯', rows: 5 },
  { key: 'customerTarget',      label: 'Customer Target Profile',     icon: '🎪', rows: 5 },
  { key: 'emailMessage',        label: 'Email Message',               icon: '📧', rows: 5 },
  { key: 'whatsappMessage',     label: 'WhatsApp Message',            icon: '💬', rows: 5 },
];

const emptyMarketing = (): AIMarketingContent => ({
  productDescription: '', instagramCaption: '', tiktokCaption: '',
  facebookCaption: '', hashtags: '', campaignIdeas: '',
  customerTarget: '', emailMessage: '', whatsappMessage: '',
});

// ─── Main Component ──────────────────────────────────────
export function ProductPublishPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [form, setForm] = useState<FormData>({
    name: '', category: 'Serums', price: '', ingredients: '', benefits: '', featured: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Step 3
  const [marketing, setMarketing] = useState<AIMarketingContent>(emptyMarketing());
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [aiError, setAiError] = useState('');

  // Step 5
  const [published, setPublished] = useState(false);
  const [publishedProduct, setPublishedProduct] = useState<PublishedProduct | null>(null);

  // ── Step 1: Image Handling ─────────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadError('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleUpload = async () => {
    if (!imageFile) return;
    setUploading(true);
    setUploadError('');
    setUploadProgress(0);
    try {
      const result = await uploadToCloudinary(imageFile, setUploadProgress);
      setImageUrl(result.secureUrl);
      setUploadProgress(100);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // ── Step 2: Form Validation ────────────────────────────
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errors.name = 'Product name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      errors.price = 'Enter a valid price';
    if (!form.ingredients.trim()) errors.ingredients = 'Ingredients are required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Step 3: AI Generation ──────────────────────────────
  const buildPrompt = (field: keyof AIMarketingContent): string => {
    const ctx = `Product: ${form.name}. Category: ${form.category}. Price: M${form.price}. Ingredients: ${form.ingredients}. Benefits: ${form.benefits}. Brand: The Precious Creations (TPC), a premium natural skincare brand in Maseru, Lesotho.`;
    const prompts: Record<keyof AIMarketingContent, string> = {
      productDescription:  `${ctx} Write a compelling 2-3 sentence product description for the website. Be warm, benefit-focused, and luxurious.`,
      instagramCaption:    `${ctx} Write an engaging Instagram caption (150-220 chars) with emojis. End with a CTA like "Shop now at the link in bio!"`,
      tiktokCaption:       `${ctx} Write a punchy TikTok caption (under 150 chars) with trending energy and 3-4 relevant emojis.`,
      facebookCaption:     `${ctx} Write a Facebook post caption (200-300 chars) that is warm, community-focused, with a clear CTA.`,
      hashtags:            `${ctx} Generate 20 highly relevant hashtags mixing broad and niche. Format as: #hashtag1 #hashtag2 ... Include skincare, Lesotho/Africa, and brand-specific tags.`,
      campaignIdeas:       `${ctx} Generate 3 creative marketing campaign ideas. For each: give it a name, 2-sentence description, and the target audience. Format clearly.`,
      customerTarget:      `${ctx} Describe the ideal customer profile: demographics (age, gender, location), psychographics (values, lifestyle), pain points, and buying motivation. Be specific.`,
      emailMessage:        `${ctx} Write a ready-to-send promotional email. Include: Subject line, greeting, product intro, key benefits, CTA button text, and sign-off. Use TPC brand voice.`,
      whatsappMessage:     `${ctx} Write a concise WhatsApp promotional message (under 300 chars) that feels personal, includes price, and ends with a clear CTA. Use 2-3 emojis.`,
    };
    return prompts[field];
  };

  const generateField = async (field: keyof AIMarketingContent) => {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      setAiError('xAI API key not found. Check your .env.local file.');
      return;
    }
    setGeneratingField(field);
    setAiError('');
    try {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'grok-4.5',
          messages: [
            { role: 'system', content: 'You are an expert marketing copywriter for a premium skincare brand. Be creative, concise, and brand-consistent.' },
            { role: 'user', content: buildPrompt(field) },
          ],
          max_tokens: 600,
          temperature: 0.75,
        }),
      });
      if (!res.ok) {
        const e = await res.json() as { error?: { message?: string } };
        throw new Error(e.error?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { choices: { message: { content: string } }[] };
      const content = data.choices[0].message.content.trim();
      setMarketing((prev) => ({ ...prev, [field]: content }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setGeneratingField(null);
    }
  };

  const generateAll = async () => {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      setAiError('xAI API key not found. Check your .env.local file.');
      return;
    }
    setGeneratingAll(true);
    setAiError('');
    const fields = Object.keys(emptyMarketing()) as (keyof AIMarketingContent)[];
    for (const field of fields) {
      await generateField(field);
    }
    setGeneratingAll(false);
  };

  // ── Step 5: Publish ────────────────────────────────────
  const handlePublish = () => {
    const product: PublishedProduct = {
      id: generateProductId(form.name),
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      description: marketing.productDescription || `${form.name} — a premium product from The Precious Creations.`,
      ingredients: form.ingredients.trim(),
      benefits: form.benefits.split(',').map((b) => b.trim()).filter(Boolean),
      featured: form.featured,
      imageUrl: imageUrl,
      isDynamic: true,
      marketing,
      publishedAt: new Date().toISOString(),
    };
    savePublishedProduct(product);
    setPublishedProduct(product);
    setPublished(true);
  };

  // ── Progress guard ──────────────────────────────────────
  const canGoToStep2 = imageUrl !== '';
  const canGoToStep3 = canGoToStep2 && !!form.name.trim() && !!form.price && Number(form.price) > 0 && !!form.ingredients.trim();
  const canPublish   = marketing.productDescription.trim() !== '';

  const goNext = () => {
    if (step === 2 && !validateForm()) return;
    setStep((s) => Math.min(s + 1, 5));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="pp-root">
      {/* Sidebar */}
      <aside className="pp-sidebar">
        <div className="pp-sidebar-brand">
          <Link to="/admin" className="pp-back-link">
            <i className="fas fa-arrow-left" /> Admin
          </Link>
          <h2 className="pp-sidebar-title">Publish Product</h2>
          <p className="pp-sidebar-sub">AI-Powered Pipeline</p>
        </div>
        <nav className="pp-steps-nav">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className={`pp-step-item${step === s.n ? ' active' : ''}${step > s.n ? ' done' : ''}`}
            >
              <div className="pp-step-dot">
                {step > s.n ? <i className="fas fa-check" /> : s.n}
              </div>
              <div className="pp-step-info">
                <span className="pp-step-icon">{s.icon}</span>
                <span className="pp-step-label">{s.label}</span>
              </div>
            </div>
          ))}
        </nav>
        <div className="pp-sidebar-footer">
          <Link to="/products" className="pp-view-store">
            <i className="fas fa-store" /> View Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="pp-main">
        {/* Header */}
        <div className="pp-topbar">
          <div className="pp-topbar-step">Step {step} of 5</div>
          <h1 className="pp-topbar-title">{STEPS[step - 1].icon} {STEPS[step - 1].label}</h1>
          <div className="pp-progress-bar">
            <div className="pp-progress-fill" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        <div className="pp-content">

          {/* ── STEP 1: Upload Image ── */}
          {step === 1 && (
            <div className="pp-card">
              <h2 className="pp-card-title">Upload Product Image</h2>
              <p className="pp-card-desc">Upload a high-quality product photo. It will be stored on Cloudinary and used across your store and marketing materials.</p>

              {!imagePreview ? (
                <div
                  className={`pp-dropzone${dragOver ? ' drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  <div className="pp-dropzone-icon">🖼️</div>
                  <p className="pp-dropzone-text">Drag & drop your image here</p>
                  <p className="pp-dropzone-sub">or click to browse — JPG, PNG, WebP (max 10MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="pp-image-preview-wrap">
                  <img src={imagePreview} alt="Preview" className="pp-image-preview" />
                  {!imageUrl && (
                    <div className="pp-image-overlay">
                      <button type="button" className="pp-change-btn" onClick={() => { setImagePreview(''); setImageFile(null); setImageUrl(''); }}>
                        <i className="fas fa-redo" /> Change Image
                      </button>
                    </div>
                  )}
                  {imageUrl && (
                    <div className="pp-image-success">
                      <i className="fas fa-check-circle" /> Uploaded to Cloudinary
                    </div>
                  )}
                </div>
              )}

              {uploadError && <p className="pp-error"><i className="fas fa-exclamation-circle" /> {uploadError}</p>}

              {imageFile && !imageUrl && (
                <div className="pp-upload-action">
                  {uploading ? (
                    <div className="pp-upload-progress">
                      <div className="pp-upload-bar"><div className="pp-upload-fill" style={{ width: `${uploadProgress}%` }} /></div>
                      <span className="pp-upload-pct">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <button type="button" className="pp-btn pp-btn-primary" onClick={() => void handleUpload()}>
                      <i className="fas fa-cloud-upload-alt" /> Upload to Cloudinary
                    </button>
                  )}
                </div>
              )}

              {!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && (
                <div className="pp-info-box">
                  <i className="fas fa-info-circle" />
                  <div>
                    <strong>Cloudinary not configured yet.</strong>
                    <p>Add <code>VITE_CLOUDINARY_CLOUD_NAME</code> and <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> to your <code>.env.local</code> file to enable image uploads.</p>
                    <p style={{ marginTop: 6 }}>For now, you can <button type="button" className="pp-skip-link" onClick={() => { setImageUrl('https://via.placeholder.com/600x600?text=Product+Image'); setStep(2); }}>skip with a placeholder image →</button></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Product Details ── */}
          {step === 2 && (
            <div className="pp-card">
              <h2 className="pp-card-title">Product Details</h2>
              <p className="pp-card-desc">Fill in the product information. The AI will use these details to generate all marketing content.</p>

              <div className="pp-form">
                <div className="pp-field">
                  <label className="pp-label">Product Name *</label>
                  <input className={`pp-input${formErrors.name ? ' error' : ''}`} type="text" placeholder="e.g. Rose Hip Brightening Serum" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {formErrors.name && <span className="pp-field-error">{formErrors.name}</span>}
                </div>

                <div className="pp-form-row">
                  <div className="pp-field">
                    <label className="pp-label">Category *</label>
                    <select className="pp-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="pp-field">
                    <label className="pp-label">Price (M — Lesotho Loti) *</label>
                    <input className={`pp-input${formErrors.price ? ' error' : ''}`} type="number" placeholder="e.g. 450" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="1" />
                    {formErrors.price && <span className="pp-field-error">{formErrors.price}</span>}
                  </div>
                </div>

                <div className="pp-field">
                  <label className="pp-label">Key Ingredients *</label>
                  <input className={`pp-input${formErrors.ingredients ? ' error' : ''}`} type="text" placeholder="e.g. Rosehip Oil, Vitamin C, Hyaluronic Acid, Shea Butter" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
                  {formErrors.ingredients && <span className="pp-field-error">{formErrors.ingredients}</span>}
                </div>

                <div className="pp-field">
                  <label className="pp-label">Benefits <span className="pp-label-hint">(comma separated)</span></label>
                  <input className="pp-input" type="text" placeholder="e.g. Brightens skin, Reduces dark spots, Boosts collagen" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
                </div>

                <div className="pp-field">
                  <label className="pp-checkbox-label">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="pp-checkbox" />
                    <span>Feature this product on the homepage</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: AI Marketing ── */}
          {step === 3 && (
            <div className="pp-card pp-card-wide">
              <div className="pp-ai-header">
                <div>
                  <h2 className="pp-card-title">AI Marketing Assistant</h2>
                  <p className="pp-card-desc">Generating marketing content for <strong>{form.name}</strong> using xAI Grok.</p>
                </div>
                <button
                  type="button"
                  className="pp-btn pp-btn-ai"
                  onClick={() => void generateAll()}
                  disabled={generatingAll}
                >
                  {generatingAll
                    ? <><span className="pp-spinner" /> Generating All…</>
                    : <><i className="fas fa-magic" /> Generate All</>
                  }
                </button>
              </div>

              {aiError && <p className="pp-error"><i className="fas fa-exclamation-circle" /> {aiError}</p>}

              <div className="pp-marketing-grid">
                {MARKETING_FIELDS.map(({ key, label, icon, rows }) => (
                  <div key={key} className="pp-marketing-field">
                    <div className="pp-marketing-label">
                      <span>{icon} {label}</span>
                      <button
                        type="button"
                        className="pp-regen-btn"
                        onClick={() => void generateField(key)}
                        disabled={generatingAll || generatingField === key}
                        title={`Regenerate ${label}`}
                      >
                        {generatingField === key
                          ? <span className="pp-spinner pp-spinner-sm" />
                          : <i className="fas fa-redo-alt" />
                        }
                      </button>
                    </div>
                    <textarea
                      className="pp-marketing-textarea"
                      rows={rows}
                      value={marketing[key]}
                      onChange={(e) => setMarketing({ ...marketing, [key]: e.target.value })}
                      placeholder={generatingField === key || generatingAll ? '✨ Generating…' : `Click "Generate All" or the ↺ button`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 4: Review ── */}
          {step === 4 && (
            <div className="pp-card pp-card-wide">
              <h2 className="pp-card-title">Review & Edit</h2>
              <p className="pp-card-desc">Review all generated content before publishing. You can edit any field.</p>

              <div className="pp-review-layout">
                <div className="pp-review-product">
                  <img src={imageUrl} alt={form.name} className="pp-review-image" />
                  <div className="pp-review-meta">
                    <h3 className="pp-review-name">{form.name}</h3>
                    <span className="pp-review-category">{form.category}</span>
                    <span className="pp-review-price">M{form.price}</span>
                    {form.featured && <span className="pp-review-badge">⭐ Featured</span>}
                    <p className="pp-review-ingredients"><strong>Ingredients:</strong> {form.ingredients}</p>
                  </div>
                </div>

                <div className="pp-review-fields">
                  {MARKETING_FIELDS.map(({ key, label, icon, rows }) => (
                    <div key={key} className="pp-review-field">
                      <label className="pp-label">{icon} {label}</label>
                      <textarea
                        className="pp-marketing-textarea"
                        rows={rows}
                        value={marketing[key]}
                        onChange={(e) => setMarketing({ ...marketing, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Publish ── */}
          {step === 5 && (
            <div className="pp-card pp-publish-card">
              {!published ? (
                <>
                  <div className="pp-publish-preview">
                    <img src={imageUrl} alt={form.name} className="pp-publish-image" />
                    <div className="pp-publish-info">
                      <h2 className="pp-publish-name">{form.name}</h2>
                      <p className="pp-publish-cat">{form.category} · M{form.price}</p>
                      <p className="pp-publish-desc">{marketing.productDescription}</p>
                      <div className="pp-publish-checks">
                        {[
                          { label: 'Image uploaded', done: !!imageUrl },
                          { label: 'Product details complete', done: !!form.name && !!form.price },
                          { label: 'AI content generated', done: !!marketing.productDescription },
                          { label: 'Content reviewed', done: true },
                        ].map(({ label, done }) => (
                          <div key={label} className={`pp-check ${done ? 'done' : 'pending'}`}>
                            <i className={`fas fa-${done ? 'check-circle' : 'clock'}`} />
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pp-btn pp-btn-publish"
                    onClick={handlePublish}
                    disabled={!canPublish}
                  >
                    <i className="fas fa-rocket" /> Publish Product to Store
                  </button>
                  {!canPublish && <p className="pp-error">Please generate at least the Product Description in Step 3 before publishing.</p>}
                </>
              ) : (
                <div className="pp-success">
                  <div className="pp-success-icon">🎉</div>
                  <h2 className="pp-success-title">Product Published!</h2>
                  <p className="pp-success-sub"><strong>{publishedProduct?.name}</strong> is now live in your store.</p>
                  <div className="pp-success-actions">
                    <Link to="/products" className="pp-btn pp-btn-primary">
                      <i className="fas fa-store" /> View in Store
                    </Link>
                    <button type="button" className="pp-btn pp-btn-outline" onClick={() => {
                      setStep(1); setImageFile(null); setImagePreview(''); setImageUrl('');
                      setForm({ name: '', category: 'Serums', price: '', ingredients: '', benefits: '', featured: false });
                      setMarketing(emptyMarketing()); setPublished(false); setPublishedProduct(null);
                    }}>
                      <i className="fas fa-plus" /> Publish Another
                    </button>
                    <Link to="/admin" className="pp-btn pp-btn-ghost">
                      <i className="fas fa-th-large" /> Admin Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {!published && (
            <div className="pp-nav-btns">
              {step > 1 && (
                <button type="button" className="pp-btn pp-btn-outline" onClick={goPrev}>
                  <i className="fas fa-chevron-left" /> Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {step < 5 && (
                <button
                  type="button"
                  className="pp-btn pp-btn-primary"
                  onClick={goNext}
                  disabled={
                    (step === 1 && !canGoToStep2) ||
                    (step === 2 && !canGoToStep3) ||
                    (step === 3 && generatingAll)
                  }
                >
                  {step === 4 ? 'Ready to Publish' : 'Continue'}
                  <i className="fas fa-chevron-right" style={{ marginLeft: 6 }} />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

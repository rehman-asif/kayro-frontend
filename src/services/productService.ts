import type { PublishedProduct } from '../types';

const STORAGE_KEY = 'tpc_published_products';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/** Load all dynamically published products from localStorage */
export function getPublishedProducts(): PublishedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PublishedProduct[];
  } catch {
    return [];
  }
}

function writeLocal(products: PublishedProduct[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/** Save locally (used as cache / offline fallback) */
export function savePublishedProduct(product: PublishedProduct): void {
  const existing = getPublishedProducts();
  const idx = existing.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    existing[idx] = product;
  } else {
    existing.push(product);
  }
  writeLocal(existing);
}

/** Publish product to MongoDB via API, then cache locally */
export async function publishProductToApi(product: PublishedProduct): Promise<PublishedProduct> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Product API did not return JSON. Check Netlify /api proxy.');
  }

  const data = await res.json() as {
    success: boolean;
    message?: string;
    data?: PublishedProduct;
  };

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to save product to database');
  }

  const saved = data.data ?? product;
  savePublishedProduct(saved);
  return saved;
}

/** Sync published products from the API into localStorage */
export async function syncPublishedProductsFromApi(): Promise<PublishedProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
    if (!res.ok) return getPublishedProducts();
    const data = await res.json() as { success: boolean; data?: PublishedProduct[] };
    if (data.success && Array.isArray(data.data)) {
      writeLocal(data.data);
      return data.data;
    }
  } catch {
    // keep local cache
  }
  return getPublishedProducts();
}

/** Delete a published product by id */
export function deletePublishedProduct(id: string): void {
  const existing = getPublishedProducts().filter((p) => p.id !== id);
  writeLocal(existing);
}

/** Generate a URL-safe product id from the name */
export function generateProductId(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    + '-'
    + Date.now().toString(36)
  );
}

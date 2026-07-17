import type { PublishedProduct } from '../types';

const STORAGE_KEY = 'tpc_published_products';

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

/** Save a new published product to localStorage */
export function savePublishedProduct(product: PublishedProduct): void {
  const existing = getPublishedProducts();
  // Replace if same id exists, otherwise append
  const idx = existing.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    existing[idx] = product;
  } else {
    existing.push(product);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/** Delete a published product by id */
export function deletePublishedProduct(id: string): void {
  const existing = getPublishedProducts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/** Generate a URL-safe product id from the name */
export function generateProductId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36);
}

import type { Product, ProductCategory } from '../types';

/**
 * Static demo catalog removed per client request.
 * Storefront products come from MongoDB (admin publish / manage).
 * Until the client uploads real photos, seeded combo bestsellers use placeholders.
 */
export const PRODUCTS: Product[] = [];

export const CATEGORIES: (ProductCategory | 'All')[] = [
  'All', 'Serums', 'Soaps', 'Hair Care', 'Body Care', 'Bundles', 'Diffusers', 'Perfumes',
];

/** Shared placeholder until the client uploads the correct product photo */
export const PRODUCT_PLACEHOLDER_IMAGE = '/products/placeholder.svg';

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

/** Returns all products from the synced publish cache (MongoDB-backed) */
export function getAllProducts(): Product[] {
  try {
    const raw = localStorage.getItem('tpc_published_products');
    const dynamic = raw ? (JSON.parse(raw) as Product[]) : [];
    return dynamic;
  } catch {
    return [];
  }
}

export function getFeaturedProducts(): Product[] {
  return getAllProducts().filter((p) => p.featured && !p.comingSoon);
}

export function getProductsByCategory(category: string): Product[] {
  const all = getAllProducts();
  if (category === 'All') return all;
  return all.filter((p) => p.category === category);
}

export function formatPrice(price: number): string {
  return `M${price.toFixed(2)}`;
}

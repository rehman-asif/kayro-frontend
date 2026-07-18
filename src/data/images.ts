import type { Product, ProductCategory } from '../types';

/** High-quality brand photography */
export const BRAND_IMAGES = {
  hero: '/hero.jpg',
  heroProducts: '/products/hero-products.jpg',
  soapBars: '/products/soap-bars.jpg',
  soapDiffuser: '/products/soap-diffuser-collection.jpg',
  logo: '/logo.png',
} as const;

/** Category showcase images — prefer real product photos where available */
export const CATEGORY_IMAGES: Record<string, string> = {
  Serums: BRAND_IMAGES.heroProducts,
  Soaps: BRAND_IMAGES.soapBars,
  'Hair Care': '/products/category-haircare.jpg',
  'Body Care': '/products/category-bodycare.jpg',
  Bundles: BRAND_IMAGES.heroProducts,
  Diffusers: BRAND_IMAGES.soapDiffuser,
  Perfumes: '/products/category-essentialoils.jpg',
  Skincare: BRAND_IMAGES.heroProducts,
  Haircare: '/products/category-haircare.jpg',
  'Essential Oils': '/products/category-essentialoils.jpg',
};

/** Featured product-specific images */
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'lavender-soap': BRAND_IMAGES.soapBars,
  'goji-rosehip-soap': BRAND_IMAGES.soapBars,
  'rooibos-soap': BRAND_IMAGES.soapBars,
  'honey-oats-soap': BRAND_IMAGES.soapBars,
  'coffee-cedarwood-soap': BRAND_IMAGES.soapBars,
  'ylang-garden-diffuser': BRAND_IMAGES.soapDiffuser,
  'honey-queen-diffuser': BRAND_IMAGES.soapDiffuser,
  'vitamin-c-serum': BRAND_IMAGES.heroProducts,
  'goji-berry-serum': BRAND_IMAGES.heroProducts,
  'glow-serum': BRAND_IMAGES.heroProducts,
  'turmeric-glow-combo': BRAND_IMAGES.heroProducts,
};

const BLOG_IMAGE_MAP: Record<string, string> = {
  'clear-pimples': BRAND_IMAGES.heroProducts,
  'damaged-barrier': BRAND_IMAGES.heroProducts,
  'glass-skin': BRAND_IMAGES.heroProducts,
  'melasma-care': BRAND_IMAGES.heroProducts,
  'hydration-vs-moisture': BRAND_IMAGES.heroProducts,
  'face-oil-myths': '/products/category-essentialoils.jpg',
  'titanium-dioxide': BRAND_IMAGES.heroProducts,
  'hair-growth-skill': '/products/category-haircare.jpg',
  'hair-breakage': '/products/category-haircare.jpg',
  'clean-hair-grows': '/products/category-haircare.jpg',
};

export function getCategoryImage(category: string): string {
  return CATEGORY_IMAGES[category] ?? BRAND_IMAGES.heroProducts;
}

export function getProductImage(product: Product): string {
  // Dynamically published products have a Cloudinary imageUrl — use it first
  if (product.imageUrl && !product.placeholder) {
    return product.imageUrl;
  }
  if (product.placeholder || product.comingSoon) {
    return '/products/placeholder.svg';
  }
  if (PRODUCT_IMAGE_MAP[product.id]) {
    return PRODUCT_IMAGE_MAP[product.id];
  }
  return getCategoryImage(product.category);
}

export function getBlogImage(postId: string, category?: string): string {
  if (BLOG_IMAGE_MAP[postId]) return BLOG_IMAGE_MAP[postId];
  if (category === 'Hair Care') return '/products/category-haircare.jpg';
  return BRAND_IMAGES.heroProducts;
}

export function getCartItemImage(productId: string, category: ProductCategory): string {
  const product = { id: productId, category } as Product;
  return getProductImage(product);
}

import type { Product, ProductCategory } from '../types';

export const PRODUCTS: Product[] = [
  { id: 'vitamin-c-serum', name: 'Vitamin C Serum', category: 'Serums', price: 450, featured: true, description: 'Brightening serum with potent Vitamin C for radiant, even-toned skin.', ingredients: 'Vitamin C, Hyaluronic Acid, Botanical Extracts', benefits: ['Brightens skin', 'Reduces dark spots', 'Boosts collagen'] },
  { id: 'goji-berry-serum', name: 'Goji Berry Serum', category: 'Serums', price: 480, featured: true, description: 'Antioxidant-rich serum infused with goji berry for youthful, glowing skin.', ingredients: 'Goji Berry Extract, Vitamin E, Rosehip Oil', benefits: ['Anti-aging', 'Antioxidant protection', 'Deep hydration'] },
  { id: 'vitamin-c-ha-serum', name: 'Vitamin C Hyaluronic Acid Serum', category: 'Serums', price: 520, description: 'Dual-action serum combining Vitamin C with Hyaluronic Acid for plump, luminous skin.', ingredients: 'Vitamin C, Hyaluronic Acid, Niacinamide', benefits: ['Hydrating', 'Brightening', 'Plumping effect'] },
  { id: 'glow-serum', name: 'Glow Serum', category: 'Serums', price: 490, description: 'Multi-benefit glow serum for an instant radiant complexion.', ingredients: 'Botanical Glow Complex, Vitamin B5, Squalane', benefits: ['Instant glow', 'Smooth texture', 'Even tone'] },
  { id: 'lavender-soap', name: 'Lavender Soap', category: 'Soaps', price: 85, featured: true, description: 'Handcrafted lavender soap for calming, gentle cleansing.', ingredients: 'Lavender Essential Oil, Shea Butter, Olive Oil', benefits: ['Calming', 'Gentle cleanse', 'Moisturizing'] },
  { id: 'goji-rosehip-soap', name: 'Goji Berry & Rosehip Soap', category: 'Soaps', price: 90, description: 'Nourishing soap with goji berry and rosehip for revitalized skin.', ingredients: 'Goji Berry, Rosehip Oil, Coconut Oil', benefits: ['Revitalizing', 'Antioxidant-rich', 'Soft skin'] },
  { id: 'rooibos-soap', name: 'Rooibos Soap', category: 'Soaps', price: 85, description: 'South African rooibos-infused soap with antioxidant properties.', ingredients: 'Rooibos Extract, Cocoa Butter, Castor Oil', benefits: ['Antioxidant', 'Soothing', 'Natural cleanse'] },
  { id: 'honey-oats-soap', name: 'Honey & Oats Soap', category: 'Soaps', price: 80, description: 'Gentle exfoliating soap with honey and oats for soft, smooth skin.', ingredients: 'Raw Honey, Colloidal Oats, Goat Milk', benefits: ['Exfoliating', 'Moisturizing', 'Gentle'] },
  { id: 'rice-kaolin-soap', name: 'Rice Flour & Kaolin Clay Soap', category: 'Soaps', price: 85, description: 'Purifying soap with rice flour and kaolin clay for balanced skin.', ingredients: 'Rice Flour, Kaolin Clay, Jojoba Oil', benefits: ['Purifying', 'Oil control', 'Brightening'] },
  { id: 'coconut-oat-soap', name: 'Coconut Milk & Oat Soap', category: 'Soaps', price: 80, description: 'Creamy coconut milk soap with oats for deep nourishment.', ingredients: 'Coconut Milk, Oats, Almond Oil', benefits: ['Deep nourishment', 'Gentle', 'Hydrating'] },
  { id: 'coffee-cedarwood-soap', name: 'Coffee & Cedarwood Soap', category: 'Soaps', price: 85, description: 'Invigorating coffee and cedarwood soap for an energizing cleanse.', ingredients: 'Coffee Grounds, Cedarwood Oil, Shea Butter', benefits: ['Exfoliating', 'Energizing', 'Aromatherapy'] },
  { id: 'neem-soap', name: 'Neem Soap', category: 'Soaps', price: 90, comingSoon: true, description: 'Antibacterial neem soap for clear, healthy skin. Coming soon.', ingredients: 'Neem Extract, Tea Tree Oil, Coconut Oil', benefits: ['Antibacterial', 'Acne-fighting', 'Purifying'] },
  { id: 'hair-growth-oil', name: 'Extreme Hair Growth Oil', category: 'Hair Care', price: 350, featured: true, description: 'Powerful botanical oil blend for extreme hair growth and thickness.', ingredients: 'Castor Oil, Rosemary, Peppermint, Biotin', benefits: ['Hair growth', 'Thickens hair', 'Strengthens roots'] },
  { id: 'hair-butter', name: 'Hair Butter', category: 'Hair Care', price: 280, description: 'Rich hair butter for deep moisture and curl definition.', ingredients: 'Shea Butter, Mango Butter, Argan Oil', benefits: ['Deep moisture', 'Curl definition', 'Frizz control'] },
  { id: 'moisturizing-shampoo', name: 'Moisturizing and Conditioning Shampoo', category: 'Hair Care', price: 220, description: 'Gentle shampoo that cleanses while deeply conditioning hair.', ingredients: 'Aloe Vera, Coconut Oil, Silk Proteins', benefits: ['Moisturizing', 'Gentle cleanse', 'Soft hair'] },
  { id: 'hair-growth-combo', name: 'Extreme Hair Growth Combo', category: 'Hair Care', price: 580, description: 'Complete hair growth system with oil and complementary products.', ingredients: 'Growth Oil, Hair Butter, Shampoo', benefits: ['Complete system', 'Maximum growth', 'Best value'] },
  { id: 'coffee-scrub', name: 'Coffee Scrub', category: 'Body Care', price: 180, featured: true, description: 'Exfoliating coffee body scrub for smooth, glowing skin.', ingredients: 'Coffee Grounds, Coconut Oil, Brown Sugar', benefits: ['Exfoliating', 'Cellulite reduction', 'Smooth skin'] },
  { id: 'stretch-mark-oil', name: 'Stretch Mark Oil', category: 'Body Care', price: 320, featured: true, description: 'Targeted oil to reduce the appearance of stretch marks.', ingredients: 'Rosehip Oil, Vitamin E, Cocoa Butter', benefits: ['Reduces stretch marks', 'Skin elasticity', 'Nourishing'] },
  { id: 'turmeric-body-oil', name: 'Turmeric Body Oil', category: 'Body Care', price: 280, description: 'Golden turmeric body oil for radiant, even-toned skin.', ingredients: 'Turmeric Extract, Sweet Almond Oil, Vitamin E', benefits: ['Brightening', 'Anti-inflammatory', 'Glowing skin'] },
  { id: 'glowing-face-body-oil', name: 'Glowing Face and Body Oil', category: 'Body Care', price: 350, description: 'Multi-use glow oil for face and body radiance.', ingredients: 'Jojoba Oil, Marula Oil, Vitamin C', benefits: ['All-over glow', 'Lightweight', 'Versatile'] },
  { id: 'dark-spot-corrector', name: 'Dark Spot Corrector', category: 'Body Care', price: 380, description: 'Targeted treatment for dark spots and hyperpigmentation.', ingredients: 'Kojic Acid, Niacinamide, Licorice Root', benefits: ['Fades dark spots', 'Even tone', 'Brightening'] },
  { id: 'dark-inner-thigh-cream', name: 'Dark Inner Thigh Cream', category: 'Body Care', price: 290, description: 'Specialized cream for dark inner thigh areas.', ingredients: 'Alpha Arbutin, Kojic Acid, Shea Butter', benefits: ['Lightens dark areas', 'Moisturizing', 'Gentle formula'] },
  { id: 'dark-armpits-rollon', name: 'Dark Armpits Roll-On', category: 'Body Care', price: 250, description: 'Convenient roll-on treatment for underarm darkening.', ingredients: 'Niacinamide, AHA, Aloe Vera', benefits: ['Lightens underarms', 'Easy application', 'Deodorizing'] },
  { id: 'turmeric-glow-lotion', name: 'Turmeric Glow Up Body Lotion', category: 'Body Care', price: 260, description: 'Luxurious turmeric body lotion for all-over radiance.', ingredients: 'Turmeric, Shea Butter, Glycerin', benefits: ['Glowing skin', 'Deep hydration', 'Even tone'] },
  { id: 'lemongrass-turmeric-wash', name: 'Lemongrass and Turmeric Body Wash', category: 'Body Care', price: 200, description: 'Refreshing body wash with lemongrass and turmeric.', ingredients: 'Lemongrass Oil, Turmeric, Coconut Surfactants', benefits: ['Refreshing', 'Antibacterial', 'Brightening'] },
  { id: 'turmeric-glow-combo', name: 'Turmeric Glow Up Combo', category: 'Bundles', price: 650, featured: true, description: 'Complete turmeric glow system for radiant skin.', ingredients: 'Turmeric Body Oil, Glow Lotion, Body Wash', benefits: ['Complete glow system', 'Best value', 'Radiant skin'] },
  { id: 'stretch-mark-glow-combo', name: 'Stretch Mark & Glow Combo', category: 'Bundles', price: 720, description: 'Bundle combining stretch mark treatment with glow products.', ingredients: 'Stretch Mark Oil, Glow Oil, Body Lotion', benefits: ['Dual action', 'Complete care', 'Save more'] },
  { id: 'complete-hair-combo', name: 'Complete Hair Care Bundle', category: 'Bundles', price: 850, description: 'Full hair care system for growth, moisture, and strength.', ingredients: 'Growth Oil, Hair Butter, Shampoo', benefits: ['Complete hair system', 'Maximum results', 'Best savings'] },
  { id: 'ylang-garden-diffuser', name: 'Ylang Garden Diffuser', category: 'Diffusers', price: 420, description: 'Floral ylang ylang reed diffuser for a serene home atmosphere.', ingredients: 'Ylang Ylang, Jasmine, Sandalwood', benefits: ['Relaxing aroma', 'Long-lasting', 'Elegant design'] },
  { id: 'honey-queen-diffuser', name: 'Honey Queen Diffuser', category: 'Diffusers', price: 420, description: 'Warm honey and floral reed diffuser for cozy elegance.', ingredients: 'Honey Accord, Vanilla, Rose', benefits: ['Warm scent', 'Luxurious', 'Home wellness'] },
  { id: 'lady-million', name: 'Lady Million', category: 'Perfumes', price: 550, description: 'Luxurious feminine fragrance with floral and amber notes.', ingredients: 'Floral, Amber, Vanilla', benefits: ['Long-lasting', 'Elegant scent', 'Signature fragrance'] },
  { id: 'the-most-wanted', name: 'The Most Wanted', category: 'Perfumes', price: 550, description: 'Bold, captivating fragrance for the confident individual.', ingredients: 'Spice, Wood, Amber', benefits: ['Bold scent', 'All-day wear', 'Statement fragrance'] },
  { id: 'be-delicious', name: 'Be Delicious', category: 'Perfumes', price: 520, description: "Fresh, fruity fragrance that's irresistibly delightful.", ingredients: 'Apple, Cucumber, White Rose', benefits: ['Fresh scent', 'Light & playful', 'Daily wear'] },
];

export const CATEGORIES: (ProductCategory | 'All')[] = [
  'All', 'Serums', 'Soaps', 'Hair Care', 'Body Care', 'Bundles', 'Diffusers', 'Perfumes',
];

export const CATEGORY_CARDS = [
  { label: 'Serums', image: '/products/category-skincare.jpg', slug: 'Serums' },
  { label: 'Soaps', image: '/products/category-soaps.jpg', slug: 'Soaps' },
  { label: 'Hair Care', image: '/products/category-haircare.jpg', slug: 'Hair Care' },
  { label: 'Body Care', image: '/products/category-bodycare.jpg', slug: 'Body Care' },
  { label: 'Bundles', image: '/products/category-skincare.jpg', slug: 'Bundles' },
  { label: 'Diffusers', image: '/products/category-essentialoils.jpg', slug: 'Diffusers' },
  { label: 'Perfumes', image: '/products/soap-diffuser-collection.jpg', slug: 'Perfumes' },
];

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

/** Returns all products (static + dynamically published) */
export function getAllProducts(): Product[] {
  try {
    const raw = localStorage.getItem('tpc_published_products');
    const dynamic = raw ? (JSON.parse(raw) as Product[]) : [];
    return [...PRODUCTS, ...dynamic];
  } catch {
    return PRODUCTS;
  }
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured && !p.comingSoon);
}

export function getProductsByCategory(category: string): Product[] {
  const all = getAllProducts();
  if (category === 'All') return all;
  return all.filter((p) => p.category === category);
}

export function formatPrice(price: number): string {
  return `M${price.toFixed(2)}`;
}

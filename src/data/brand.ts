import type { SocialLink } from '../types';

export const BRAND = {
  name: 'The Precious Creations',
  tagline: 'Nourishing Skin From The Inside Out',
  ticker: 'Naturally Made, Consciously Crafted, Uniquely You.',
  description: 'Premium skincare and wellness brand based in Maseru, Lesotho.',
  location: 'NRH Mall, Room 13, Top Floor, Kingsway, Maseru, Lesotho',
  phone: '+266 5733 3532',
  email: 'nletjoko1@icloud.com',
} as const;

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/thepreciouscreations?igsh=MXJ3MmYwMWJ3N2lpeA==',
    icon: 'fab fa-instagram',
    handle: '@thepreciouscreations',
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61570284722298',
    icon: 'fab fa-facebook-f',
    handle: 'The Precious Creations',
  },
  {
    name: 'TikTok',
    url: 'https://vm.tiktok.com/ZS9M94CnaFH2X-FTkGx/',
    icon: 'fab fa-tiktok',
    handle: 'The Precious Creations',
  },
];

export const TRUST_ITEMS = [
  { icon: 'fas fa-seedling', title: 'Natural Ingredients', description: 'We use only the finest ingredients from nature' },
  { icon: 'fas fa-hand-holding-heart', title: 'Handcrafted', description: 'Lovingly handcrafted in small batches' },
  { icon: 'fas fa-spa', title: 'Effective & Gentle', description: 'Formulas that deliver results without compromise' },
  { icon: 'fas fa-globe-africa', title: 'Sustainable Beauty', description: 'Good for you and good for the planet' },
] as const;

export const WHY_CHOOSE_US = [
  { icon: 'fas fa-seedling', title: 'Premium Ingredients', description: 'Clean, effective botanicals carefully selected for exceptional skincare.' },
  { icon: 'fas fa-star', title: 'Visible Results', description: 'Thoughtfully formulated products designed to deliver noticeable results.' },
  { icon: 'fas fa-hands', title: 'Handcrafted Excellence', description: 'Every product is handcrafted with precision, passion, and attention to detail.' },
  { icon: 'fas fa-book-open', title: 'Educational Transparency', description: 'We empower our customers with trusted skincare knowledge.' },
  { icon: 'fas fa-heart', title: 'Inclusive Beauty', description: 'Created for diverse skin tones, textures, and hair types.' },
] as const;

export const TESTIMONIALS = [
  { name: 'Lerato M.', location: 'Maseru, Lesotho', initial: 'L', text: 'The Vitamin C Serum transformed my skin! Visible glow within weeks. Truly premium quality from a local brand I trust.' },
  { name: 'Thabo K.', location: 'Maseru, Lesotho', initial: 'T', text: 'The Lavender Soap is absolutely divine. My skin feels so soft and the scent is calming. Handcrafted perfection!' },
  { name: 'Nthabiseng P.', location: 'Maseru, Lesotho', initial: 'N', text: 'Extreme Hair Growth Oil works wonders! My hair has never been healthier. The Precious Creations is the real deal.' },
] as const;

export const FIREBASE_COLLECTIONS = {
  AI_REQUESTS: 'ai_requests',
  AI_RESPONSES: 'ai_responses',
  CUSTOMER_PROFILES: 'customer_profiles',
  BEAUTY_PROFILES: 'beauty_profiles',
  PRODUCT_KNOWLEDGE: 'product_knowledge',
  MARKETING_CAMPAIGNS: 'marketing_campaigns',
  CONTENT_CALENDAR: 'content_calendar',
  BUSINESS_REPORTS: 'business_reports',
  FINANCIAL_REPORTS: 'financial_reports',
  CUSTOMER_CHATS: 'customer_chats',
  ADMIN_INSIGHTS: 'admin_insights',
} as const;

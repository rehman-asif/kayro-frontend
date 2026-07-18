export type ProductCategory =
  | 'Serums'
  | 'Soaps'
  | 'Hair Care'
  | 'Body Care'
  | 'Bundles'
  | 'Diffusers'
  | 'Perfumes';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  ingredients?: string;
  benefits?: string[];
  featured?: boolean;
  comingSoon?: boolean;
  /** True until the client uploads the real product photo */
  placeholder?: boolean;
  imageUrl?: string;
  isDynamic?: boolean; // true = added via publish pipeline
  stock?: number;
}

export interface AIMarketingContent {
  productDescription: string;
  instagramCaption: string;
  tiktokCaption: string;
  facebookCaption: string;
  hashtags: string;
  campaignIdeas: string;
  customerTarget: string;
  emailMessage: string;
  whatsappMessage: string;
}

export interface PublishedProduct extends Product {
  imageUrl: string;
  marketing: AIMarketingContent;
  publishedAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  quantity: number;
}

export interface BlogPost {
  id: string;
  /** Mongo document id — used for admin updates when needed */
  mongoId?: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl?: string;
  placeholder?: boolean;
  sortOrder?: number;
}

export type AssistantId =
  | 'business'
  | 'beauty'
  | 'productFinder'
  | 'sales'
  | 'blogWriter'
  | 'captionGenerator'
  | 'marketing'
  | 'insights'
  | 'financial'
  | 'economist'
  | 'inventory'
  | 'customer';

export interface AIAssistant {
  id: AssistantId;
  name: string;
  icon: string;
  systemPrompt: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  handle?: string;
}

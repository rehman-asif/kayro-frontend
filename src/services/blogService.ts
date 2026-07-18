import type { BlogPost } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function parseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Blog API did not return JSON');
  }
  return res.json() as Promise<T>;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}/blog`, { credentials: 'include' });
  const data = await parseJson<{ success: boolean; data?: BlogPost[] }>(res);
  if (!res.ok || !data.success) return [];
  return data.data ?? [];
}

export async function createBlogPostApi(payload: {
  title: string;
  excerpt: string;
  category: string;
  date?: string;
  imageUrl: string;
  placeholder?: boolean;
  sortOrder?: number;
}): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blog`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ success: boolean; message?: string; data?: BlogPost }>(res);
  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.message || 'Failed to create post');
  }
  return data.data;
}

export async function updateBlogPostApi(
  id: string,
  patch: Partial<BlogPost>
): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blog/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  const data = await parseJson<{ success: boolean; message?: string; data?: BlogPost }>(res);
  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.message || 'Failed to update post');
  }
  return data.data;
}

export async function deleteBlogPostApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/blog/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await parseJson<{ success: boolean; message?: string }>(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete post');
  }
}

export interface StoreCategory {
  id: string;
  slug: string;
  label: string;
  imageUrl: string;
  placeholder?: boolean;
  sortOrder?: number;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function parseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Category API did not return JSON');
  }
  return res.json() as Promise<T>;
}

export async function fetchCategories(): Promise<StoreCategory[]> {
  const res = await fetch(`${API_BASE}/categories`, { credentials: 'include' });
  const data = await parseJson<{ success: boolean; data?: StoreCategory[] }>(res);
  if (!res.ok || !data.success) return [];
  return data.data ?? [];
}

export async function createCategoryApi(payload: {
  label: string;
  slug: string;
  imageUrl: string;
  placeholder?: boolean;
  sortOrder?: number;
}): Promise<StoreCategory> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ success: boolean; message?: string; data?: StoreCategory }>(res);
  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.message || 'Failed to create category');
  }
  return data.data;
}

export async function updateCategoryApi(
  id: string,
  patch: Partial<Pick<StoreCategory, 'label' | 'slug' | 'imageUrl' | 'placeholder' | 'sortOrder'>>
): Promise<StoreCategory> {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  const data = await parseJson<{ success: boolean; message?: string; data?: StoreCategory }>(res);
  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.message || 'Failed to update category');
  }
  return data.data;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await parseJson<{ success: boolean; message?: string }>(res);
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete category');
  }
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'other';

export interface PosOrderItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface PosOrder {
  id: string;
  orderNumber: string;
  source: 'pos' | 'online';
  items: PosOrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  notes: string;
  status: 'completed' | 'voided';
  soldBy?: { adminId?: string; name?: string; email?: string };
  createdAt: string;
}

export interface OrderStats {
  totalSales: number;
  todayRevenue: number;
  orderCount: number;
  todayOrderCount: number;
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = (await res.json()) as T & { success?: boolean; message?: string };
  if (!res.ok || (json as { success?: boolean }).success === false) {
    throw new Error((json as { message?: string }).message || `Request failed (${res.status})`);
  }
  return json;
}

export async function createPosSale(payload: {
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  customerName?: string;
  notes?: string;
}): Promise<PosOrder> {
  const res = await fetch(`${API_BASE}/orders/pos`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await parseJson<{ success: boolean; data: PosOrder }>(res);
  return json.data;
}

export async function fetchOrders(limit = 50): Promise<PosOrder[]> {
  const res = await fetch(`${API_BASE}/orders?limit=${limit}`, { credentials: 'include' });
  const json = await parseJson<{ success: boolean; data: PosOrder[] }>(res);
  return json.data;
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const res = await fetch(`${API_BASE}/orders/stats`, { credentials: 'include' });
  const json = await parseJson<{ success: boolean; data: OrderStats }>(res);
  return json.data;
}

export async function voidOrder(id: string): Promise<PosOrder> {
  const res = await fetch(`${API_BASE}/orders/${id}/void`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await parseJson<{ success: boolean; data: PosOrder }>(res);
  return json.data;
}

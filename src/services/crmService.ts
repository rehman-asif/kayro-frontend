const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function parseJson<T>(res: Response): Promise<T> {
  const json = (await res.json()) as T & { success?: boolean; message?: string };
  if (!res.ok || (json as { success?: boolean }).success === false) {
    throw new Error((json as { message?: string }).message || `Request failed (${res.status})`);
  }
  return json;
}

export async function fetchCrmDashboard() {
  const res = await fetch(`${API_BASE}/crm/dashboard`, { credentials: 'include' });
  return (await parseJson<{ data: CrmDashboard }>(res)).data;
}

export interface CrmDashboard {
  totalCustomers: number;
  newCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSales: number;
  outstandingPayments: number;
  subscribers: number;
  openLeads: number;
  lowStockCount: number;
  followUpDue: number;
  recentActivity: { id: string; type: string; title: string; message: string; createdAt: string; read: boolean }[];
  lowStock: { id: string; name: string; stock: number }[];
}

export interface CrmCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  customerType: string;
  status: string;
  notes: string;
  totalSpent: number;
  lastPurchaseAt?: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  source: string;
  joinedAt?: string;
}

export async function fetchCustomers(q = '', status = '') {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  const res = await fetch(`${API_BASE}/crm/customers?${params}`, { credentials: 'include' });
  return (await parseJson<{ data: CrmCustomer[] }>(res)).data;
}

export async function createCustomer(body: Partial<CrmCustomer>) {
  const res = await fetch(`${API_BASE}/crm/customers`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await parseJson<{ data: CrmCustomer }>(res)).data;
}

export async function updateCustomer(id: string, body: Partial<CrmCustomer>) {
  const res = await fetch(`${API_BASE}/crm/customers/${id}`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await parseJson<{ data: CrmCustomer }>(res)).data;
}

export async function deleteCustomer(id: string) {
  const res = await fetch(`${API_BASE}/crm/customers/${id}`, { method: 'DELETE', credentials: 'include' });
  await parseJson(res);
}

export async function fetchCustomerProfile(id: string) {
  const res = await fetch(`${API_BASE}/crm/customers/${id}`, { credentials: 'include' });
  return (await parseJson<{ data: { customer: CrmCustomer; orders: unknown[] } }>(res)).data;
}

export async function subscribeEmail(email: string) {
  const res = await fetch(`${API_BASE}/crm/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'website' }),
  });
  return parseJson(res);
}

export async function fetchSubscribers() {
  const res = await fetch(`${API_BASE}/crm/subscribers`, { credentials: 'include' });
  return (await parseJson<{ data: { id: string; email: string; source: string; active: boolean; subscribedAt: string }[] }>(res)).data;
}

export async function deleteSubscriber(id: string) {
  const res = await fetch(`${API_BASE}/crm/subscribers/${id}`, { method: 'DELETE', credentials: 'include' });
  await parseJson(res);
}

export async function fetchLeads(stage = '') {
  const q = stage ? `?stage=${stage}` : '';
  const res = await fetch(`${API_BASE}/crm/leads${q}`, { credentials: 'include' });
  return (await parseJson<{ data: Lead[] }>(res)).data;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  source: string;
  interest: string;
  stage: string;
  assignedStaff: string;
  followUpDate?: string;
  notes: string;
  message: string;
  createdAt: string;
}

export async function createLead(body: Partial<Lead>) {
  const res = await fetch(`${API_BASE}/crm/leads`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function updateLead(id: string, body: Partial<Lead>) {
  const res = await fetch(`${API_BASE}/crm/leads/${id}`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function deleteLead(id: string) {
  const res = await fetch(`${API_BASE}/crm/leads/${id}`, { method: 'DELETE', credentials: 'include' });
  await parseJson(res);
}

export async function submitContactLead(body: { name: string; email?: string; phone?: string; message: string }) {
  const res = await fetch(`${API_BASE}/crm/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function fetchFollowUps() {
  const res = await fetch(`${API_BASE}/crm/follow-ups`, { credentials: 'include' });
  return (await parseJson<{ data: Record<string, unknown> }>(res)).data;
}

export async function fetchCampaigns() {
  const res = await fetch(`${API_BASE}/crm/campaigns`, { credentials: 'include' });
  return (await parseJson<{ data: Campaign[] }>(res)).data;
}

export interface Campaign {
  id: string;
  name: string;
  targetAudience: string;
  status: string;
  channel: string;
  startDate?: string;
  endDate?: string;
  leadsGenerated: number;
  customersAcquired: number;
  salesGenerated: number;
  spend: number;
  roi: number | null;
  notes: string;
}

export async function createCampaign(body: Partial<Campaign>) {
  const res = await fetch(`${API_BASE}/crm/campaigns`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function updateCampaign(id: string, body: Partial<Campaign>) {
  const res = await fetch(`${API_BASE}/crm/campaigns/${id}`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function deleteCampaign(id: string) {
  const res = await fetch(`${API_BASE}/crm/campaigns/${id}`, { method: 'DELETE', credentials: 'include' });
  await parseJson(res);
}

export async function fetchNotifications() {
  const res = await fetch(`${API_BASE}/crm/notifications`, { credentials: 'include' });
  return (await parseJson<{ data: { id: string; type: string; title: string; message: string; read: boolean; createdAt: string }[] }>(res)).data;
}

export async function markNotificationsRead() {
  const res = await fetch(`${API_BASE}/crm/notifications/read`, { method: 'POST', credentials: 'include' });
  await parseJson(res);
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/crm/settings`, { credentials: 'include' });
  return (await parseJson<{ data: Record<string, unknown> }>(res)).data;
}

export async function updateSettings(body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/crm/settings`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function fetchStaff() {
  const res = await fetch(`${API_BASE}/crm/staff`, { credentials: 'include' });
  return (await parseJson<{ data: { id: string; name: string; email: string; role: string; active: boolean }[] }>(res)).data;
}

export async function createStaff(body: { name: string; email: string; password: string; role: string }) {
  const res = await fetch(`${API_BASE}/crm/staff`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function updateStaff(id: string, body: Partial<{ name: string; role: string; active: boolean }>) {
  const res = await fetch(`${API_BASE}/crm/staff/${id}`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function fetchReports(range = 'monthly') {
  const res = await fetch(`${API_BASE}/crm/reports?range=${range}`, { credentials: 'include' });
  return (await parseJson<{ data: Record<string, unknown> }>(res)).data;
}

export async function placeOnlineOrder(body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson<{ success: boolean; data: { orderNumber: string } }>(res);
}

export async function fetchAdminOrders(limit = 100) {
  const res = await fetch(`${API_BASE}/orders?limit=${limit}`, { credentials: 'include' });
  return (await parseJson<{ data: AdminOrder[] }>(res)).data;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  source: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryStatus: string;
  driverName: string;
  trackingNumber: string;
  notes: string;
  createdAt: string;
}

export async function updateAdminOrder(id: string, body: Partial<AdminOrder>) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PATCH', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function voidAdminOrder(id: string) {
  const res = await fetch(`${API_BASE}/orders/${id}/void`, { method: 'POST', credentials: 'include' });
  return parseJson(res);
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export interface HubSpotContactProperties {
  email?: string;
  firstname?: string;
  lastname?: string;
  hs_lead_status?: string;
  lifecyclestage?: string;
  [key: string]: string | undefined;
}

export interface HubSpotContact {
  id: string;
  properties: HubSpotContactProperties;
  createdAt?: string;
  updatedAt?: string;
}

export const hubspotService = {
  getContactByEmail: (email: string) =>
    apiFetch<{ success: boolean; data: HubSpotContact }>(
      `/hubspot/contact?email=${encodeURIComponent(email)}`
    ),
};

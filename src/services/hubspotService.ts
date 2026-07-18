const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { headers: optionHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(optionHeaders as Record<string, string> | undefined),
    },
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

  syncContact: (email: string, name?: string) =>
    apiFetch<{ success: boolean; message: string; data: HubSpotContact }>(
      '/hubspot/contact',
      {
        method: 'POST',
        body: JSON.stringify({ email, name }),
      }
    ),
};

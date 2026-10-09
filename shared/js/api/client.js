/**
 * AMEZA API Client Engine — js/api/client.js
 * Universal client layer for Supabase REST/Auth with local fallback.
 */

// Configuration loader
export const config = {
  supabaseUrl: (typeof window !== 'undefined' && window.__AMEZA_CONFIG__ && window.__AMEZA_CONFIG__.SUPABASE_URL) || (typeof localStorage !== 'undefined' && localStorage.getItem('ameza_supabase_url')) || '',
  supabaseKey: (typeof window !== 'undefined' && window.__AMEZA_CONFIG__ && window.__AMEZA_CONFIG__.SUPABASE_ANON_KEY) || (typeof localStorage !== 'undefined' && localStorage.getItem('ameza_supabase_anon_key')) || '',
  flightApiKey: (typeof window !== 'undefined' && window.__AMEZA_CONFIG__ && window.__AMEZA_CONFIG__.FLIGHT_API_KEY) || (typeof localStorage !== 'undefined' && localStorage.getItem('ameza_flight_api_key')) || '',
  isConfigured() {
    return Boolean(this.supabaseUrl && this.supabaseKey && !this.supabaseUrl.includes('your-project-id'));
  }
};

/**
 * Universal fetch wrapper for Supabase PostgREST
 */
export async function apiFetch(endpoint, options = {}) {
  if (!config.isConfigured()) {
    return { data: null, error: { message: 'Backend not configured. Using local catalog fallback.' } };
  }

  const url = `${config.supabaseUrl}/rest/v1/${endpoint}`;
  const session = JSON.parse(localStorage.getItem('ameza_session') || 'null');
  const token = session?.accessToken || config.supabaseKey;

  const headers = {
    'apikey': config.supabaseKey,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error: err };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    console.warn(`[AMEZA API] Network request to ${endpoint} failed:`, err);
    return { data: null, error: err };
  }
}

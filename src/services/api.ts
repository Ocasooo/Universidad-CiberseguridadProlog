const API_BASE = 'http://localhost:3001';
const TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchBlacklist(): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/blacklist`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.ips || [];
  } catch {
    return [];
  }
}

export async function fetchLogs(): Promise<any> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/logs`);
    if (!res.ok) return { logs: [] };
    return res.json();
  } catch {
    return { logs: [] };
  }
}

export async function fetchAlerts(): Promise<any> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/alerts`);
    if (!res.ok) return { alerts: [] };
    return res.json();
  } catch {
    return { alerts: [] };
  }
}

export async function uploadCSV(content: string, fileName: string) {
  const formData = new FormData();
  const blob = new Blob([content], { type: 'text/csv' });
  formData.append('file', blob, fileName);

  const res = await fetchWithTimeout(`${API_BASE}/upload-csv`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function resetBackendProlog(): Promise<void> {
}

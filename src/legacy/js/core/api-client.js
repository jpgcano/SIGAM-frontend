// Low-level API client: fetch + auth + retries + errors.
import endpoints from './endpoints.js';
import { getToken, clearToken, clearUser } from './storage.js';

export function buildQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function request(path, options = {}) {
  const baseUrl = endpoints.baseUrl || '';

  if (!baseUrl) {
    throw new Error('API base URL is not configured.');
  }

  const query = options.query ? buildQueryString(options.query) : '';
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}${query}`;
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...options.headers };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const isAuthEndpoint = /\/api\/auth\/(login|register)/i.test(path);
  const maxRetries = isAuthEndpoint ? 0 : (options.maxRetries ?? (method === 'GET' ? 2 : 0));
  const retryOn429 = isAuthEndpoint ? false : (options.retryOn429 ?? (method === 'GET'));
  let attempt = 0;

  while (true) {
    const response = await fetch(url, { method, headers, body });
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (response.ok) {
      return payload;
    }

    if (response.status === 401) {
      clearToken();
      clearUser();
    }

    if (response.status === 429 && retryOn429 && attempt < maxRetries) {
      const retryAfter = Number.parseInt(response.headers.get('retry-after') || '0', 10);
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 500 * 2 ** attempt;
      attempt += 1;
      await sleep(waitMs);
      continue;
    }

    const message =
      isJson && payload && payload.message
        ? payload.message
        : `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
}

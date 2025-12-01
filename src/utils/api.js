const inferDefaultBase = () => {
  if (import.meta?.env?.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  // Prefer local API while developing if the app is served from localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  return 'https://doorspital-backend.onrender.com';
};

export const API_BASE_URL = inferDefaultBase();

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export const getAdminToken = () =>
  (typeof window !== 'undefined' && window.localStorage.getItem('adminToken')) ||
  import.meta?.env?.VITE_ADMIN_TOKEN ||
  '';

export const setAdminToken = (token) => {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage.removeItem('adminToken');
    return;
  }
  window.localStorage.setItem('adminToken', token);
};

const isJsonContentType = (headers) => {
  const contentType = headers['Content-Type'] || headers['content-type'];
  return contentType && contentType.toLowerCase().includes('application/json');
};

export const apiRequest = async (path, options = {}) => {
  const { method = 'GET', headers = {}, body, ...rest } = options;
  const finalHeaders = { Accept: 'application/json', ...headers };
  const token = getAdminToken();

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let finalBody = body;
  if (body && !(body instanceof FormData) && !isJsonContentType(finalHeaders)) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(buildApiUrl(path), {
    method,
    headers: finalHeaders,
    body: finalBody,
    ...rest
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (payload && payload.message) ||
      (typeof payload === 'string' ? payload : 'Request failed');

    if (response.status === 401 || response.status === 403) {
      // Clear token so the UI can force re-auth
      setAdminToken('');
    }
    throw new Error(message);
  }

  return payload;
};

export const pickList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const candidates = [
    payload.data,
    payload.items,
    payload.orders,
    payload.results,
    payload.verifications,
    payload.products,
    payload.docs,
    payload.data?.items // nested items inside data
  ];
  const list = candidates.find((c) => Array.isArray(c));
  return Array.isArray(list) ? list : [];
};

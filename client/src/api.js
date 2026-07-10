const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function getToken() {
  return localStorage.getItem('prepdeck_token');
}
export function setToken(token) {
  if (token) localStorage.setItem('prepdeck_token', token);
  else localStorage.removeItem('prepdeck_token');
}
export function getStoredEmail() {
  return localStorage.getItem('prepdeck_email') || '';
}
export function setStoredEmail(email) {
  if (email) localStorage.setItem('prepdeck_email', email);
  else localStorage.removeItem('prepdeck_email');
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong.');
    err.status = res.status;
    throw err;
  }
  return data;
}

// Auth
export function register(email, password) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export function login(email, password) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

// Items (screenshots | notes | videos | links)
export function fetchItems(space) {
  return request(`/api/items/${space}`);
}
export function createItem(space, { title, body, url }, file) {
  if (space === 'screenshots') {
    const form = new FormData();
    form.append('title', title);
    if (file) form.append('file', file);
    return request(`/api/items/${space}`, { method: 'POST', body: form });
  }
  return request(`/api/items/${space}`, {
    method: 'POST',
    body: JSON.stringify({ title, body, url })
  });
}
export function removeItem(space, id) {
  return request(`/api/items/${space}/${id}`, { method: 'DELETE' });
}
export function imageUrl(imgPath) {
  return `${API_BASE}${imgPath}`;
}

// Timeline
export function fetchTasks() {
  return request('/api/timeline');
}
export function createTask({ title, when, tag }) {
  return request('/api/timeline', { method: 'POST', body: JSON.stringify({ title, when, tag }) });
}
export function patchTask(id, fields) {
  return request(`/api/timeline/${id}`, { method: 'PATCH', body: JSON.stringify(fields) });
}
export function removeTask(id) {
  return request(`/api/timeline/${id}`, { method: 'DELETE' });
}

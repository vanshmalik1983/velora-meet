const BASE = import.meta.env.VITE_API_URL || '/api';

const request = async (url, options = {}) => {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const authAPI = {
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token) =>
    request('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
};

export const roomAPI = {
  create: (name, token) =>
    request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { Authorization: `Bearer ${token}` },
    }),
  get: (roomId, token) =>
    request(`/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } }),
  list: (token) =>
    request('/rooms', { headers: { Authorization: `Bearer ${token}` } }),
};

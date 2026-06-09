import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL       = __DEV__ ? 'https://airy-solace-developement.up.railway.app' : 'https://www.liquidplus.fr';
export const OAUTH_BASE_URL = __DEV__ ? 'https://airy-solace-developement.up.railway.app' : 'https://www.liquidplus.fr';

const TOKEN_KEY = 'auth_token';
const STARTUP_TOKEN_KEY = 'startup_token';

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

function extractCookie(headers, name) {
  const setCookie = headers.get('set-cookie') || headers.map?.['set-cookie'] || '';
  if (!setCookie) return null;
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const cookie of cookies) {
    const match = cookie.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}`, Cookie: `auth_token=${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  // Save token from JSON body (mobile) or Set-Cookie header (web)
  if (data.token) await setToken(data.token);
  else {
    const cookieToken = extractCookie(res.headers, 'auth_token');
    if (cookieToken) await setToken(cookieToken);
  }

  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }

  return data;
}

// Auth
export const authAPI = {
  register: (email, password, full_name) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: async () => {
    await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    await clearToken();
  },

  me: () => request('/api/auth/me'),
};

// Auth Google mobile : envoie l'access_token Google au serveur, reçoit un JWT LIQUID+
export async function googleAuth(jwtToken) {
  // jwtToken is our own JWT (from liquidplus://auth?token=...), not a Google token
  await setToken(jwtToken);
  const data = await request('/api/auth/me');
  return { user: data.user };
}

// Profile
export const profileAPI = {
  update: (full_name, email) =>
    request('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ full_name, email }) }),
};

// 2FA
export const twoFAAPI = {
  status:  () => request('/api/auth/2fa/status'),
  setup:   () => request('/api/auth/2fa/setup', { method: 'POST' }),
  confirm: (code) => request('/api/auth/2fa/confirm', { method: 'POST', body: JSON.stringify({ code }) }),
  disable: () => request('/api/auth/2fa', { method: 'DELETE' }),
};

// Startups catalog
export const startupsAPI = {
  getAll: () => request('/api/startups'),
};

// Investments
export const investmentsAPI = {
  getAll: () => request('/api/investments'),
};

// News
export const newsAPI = {
  getAll: () => request('/api/news'),
};

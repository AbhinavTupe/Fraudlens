const TOKEN_KEY = 'fraudlens_token';
const USER_KEY = 'fraudlens_user';

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
};

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeSession(token: string, user: AuthUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

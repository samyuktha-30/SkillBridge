import type { AuthUser } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'sb_access_token';
const REFRESH_TOKEN_KEY = 'sb_refresh_token';
const USER_KEY = 'sb_user';
const THEME_KEY = 'sb_theme';

export const sessionStore = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setSession(accessToken: string, refreshToken: string, user: AuthUser, rememberMe = true) {
    const target = rememberMe ? localStorage : sessionStorage;
    const other = rememberMe ? sessionStorage : localStorage;
    other.removeItem(ACCESS_TOKEN_KEY);
    other.removeItem(REFRESH_TOKEN_KEY);
    other.removeItem(USER_KEY);

    target.setItem(ACCESS_TOKEN_KEY, accessToken);
    target.setItem(REFRESH_TOKEN_KEY, refreshToken);
    target.setItem(USER_KEY, JSON.stringify(user));
  },

  updateTokens(accessToken: string, refreshToken: string) {
    const useLocal = Boolean(localStorage.getItem(REFRESH_TOKEN_KEY));
    const target = useLocal ? localStorage : sessionStorage;
    target.setItem(ACCESS_TOKEN_KEY, accessToken);
    target.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  updateUser(user: AuthUser) {
    const useLocal = Boolean(localStorage.getItem(USER_KEY));
    const target = useLocal ? localStorage : sessionStorage;
    target.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    [localStorage, sessionStorage].forEach((store) => {
      store.removeItem(ACCESS_TOKEN_KEY);
      store.removeItem(REFRESH_TOKEN_KEY);
      store.removeItem(USER_KEY);
    });
  },

  getThemeMode(): 'light' | 'dark' {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  },

  setThemeMode(mode: 'light' | 'dark') {
    localStorage.setItem(THEME_KEY, mode);
  },
};

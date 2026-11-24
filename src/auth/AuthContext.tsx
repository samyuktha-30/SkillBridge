import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import type { AuthResponse, AuthUser } from '../types/auth.types';
import { sessionStore } from './sessionStorage';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  loginWithResponse: (auth: AuthResponse, rememberMe?: boolean) => void;
  updateCurrentUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => sessionStore.getUser());
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>(() => sessionStore.getThemeMode());

  const setThemeMode = useCallback((mode: 'light' | 'dark') => {
    sessionStore.setThemeMode(mode);
    setThemeModeState(mode);
  }, []);

  const loginWithResponse = useCallback((auth: AuthResponse, rememberMe = true) => {
    sessionStore.setSession(auth.accessToken, auth.refreshToken, auth.user, rememberMe);
    setUser(auth.user);
  }, []);

  const updateCurrentUser = useCallback((nextUser: AuthUser) => {
    sessionStore.updateUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = sessionStore.getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Clear local session regardless of network reachability on sign-out
    } finally {
      sessionStore.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      sessionStore.clear();
      setUser(null);
    };
    window.addEventListener('skillbridge:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('skillbridge:unauthorized', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && sessionStore.getAccessToken()),
        themeMode,
        setThemeMode,
        loginWithResponse,
        updateCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

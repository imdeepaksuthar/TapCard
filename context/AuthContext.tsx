'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, RegisterPayload, AuthResponse } from '../types/auth';
import { apiFetch } from '../lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On public auth pages, skip token check entirely.
    // The server-side middleware already redirects logged-in users away from these pages.
    const isAuthPage = typeof window !== 'undefined' &&
      (window.location.pathname === '/login' || window.location.pathname === '/register');

    if (isAuthPage) {
      setIsLoading(false);
      return;
    }

    let storedToken = localStorage.getItem('card-setu-token');

    // Fallback to reading the token from cookies if localStorage is empty
    if (!storedToken && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )card-setu-token=([^;]*)/);
      if (match && match[1]) {
        storedToken = match[1];
        // Resync localStorage
        localStorage.setItem('card-setu-token', storedToken);
      }
    }

    if (storedToken) {
      setToken(storedToken);
      rehydrateUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const rehydrateUser = async () => {
    try {
      const data = await apiFetch<{ user: User }>('/api/user');
      setUser(data.user);
    } catch (error: any) {
      if (error?.status === 401) {
        console.warn('Session expired or invalid token. Redirecting to login.');
      } else {
        console.error('Failed to rehydrate user:', error?.message || 'Unknown error');
      }
      localStorage.removeItem('card-setu-token');
      document.cookie = 'card-setu-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any) => {
    const data = await apiFetch<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    localStorage.setItem('card-setu-token', data.token);
    document.cookie = `card-setu-token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
    setToken(data.token);
    setUser(data.user);
    router.push('/dashboard');
  };

  const register = async (payload: RegisterPayload) => {
    await apiFetch<any>('/api/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    // Registration now requires email verification before login
    router.push('/verify-email?email=' + encodeURIComponent(payload.email));
  };

  const logout = async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } catch (e) {
      // Ignore error if already logged out on server
    }
    localStorage.removeItem('card-setu-token');
    document.cookie = 'card-setu-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

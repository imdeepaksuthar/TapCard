'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, RegisterPayload, AuthResponse } from '../types/auth';
import { apiFetch } from '../lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isAuthPage = typeof window !== 'undefined' &&
      (window.location.pathname === '/login' || window.location.pathname === '/register');

    if (isAuthPage) {
      setIsLoading(false);
      return;
    }

    rehydrateUser();
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
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch the current user so context-driven UI (sidebar, header) reflects
  // profile edits without a full page reload.
  const refreshUser = async () => {
    try {
      const data = await apiFetch<{ user: User }>('/api/user');
      setUser(data.user);
    } catch {
      // Leave the existing user in place on a transient failure.
    }
  };

  const login = async (credentials: any) => {
    const data = await apiFetch<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      localStorage.setItem('card-setu-token', data.token);
      document.cookie = `card-setu-token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
    }
    
    setUser(data.user);
    router.push('/dashboard');
  };

  const register = async (payload: RegisterPayload) => {
    await apiFetch<any>('/api/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    router.push('/login?email=' + encodeURIComponent(payload.email) + '&registered=true');
  };

  const logout = async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } catch (e) {
      // Ignore error if already logged out on server
    }
    localStorage.removeItem('card-setu-token');
    document.cookie = 'card-setu-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading }}>
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

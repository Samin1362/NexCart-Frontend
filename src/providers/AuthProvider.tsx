'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/firebase.config';
import api from '@/lib/api';
import { setTokens, clearTokens, getAccessToken } from '@/lib/auth';
import { IUser } from '@/types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: IUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/users/me');
      setUser(data.data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setTokens(data.data.accessToken, data.data.refreshToken);
    setUser(data.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setTokens(data.data.accessToken, data.data.refreshToken);
    setUser(data.data.user);
  };

  const googleLogin = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const { data } = await api.post('/auth/google', { idToken });
    setTokens(data.data.accessToken, data.data.refreshToken);
    setUser(data.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const updateUser = (updatedUser: IUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

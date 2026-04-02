import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from './api';

export interface User {
  id: string;
  email: string;
  role: 'landlord' | 'tenant' | 'agent';
  first_name: string;
  last_name: string;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'landlord' | 'tenant' | 'agent';
  first_name: string;
  last_name: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .post<{ accessToken: string; user: User }>('/api/auth/refresh')
      .then(({ data }) => {
        setAuthToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {
        // No valid refresh token — user is not logged in
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const { data } = await api.post<{ accessToken: string; user: User }>('/api/auth/login', {
      email,
      password,
    });
    setAuthToken(data.accessToken);
    setUser(data.user);
  }

  async function register(input: RegisterData): Promise<void> {
    const { data } = await api.post<{ accessToken: string; user: User }>(
      '/api/auth/register',
      input
    );
    setAuthToken(data.accessToken);
    setUser(data.user);
  }

  async function logout(): Promise<void> {
    await api.post('/api/auth/logout').catch(() => {});
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

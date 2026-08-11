import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export type UserRole = 'COLLECTOR' | 'WHOLESALER' | 'DISTRIBUTOR' | 'MANUFACTURER' | 'EXPERT' | 'ADMIN';

export interface UserProfile {
  participantId: string;
  name: string;
  email: string;
  role: UserRole;
  organizationName: string;
  location: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ayurverify_token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to load user profile, clearing session.', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('ayurverify_token', response.accessToken);
      setToken(response.accessToken);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ayurverify_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

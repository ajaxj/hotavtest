import { useState, useEffect, type ReactNode } from 'react';
import { authService } from '@/lib/auth';
import { AuthContext, type AuthContextType } from './AuthContext';
import type { Auth, LoginRequest } from "@/types"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = authService.getAuth();
      if (storedAuth && !authService.isTokenExpired()) {
        setAuth(storedAuth);
      } else {
        authService.clearAuth();
        setAuth(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const authData = await authService.login(credentials);
    setAuth(authData);
  };

  const logout = () => {
    authService.logout();
    setAuth(null);
  };

  const value: AuthContextType = {
    auth,
    isAuthenticated: !!auth && !authService.isTokenExpired(),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

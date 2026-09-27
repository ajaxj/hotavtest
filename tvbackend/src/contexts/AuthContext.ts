import { createContext } from 'react';
import type { Auth, LoginRequest } from "@/types"

export interface AuthContextType {
  auth: Auth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

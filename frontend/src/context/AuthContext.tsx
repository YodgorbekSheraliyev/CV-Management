import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../models";
import { UserRole } from "../enums/enums";
import type { CommonResponse } from "../api/axios";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

interface DecodedType {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": UserRole;
  exp: number;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (creds: { email: string; password: string }) => Promise<string>;
  register: (creds: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<string>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function isExpired(decoded: DecodedType): boolean {
  return Date.now() >= decoded.exp * 1000;
}

function userFromToken(decoded: DecodedType): User {
  return {
    id: Number(
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
    ),
    email:
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ],
    role: decoded[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ],
    firstName: "",
    lastName: "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedType>(token);

      if (isExpired(decoded)) {
        localStorage.removeItem(TOKEN_KEY);
        setIsLoading(false);
        return;
      }

      // Synchronous, no network call — this is what makes refresh instant.
      setUser(userFromToken(decoded));
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const response = await api.post<CommonResponse<string>>("/auth/login", {
      email,
      password,
    });
    const token = response.data.data!;
    const decoded = jwtDecode<DecodedType>(token);

    localStorage.setItem(TOKEN_KEY, token);
    setUser(userFromToken(decoded));
    setIsAuthenticated(true);

    return token;
  };

  const register = async (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post<CommonResponse<string>>(
      "/auth/register",
      input,
    );
    const token = response.data.data!;
    const decoded = jwtDecode<DecodedType>(token);

    localStorage.setItem(TOKEN_KEY, token);
    setUser(userFromToken(decoded));
    setIsAuthenticated(true);

    return token;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, isLoading, login, register, logout }),
    [user, isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

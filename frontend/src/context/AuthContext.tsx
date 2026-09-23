import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { User } from "../models";
import { UserRole } from "../enums/enums";
import type { CommonResponse } from "../api/axios";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { getUser } from "../api/userApi";
import { convertRoleToEnum } from "../utils";

const TOKEN_KEY = "token";

interface DecodedType {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": UserRole;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  idToken: string;
  role: UserRole;
}

export interface AuthContextValue {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (creds: { email: string; password: string }) => Promise<string>;
  register: (creds: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<string>;
  logout: () => void;
  googleAuth: (idToken: string, role?: UserRole) => Promise<any>;
  facebookAuth: (accessToken: string, role?: UserRole) => Promise<any>;
}

export const AuthContext = createContext<AuthContextValue>(undefined!);

function isExpired(decoded: DecodedType): boolean {
  return Date.now() >= decoded.exp * 1000;
}

function getUserIdFromToken(decoded: DecodedType): number {
  return Number(
    decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ],
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedType>(token);

        if (isExpired(decoded)) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        const userId = getUserIdFromToken(decoded);
        const currentUser = await getUser(userId);

        setUser(currentUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
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

    const userId = getUserIdFromToken(decoded);
    const currentUser = await getUser(userId);

    setUser(currentUser);
    setIsAuthenticated(true);

    return token;
  };

  const googleAuth = async (idToken: string, role?: UserRole) => {
    const response = await api.post<CommonResponse<string>>("/auth/google", {
      idToken,
      role: role && convertRoleToEnum(role),
    });

    const token = response.data.data!;
    const decoded = jwtDecode<DecodedType>(token);
    localStorage.setItem(TOKEN_KEY, token);
    const userId = getUserIdFromToken(decoded);
    const currentUser = await getUser(userId);

    setUser(currentUser);
    setIsAuthenticated(true);

    return token;
  };

  const facebookAuth = async (accessToken: string, role?: UserRole) => {
    const response = await api.post<CommonResponse<string>>("/auth/facebook", {
      accessToken,
      role: role && convertRoleToEnum(role!),
    });

    const token = response.data.data!;
    const decoded = jwtDecode<DecodedType>(token);
    localStorage.setItem(TOKEN_KEY, token);
    const userId = getUserIdFromToken(decoded);
    const currentUser = await getUser(userId);

    setUser(currentUser);
    setIsAuthenticated(true);

    return token;
  };

  const register = async (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    const response = await api.post<CommonResponse<string>>("/auth/register", {
      ...input,
      role: convertRoleToEnum(input.role),
    });
    const token = response.data.data!;
    const decoded = jwtDecode<DecodedType>(token);

    localStorage.setItem(TOKEN_KEY, token);

    const userId = getUserIdFromToken(decoded);
    const currentUser = await getUser(userId);

    setUser(currentUser);
    setIsAuthenticated(true);

    return token;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      setUser,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      googleAuth,
      facebookAuth,
    }),
    [user, isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

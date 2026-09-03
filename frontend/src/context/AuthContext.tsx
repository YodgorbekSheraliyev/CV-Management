import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { User } from "../models";
import type { UserRole } from "../enums/enums";
import type { CommonResponse } from "../api/axios";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { getUser } from "../api/userApi";

const TOKEN_KEY = "token";

interface DecodedType {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": UserRole;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<string>;
  register: ({
    firstName,
    lastName,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<string>;

  logout: () => void;
}
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedType>(token);

        const userId = Number(
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ],
        );

        const currentUser = await getUser(userId);

        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to restore authentication:", error);

        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreUser();
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

    const token = response.data.data;
    const decoded = jwtDecode<DecodedType>(token);

    localStorage.setItem(TOKEN_KEY, token);
    const res = await getUser(
      Number(
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      ),
    );
    setUser(res);
    setIsAuthenticated(true);

    return token;
  };

  const register = async ({
    firstName,
    lastName,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post<CommonResponse<string>>("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });

    const token = response.data.data;
    localStorage.setItem(TOKEN_KEY, token);

    const decoded = jwtDecode<DecodedType>(token);

    const currentUser = await getUser(
      Number(
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      ),
    );

    setUser(currentUser);
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
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { useState } from "react";
import api, { type CommonResponse } from "../api/axios";

const TOKEN_KEY = "token";

export function useAuth() {
  const [error, setError] = useState<string>("");
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
    localStorage.setItem(TOKEN_KEY, token);
    return response.data.data;
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
    return token;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/login";
  };

  return { login, register, logout, error, setError };
}

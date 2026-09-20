import axios, { AxiosError } from "axios";
import i18n from "../i18n";

const API = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "token";

const api = axios.create({
  baseURL: API,
});

export interface CommonResponse<T> {
  status: boolean;
  data: T;
  error: string;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.params = {
    ...config.params,
    lang: i18n.language,
  };

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<CommonResponse<unknown>>) => {
    if (!error.response) {
      throw new Error(i18n.t("common.serverUnavailable"));
    }
    throw new Error(error.response?.data.error);
  },
);

export default api;

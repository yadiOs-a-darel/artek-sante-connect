import axios from "axios";
import Constants from "expo-constants";
import { useAuthStore } from "@/store/auth.store";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          await useAuthStore.getState().setAuth(
            data.access_token,
            data.refresh_token,
            useAuthStore.getState().role || "patient"
          );
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          await useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  }
);

export { API_URL };

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔥 Request Interceptor: Add JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 Response Interceptor: Auto-logout on 401 Invalid/Expired Token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 SURGICAL FIX: Agar error login route se aaya hai, toh reload mat karo
    const isLoginRoute = error.config?.url?.includes("/login");

    if (error.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Force redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

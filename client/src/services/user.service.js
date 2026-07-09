import { api } from "./api";

export const userService = {
  getProfile: async () => {
    // 🔥 FIX: Your controller exports 'getMe', assuming route is /api/auth/me
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

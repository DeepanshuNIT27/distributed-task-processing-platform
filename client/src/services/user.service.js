import { api } from "./api";

export const userService = {
  getProfile: async () => {
    // 🔥 FIX: Your controller exports 'getMe', assuming route is /api/auth/me
    const response = await api.get("/api/auth/me");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put("/api/auth/profile", data);
    return response.data;
  },
  // 🔥 SURGICAL STRIKE: Delete account API call
  deleteAccount: async () => {
    const response = await api.delete("/api/auth/account");
    return response.data;
  },
};

import { api } from "./api";

export const authService = {
  registerUser: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },

  loginUser: async (userData) => {
    const response = await api.post("/api/auth/login", userData);
    return response.data;
  },
};

import { api } from "./api";

export const dashboardService = {
  async getStats() {
    const { data } = await api.get("/api/dashboard/stats");
    return data;
  },

  async getRecentTasks() {
    const { data } = await api.get("/api/dashboard/recent");
    return data;
  },

  async getHealth() {
    const { data } = await api.get("/api/dashboard/health");
    return data;
  },
};

import { api } from "./api";

export const taskService = {
  getTasks: async () => {
    const response = await api.get("/api/tasks");
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  createTask: async (formData) => {
    // 🔥 FIX: Endpoint is /api/tasks/upload based on your router
    const response = await api.post("/api/tasks/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

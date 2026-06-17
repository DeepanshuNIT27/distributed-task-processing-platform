import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/dashboard`,
});

export const getStats = async () => {
  const { data } = await API.get("/stats");
  return data;
};

export const getRecentTasks = async () => {
  const { data } = await API.get("/recent");
  return data;
};

export const getHealth = async () => {
  const { data } = await API.get("/health");
  return data;
};

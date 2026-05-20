import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (email, password) => api.post("/api/auth/login", { email, password }),
};

export const activitiesAPI = {
  log: (data) => api.post("/api/activities", data),
  getList: (limit = 10) => api.get("/api/activities", { params: { limit } }),
  scan: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/activities/scan", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const statsAPI = {
  getStats: () => api.get("/api/stats"),
  getDashboard: () => api.get("/api/dashboard"),
};

export const leaderboardAPI = {
  get: (limit = 50) => api.get("/api/leaderboard", { params: { limit } }),
};

export const nudgesAPI = {
  getList: (limit = 5) => api.get("/api/nudges", { params: { limit } }),
  markRead: (nudgeId) => api.put(`/api/nudges/${nudgeId}`),
};

export const campusAPI = {
  getStats: () => api.get("/api/campus-stats"),
};

export const userAPI = {
  getProfile: () => api.get("/api/user/profile"),
};

export default api;

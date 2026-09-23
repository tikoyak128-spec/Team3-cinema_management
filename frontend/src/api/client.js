import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://team3-cinema-management.onrender.com/api";
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("khmer_cinema_user");
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore malformed storage
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export function buildFormData(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(`${key}[]`, v));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
}

export default api;
import axios from "axios";

// Default config
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

axiosApi.interceptors.response.use(
  (response) => {
    const authHeader = response.headers.authorization;
    if (authHeader) {
      localStorage.setItem("token", authHeader);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
    }
    return Promise.reject(error);
  }
);

export async function get(url: string, config = {}) {
  return await axiosApi.get(url, { ...config }).then((response) => response.data);
}

export async function post(url: string, data: any, config = {}) {
  return axiosApi
    .post(url, { ...data }, { ...config })
    .then((response) => response.data);
}

export async function put(url: string, data: any, config = {}) {
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then((response) => response.data);
}

export async function del(url: string, config = {}) {
  return await axiosApi
    .delete(url, { ...config })
    .then((response) => response.data);
}

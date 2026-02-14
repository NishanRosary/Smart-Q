import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true // Required for refresh cookie
});

// Attach access token manually when available
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// Auto-refresh when access token expires
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await API.post("/auth/admin/refresh");
        const newToken = res.data.accessToken;

        setAuthToken(newToken);

        error.config.headers["Authorization"] = `Bearer ${newToken}`;
        return API(error.config);
      } catch (refreshError) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export const loginAdmin = async (email, password) => {
  const response = await API.post("/auth/admin/login", {
    email,
    password
  });

  return response.data;
};


export default API;

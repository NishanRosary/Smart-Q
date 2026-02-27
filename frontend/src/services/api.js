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
    const originalRequest = error.config || {};
    const requestUrl = String(originalRequest.url || "");
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/admin/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/otp") ||
      requestUrl.includes("/otp/");

    // Let login/register errors pass through so UI can show exact backend messages
    // like "Invalid credentials" instead of redirecting.
    if (error.response?.status === 401 && !isAuthRequest) {
      try {
        const res = await API.post("/auth/admin/refresh");
        const newToken = res.data.accessToken;

        setAuthToken(newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        setAuthToken(null);
        localStorage.removeItem("token");
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

  // Normalize backend response shape for admin UI compatibility.
  return {
    ...response.data,
    accessToken: response.data?.accessToken || response.data?.token
  };
};

export const registerCustomer = async ({ name, email, mobile, password }) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    phone: mobile,
    password
  });
  return response.data;
};

export const loginCustomer = async ({ emailOrPhone, password }) => {
  const response = await API.post("/auth/login", {
    emailOrPhone,
    password
  });
  return {
    ...response.data,
    accessToken: response.data?.accessToken || response.data?.token
  };
};

export const changeAdminPassword = async ({ currentPassword, newPassword }) => {
  const response = await API.put("/auth/admin/change-password", {
    currentPassword,
    newPassword
  });
  return response.data;
};

export const sendCustomerLoginOtp = async (email) => {
  const response = await API.post("/otp/send-otp", { email });
  return response.data;
};

export const verifyCustomerLoginOtp = async ({ email, otp }) => {
  const response = await API.post("/otp/verify-otp", { email, otp });
  return {
    ...response.data,
    accessToken: response.data?.accessToken || response.data?.token
  };
};

export const getEventById = async (eventId) => {
  const response = await API.get("/events");
  const events = Array.isArray(response.data) ? response.data : [];
  return (
    events.find((event) => String(event.id || event._id) === String(eventId)) ||
    null
  );
};

export const checkBackendHealth = async () => {
  const response = await API.get("/health");
  return response.data;
};


export default API;

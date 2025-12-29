import { API_BASE_URL } from "../config/api";

export const checkBackendHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.json();
};
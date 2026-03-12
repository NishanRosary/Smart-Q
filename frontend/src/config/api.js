const normalizeBaseUrl = (value) => String(value || "").replace(/\/$/, "");

const localApiBaseUrl = "http://localhost:5000";
const envApiBaseUrl =
  typeof process !== "undefined" && process?.env?.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "";
const configuredApiBaseUrl = normalizeBaseUrl(envApiBaseUrl);

export const API_BASE_URL = configuredApiBaseUrl || localApiBaseUrl;

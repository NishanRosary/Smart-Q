const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getConfiguredApiBaseUrl = () => {
  const runtimeUrl =
    typeof window !== "undefined" ? window.__SMARTQ_API_URL__ : "";
  const buildUrl =
    typeof process !== "undefined" ? process.env.REACT_APP_API_URL : "";
  const configuredUrl = trimTrailingSlash(runtimeUrl || buildUrl);

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }

    return trimTrailingSlash(origin);
  }

  return "http://localhost:5000";
};

export const API_BASE_URL = getConfiguredApiBaseUrl();

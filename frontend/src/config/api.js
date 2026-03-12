const normalizeBaseUrl = (value) => String(value || "").replace(/\/+$/, "");

const isLocalHost = (hostname) =>
  hostname === "localhost" || hostname === "127.0.0.1";

const getConfiguredApiBaseUrl = () => {
  const runtimeUrl =
    typeof window !== "undefined"
      ? window.__SMARTQ_API_URL__ ||
        window.__SMARTQ_API_BASE_URL__ ||
        document.querySelector('meta[name="smartq-api-base-url"]')?.content
      : "";
  const buildUrl =
    typeof process !== "undefined" ? process.env.REACT_APP_API_URL : "";

  return normalizeBaseUrl(runtimeUrl || buildUrl);
};

const getApiBaseUrl = () => {
  const configuredBaseUrl = getConfiguredApiBaseUrl();

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const { protocol, hostname, origin } = window.location;

  if (isLocalHost(hostname)) {
    return "http://localhost:5000";
  }

  return protocol === "https:" ? normalizeBaseUrl(origin) : "http://localhost:5000";
};

const getMlBaseUrl = () => {
  const configuredMlUrl =
    typeof window !== "undefined"
      ? window.__SMARTQ_ML_BASE_URL__ ||
        document.querySelector('meta[name="smartq-ml-base-url"]')?.content
      : "";

  if (configuredMlUrl) {
    return normalizeBaseUrl(configuredMlUrl);
  }

  return "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();
export const ML_BASE_URL = getMlBaseUrl();

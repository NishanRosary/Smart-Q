const isLocalHost = (hostname) =>
  hostname === "localhost" || hostname === "127.0.0.1";

const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const { protocol, hostname, origin } = window.location;

  if (isLocalHost(hostname)) {
    return "http://localhost:5000";
  }

  const configuredBaseUrl =
    window.__SMARTQ_API_BASE_URL__ ||
    document.querySelector('meta[name="smartq-api-base-url"]')?.content;

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  return protocol === "https:" ? origin : "http://localhost:5000";
};

export const API_BASE_URL = getApiBaseUrl();

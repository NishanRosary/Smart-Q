export const getNextTheme = (theme) => (theme === "light" ? "dark" : "light");

export const applyThemePreference = (theme, storage = localStorage, root = document.documentElement) => {
  storage.setItem("smartq-theme", theme);
  root.setAttribute("data-theme", theme);
  return theme;
};

export const runHeaderLogout = ({ onLogout, onNavigate }) => {
  if (typeof onLogout === "function") {
    onLogout();
  }

  if (typeof onNavigate === "function") {
    onNavigate("login");
  }
};

export const getAdminLoginErrorMessage = (error) =>
  error?.response?.data?.message || "Login failed. Ensure Server is running";

export const applyAdminLoginSuccess = ({
  data,
  storage = localStorage,
  setAuthToken,
  onNavigate
}) => {
  if (!data?.accessToken) {
    throw new Error("Authentication token missing in login response");
  }

  storage.setItem("token", data.accessToken);

  if (typeof setAuthToken === "function") {
    setAuthToken(data.accessToken);
  }

  if (typeof onNavigate === "function") {
    onNavigate("admin-dashboard");
  }

  return data.accessToken;
};

export const updateSchedulerFormData = (prev, name, value) => {
  if (name === "organizationType") {
    return {
      ...prev,
      organizationType: value,
      doctorName: "",
      profession: "",
      hrOrPocName: ""
    };
  }

  return {
    ...prev,
    [name]: value
  };
};

export const addSchedulerService = (services, currentService) => {
  const normalized = String(currentService || "").trim();

  if (!normalized) {
    return services;
  }

  return [...services, normalized];
};

export const removeSchedulerService = (services, indexToRemove) =>
  services.filter((_, index) => index !== indexToRemove);

export const validateSchedulerForm = (formData) => {
  if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
    return "End date must be the same as or later than start date.";
  }

  if (
    formData.startDate &&
    formData.endDate &&
    formData.startDate === formData.endDate &&
    formData.startTime &&
    formData.endTime &&
    formData.endTime <= formData.startTime
  ) {
    return "End time must be later than start time for single-day events.";
  }

  if (formData.organizationType === "Hospital") {
    if (!String(formData.doctorName || "").trim() || !String(formData.profession || "").trim()) {
      return "Doctor Name and Profession are required for Hospital events.";
    }
  }

  if (formData.organizationType === "Interview" && !String(formData.hrOrPocName || "").trim()) {
    return "HR Name / POC Name is required for Interview events.";
  }

  return null;
};

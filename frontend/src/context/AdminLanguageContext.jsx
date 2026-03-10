import React, { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "smartq-admin-language";

const AdminLanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
});

export const AdminLanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "en"
  );

  const setLanguage = (nextLanguage) => {
    const normalized = nextLanguage === "ta" ? "ta" : "en";
    setLanguageState(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language]
  );

  return (
    <AdminLanguageContext.Provider value={value}>
      {children}
    </AdminLanguageContext.Provider>
  );
};

export const useAdminLanguage = () => useContext(AdminLanguageContext);


import React, { createContext, useContext, useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface BackendContextType {
  backendTarget: "local" | "remote";
  coreUrl: string;
  switchTarget: (target: "local" | "remote") => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendTarget, setBackendTarget] = useState<"local" | "remote">(() => {
    return (import.meta.env.VITE_BACKEND_TARGET as "local" | "remote") || "remote";
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const coreUrl = backendTarget === "local"
    ? (import.meta.env.VITE_LOCAL_CORE_URL || "http://localhost:5206")
    : (import.meta.env.VITE_REMOTE_CORE_URL || "https://synco-h4etbseqg4h2ewcw.swedencentral-01.azurewebsites.net");

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchTarget = (target: "local" | "remote") => {
    setBackendTarget(target);
    const isHy = typeof window !== "undefined" && localStorage.getItem("sinko_admin_lang") === "hy";
    const msg = isHy
      ? (target === "local" ? "Միացված է լոկալ սերվերին (:5206)" : "Միացված է ամպային Azure սերվերին")
      : (target === "local" ? "Switched to Local Backend (:5206)" : "Switched to Cloud Azure Backend");
    showToast(msg, "info");
  };

  return (
    <BackendContext.Provider value={{ backendTarget, coreUrl, switchTarget, toasts, showToast, removeToast }}>
      {children}
    </BackendContext.Provider>
  );
};

export const useBackend = () => {
  const ctx = useContext(BackendContext);
  if (!ctx) throw new Error("useBackend must be used within BackendProvider");
  return ctx;
};

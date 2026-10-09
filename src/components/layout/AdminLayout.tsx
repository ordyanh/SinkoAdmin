import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useBackend } from "../../context/BackendContext";
import { useTranslation } from "../../context/LanguageContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toasts, removeToast } = useBackend();
  const { t } = useTranslation();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/": return t.header.titles.dashboard;
      case "/registrations": return t.header.titles.registrations;
      case "/organizations": return t.header.titles.organizations;
      case "/users": return t.header.titles.users;
      case "/subscriptions": return t.header.titles.subscriptions;
      case "/orders": return t.header.titles.orders;
      case "/catalog": return t.header.titles.catalog;
      case "/requests": return t.header.titles.requests;
      case "/settings": return t.header.titles.settings;
      case "/notifications": return t.header.titles.notifications;
      case "/audit": return t.header.titles.audit;
      default: return t.nav.brandSub;
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 size={18} color="#34d399" />;
      case "error": return <AlertCircle size={18} color="#f87171" />;
      case "warning": return <AlertTriangle size={18} color="#fbbf24" />;
      default: return <Info size={18} color="#38bdf8" />;
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className={`admin-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          title={getPageTitle(location.pathname)}
        />

        <main className="content-container">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {getToastIcon(toast.type)}
            <div style={{ flex: 1 }}>{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: "currentColor", opacity: 0.7, padding: "2px" }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Menu,
  Search,
  Server,
  Cloud,
  ShieldCheck,
  RefreshCw,
  Globe,
} from "lucide-react";
import { useBackend } from "../../context/BackendContext";
import { useTranslation } from "../../context/LanguageContext";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { Button } from "../common/Button";

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  title,
  onRefresh,
}) => {
  const { backendTarget, switchTarget } = useBackend();
  const { language, setLanguage, t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global hotkey Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="top-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            variant="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={t.header.toggleSidebar}
          >
            <Menu size={18} />
          </Button>

          <h2 style={{ fontSize: "17px", fontWeight: 600 }}>{title || t.header.titles.dashboard}</h2>
        </div>

        {/* Center: Search pill */}
        <div
          onClick={() => setSearchOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-full)",
            padding: "6px 16px",
            cursor: "pointer",
            width: "320px",
            transition: "border-color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
        >
          <Search size={15} color="var(--text-muted)" />
          <span style={{ fontSize: "13px", color: "var(--text-muted)", flex: 1 }}>
            {t.header.searchPlaceholder}
          </span>
          <kbd style={{
            fontSize: "10.5px",
            background: "var(--bg-surface)",
            padding: "2px 6px",
            borderRadius: "4px",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
          }}>
            {t.header.hotkey}
          </kbd>
        </div>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Language Switcher */}
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "var(--bg-input)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-full)",
            padding: "3px 4px",
            gap: "2px"
          }}>
            <button
              onClick={() => setLanguage("hy")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                fontSize: "12px",
                fontWeight: 600,
                color: language === "hy" ? "#ffffff" : "var(--text-muted)",
                background: language === "hy" ? "var(--primary)" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              🇦🇲 ՀԱՅ
            </button>
            <button
              onClick={() => setLanguage("en")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                fontSize: "12px",
                fontWeight: 600,
                color: language === "en" ? "#ffffff" : "var(--text-muted)",
                background: language === "en" ? "var(--primary)" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              🇬🇧 ENG
            </button>
          </div>

          {onRefresh && (
            <Button
              variant="icon"
              onClick={onRefresh}
              title={t.header.refreshTooltip}
              style={{ width: "34px", height: "34px" }}
            >
              <RefreshCw size={15} />
            </Button>
          )}

          {/* Backend target pill */}
          <div
            onClick={() => switchTarget(backendTarget === "local" ? "remote" : "local")}
            title={t.header.switchBackendTooltip}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              background: backendTarget === "local" ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)",
              border: `1px solid ${backendTarget === "local" ? "rgba(16, 185, 129, 0.4)" : "rgba(37, 99, 235, 0.4)"}`,
              color: backendTarget === "local" ? "#34d399" : "#60a5fa",
              transition: "all 0.15s ease",
            }}
          >
            {backendTarget === "local" ? <Server size={14} /> : <Cloud size={14} />}
            <span>{backendTarget === "local" ? t.header.localBadge : t.header.remoteBadge}</span>
          </div>

          {/* Current User Badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "4px 10px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)"
          }}>
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-full)",
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <ShieldCheck size={16} color="#ffffff" />
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>admin@synco.am</div>
              <div style={{ fontSize: "10.5px", color: "#60a5fa" }}>{t.header.adminRole}</div>
            </div>
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

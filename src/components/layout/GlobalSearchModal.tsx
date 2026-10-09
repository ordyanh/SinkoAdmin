import React, { useState, useEffect } from "react";
import { Search, X, Building2, User, ShoppingBag, Package, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminService";
import { AdminSearchResultItem } from "../../types/admin";
import { Spinner } from "../common/Spinner";
import { useTranslation } from "../../context/LanguageContext";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        try {
          setLoading(true);
          const res = await adminApi.globalSearch(query.trim());
          setResults(res.results || []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "organization": return <Building2 size={16} color="#60a5fa" />;
      case "user": return <User size={16} color="#a78bfa" />;
      case "order": return <ShoppingBag size={16} color="#34d399" />;
      case "product": return <Package size={16} color="#fbbf24" />;
      default: return <Search size={16} color="var(--text-muted)" />;
    }
  };

  const handleSelect = (item: AdminSearchResultItem) => {
    onClose();
    const type = item.entityType.toLowerCase();
    if (type.includes("org")) navigate(`/organizations?id=${item.id}`);
    else if (type.includes("reg")) navigate(`/registrations?id=${item.id}`);
    else if (type.includes("user")) navigate(`/users?id=${item.id}`);
    else if (type.includes("order")) navigate(`/orders?id=${item.id}`);
    else if (type.includes("prod")) navigate(`/catalog?id=${item.id}`);
    else navigate(item.deepLink || "/");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "620px", marginTop: "80px", alignSelf: "flex-start" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-input)"
        }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={t.globalSearch.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-main)",
              fontSize: "15px"
            }}
          />
          {loading && <Spinner size={18} />}
          <button onClick={onClose} style={{ color: "var(--text-muted)", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "8px" }}>
          {results.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13.5px" }}>
              {query.trim().length < 2 ? t.globalSearch.minCharsHint : t.globalSearch.noResults}
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  gap: "12px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-subtle)"
                  }}>
                    {getEntityIcon(item.entityType)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {item.status && (
                    <span className="badge badge-neutral" style={{ fontSize: "11px" }}>{item.status}</span>
                  )}
                  <ExternalLink size={14} color="var(--text-muted)" />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-sidebar)",
          fontSize: "11.5px",
          color: "var(--text-muted)",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>{t.globalSearch.navHint}</span>
          <span>{t.globalSearch.escHint}</span>
        </div>
      </div>
    </div>
  );
};

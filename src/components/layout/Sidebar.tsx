import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Building2,
  Users,
  CreditCard,
  ShoppingBag,
  Tag,
  FileCheck2,
  Sliders,
  BellRing,
  History,
  Shield,
  Layers,
} from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { t } = useTranslation();

  const navItems = [
    { section: t.nav.sectionMain },
    { to: "/", icon: <LayoutDashboard size={18} />, label: t.nav.dashboard },
    { to: "/registrations", icon: <UserPlus size={18} />, label: t.nav.registrations },
    { to: "/organizations", icon: <Building2 size={18} />, label: t.nav.organizations },
    { to: "/users", icon: <Users size={18} />, label: t.nav.users },
    { section: t.nav.sectionCommerce },
    { to: "/subscriptions", icon: <CreditCard size={18} />, label: t.nav.subscriptions },
    { to: "/orders", icon: <ShoppingBag size={18} />, label: t.nav.orders },
    { to: "/catalog", icon: <Tag size={18} />, label: t.nav.catalog },
    { section: t.nav.sectionSystem },
    { to: "/requests", icon: <FileCheck2 size={18} />, label: t.nav.requests },
    { to: "/settings", icon: <Sliders size={18} />, label: t.nav.settings },
    { to: "/notifications", icon: <BellRing size={18} />, label: t.nav.notifications },
    { to: "/audit", icon: <History size={18} />, label: t.nav.audit },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-md)",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 12px rgba(37, 99, 235, 0.4)",
          flexShrink: 0
        }}>
          <Shield size={20} color="#ffffff" />
        </div>
        {!collapsed && (
          <div style={{ lineHeight: 1.2 }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              S I N K O
            </div>
            <div style={{ fontSize: "10px", color: "#60a5fa", fontWeight: 600, letterSpacing: "0.08em" }}>
              {t.nav.brandSub}
            </div>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <div className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.section) {
            if (collapsed) return null;
            return (
              <div key={idx} className="nav-section-title">
                {item.section}
              </div>
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.to!}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(7, 13, 24, 0.6)",
          fontSize: "11.5px",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Layers size={14} color="var(--primary-light)" />
          <span>{t.nav.apiInfo}</span>
        </div>
      )}
    </aside>
  );
};

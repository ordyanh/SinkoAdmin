import React, { useEffect, useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  CreditCard,
  ShoppingBag,
  Clock,
  AlertTriangle,
  TrendingUp,
  PackageCheck,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminService";
import { AdminDashboardSummaryResponse } from "../types/admin";
import { Card } from "../components/common/Card";
import { Spinner } from "../components/common/Spinner";
import { Button } from "../components/common/Button";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useBackend();
  const { t, language } = useTranslation();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (err: any) {
      showToast(err.message || "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spinner size={36} />
      </div>
    );
  }

  const kpis = [
    {
      title: t.dashboard.totalHoreca,
      value: data?.totalHoreca ?? 0,
      icon: <Building2 size={22} color="#60a5fa" />,
      color: "#60a5fa",
      link: "/organizations",
    },
    {
      title: t.dashboard.totalSuppliers,
      value: data?.totalSuppliers ?? 0,
      icon: <ShoppingBag size={22} color="#a78bfa" />,
      color: "#a78bfa",
      link: "/organizations",
    },
    {
      title: t.dashboard.pendingRegistrations,
      value: data?.pendingRegistrations ?? 0,
      icon: <UserCheck size={22} color="#fbbf24" />,
      color: "#fbbf24",
      highlight: (data?.pendingRegistrations ?? 0) > 0,
      link: "/registrations",
    },
    {
      title: t.dashboard.activeUsers,
      value: data?.activeUsers ?? 0,
      icon: <Users size={22} color="#34d399" />,
      color: "#34d399",
      link: "/users",
    },
    {
      title: t.dashboard.ordersToday,
      value: data?.ordersToday ?? 0,
      icon: <TrendingUp size={22} color="#38bdf8" />,
      color: "#38bdf8",
      link: "/orders",
    },
    {
      title: t.dashboard.totalOrders,
      value: data?.totalOrders ?? 0,
      icon: <PackageCheck size={22} color="#818cf8" />,
      color: "#818cf8",
      link: "/orders",
    },
    {
      title: t.dashboard.activeSubscriptions,
      value: data?.activeSubscriptions ?? 0,
      icon: <CreditCard size={22} color="#10b981" />,
      color: "#10b981",
      link: "/subscriptions",
    },
    {
      title: t.dashboard.suspendedOrgs,
      value: data?.suspendedOrganizations ?? 0,
      icon: <XCircle size={22} color="#f87171" />,
      color: "#f87171",
      link: "/organizations",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Alerts Banner */}
      {data?.alerts && data.alerts.length > 0 && (
        <div style={{
          background: "rgba(245, 158, 11, 0.12)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24", fontWeight: 600, fontSize: "14px" }}>
            <AlertTriangle size={18} />
            <span>{t.dashboard.attention} ({data.alerts.length})</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.alerts.map((alert, idx) => (
              <div key={idx} style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                <span>• {alert.message}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  {new Date(alert.timestamp).toLocaleTimeString(language === "hy" ? "hy-AM" : "en-US")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "18px",
      }}>
        {kpis.map((kpi, idx) => (
          <Link key={idx} to={kpi.link}>
            <Card className="hover-scale" style={{ cursor: "pointer", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontSize: "13.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                  {kpi.title}
                </span>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {kpi.icon}
                </div>
              </div>

              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.03em" }}>
                {kpi.value.toLocaleString()}
              </div>

              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: kpi.color }}>
                <span>{t.dashboard.goToSection}</span>
                <ArrowRight size={13} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Orders Breakdown Card */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        <Card title={t.dashboard.ordersStatusTitle} description={t.dashboard.ordersStatusDesc}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="#60a5fa" />
                <span style={{ fontSize: "13.5px" }}>{t.dashboard.ordersInProgress}</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: "15px" }}>{data?.ordersInProgress ?? 0}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <PackageCheck size={16} color="#34d399" />
                <span style={{ fontSize: "13.5px" }}>{t.dashboard.ordersDelivered}</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: "15px", color: "#34d399" }}>{data?.deliveredOrders ?? 0}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <XCircle size={16} color="#f87171" />
                <span style={{ fontSize: "13.5px" }}>{t.dashboard.ordersCancelled}</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: "15px", color: "#f87171" }}>{data?.cancelledOrders ?? 0}</span>
            </div>
          </div>
        </Card>

        {/* Quick Management Shortcuts */}
        <Card title={t.dashboard.quickActionsTitle} description={t.dashboard.quickActionsDesc}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
            <Link to="/registrations">
              <Button variant="secondary" style={{ width: "100%", justifyContent: "flex-start" }} icon={<UserCheck size={16} color="#fbbf24" />}>
                {t.dashboard.actModerateRegs}
              </Button>
            </Link>

            <Link to="/users">
              <Button variant="secondary" style={{ width: "100%", justifyContent: "flex-start" }} icon={<Users size={16} color="#60a5fa" />}>
                {t.dashboard.actCreateUser}
              </Button>
            </Link>

            <Link to="/subscriptions">
              <Button variant="secondary" style={{ width: "100%", justifyContent: "flex-start" }} icon={<CreditCard size={16} color="#34d399" />}>
                {t.dashboard.actPlans}
              </Button>
            </Link>

            <Link to="/requests">
              <Button variant="secondary" style={{ width: "100%", justifyContent: "flex-start" }} icon={<Building2 size={16} color="#a78bfa" />}>
                {t.dashboard.actHvhhRequests}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

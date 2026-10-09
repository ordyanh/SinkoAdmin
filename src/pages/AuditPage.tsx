import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Calendar,
  User,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminAuditLogResponse,
  AuditActionType,
} from "../types/admin";
import { Button } from "../components/common/Button";
import { Pagination } from "../components/common/Pagination";
import { Spinner } from "../components/common/Spinner";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const AuditPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [logs, setLogs] = useState<AdminAuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filters
  const [actionFilter, setActionFilter] = useState<AuditActionType | "">("");
  const [entityFilter, setEntityFilter] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs({
        actionType: actionFilter === "" ? undefined : (Number(actionFilter) as AuditActionType),
        entityType: entityFilter.trim() || undefined,
        pageNumber,
        pageSize,
      });
      setLogs(res.items || []);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Աուդիտի մատյանի բեռնման սխալ" : "Failed to load audit logs"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pageNumber, pageSize, actionFilter]);

  const renderActionBadge = (action: AuditActionType | string) => {
    const act = Number(action);
    switch (act) {
      case AuditActionType.RegistrationApproved:
        return <span className="badge badge-success">{t.audit.actions.registrationApproved}</span>;
      case AuditActionType.RegistrationDeclined:
        return <span className="badge badge-danger">{t.audit.actions.registrationDeclined}</span>;
      case AuditActionType.OrganizationSuspended:
        return <span className="badge badge-danger">{t.audit.actions.orgSuspended}</span>;
      case AuditActionType.OrganizationReactivated:
        return <span className="badge badge-success">{t.audit.actions.orgReactivated}</span>;
      case AuditActionType.SubscriptionChanged:
        return <span className="badge badge-purple">{t.audit.actions.subscriptionChanged}</span>;
      case AuditActionType.HvhhApproved:
        return <span className="badge badge-info">{t.audit.actions.hvhhApproved}</span>;
      case AuditActionType.CompanyChangeApproved:
        return <span className="badge badge-info">{t.audit.actions.companyChangeApproved}</span>;
      case AuditActionType.PasswordReset:
        return <span className="badge badge-warning">{t.audit.actions.passwordReset}</span>;
      case AuditActionType.UserStatusChanged:
        return <span className="badge badge-warning">{t.audit.actions.userStatusChanged}</span>;
      default:
        return <span className="badge badge-neutral">{String(action)}</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
            <select
              className="form-select"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value as any);
                setPageNumber(1);
              }}
              style={{ width: "230px" }}
            >
              <option value="">{t.audit.actionFilterPlaceholder}</option>
              <option value={AuditActionType.RegistrationApproved}>{t.audit.actions.registrationApproved}</option>
              <option value={AuditActionType.RegistrationDeclined}>{t.audit.actions.registrationDeclined}</option>
              <option value={AuditActionType.OrganizationSuspended}>{t.audit.actions.orgSuspended}</option>
              <option value={AuditActionType.OrganizationReactivated}>{t.audit.actions.orgReactivated}</option>
              <option value={AuditActionType.SubscriptionChanged}>{t.audit.actions.subscriptionChanged}</option>
              <option value={AuditActionType.PasswordReset}>{t.audit.actions.passwordReset}</option>
              <option value={AuditActionType.HvhhApproved}>{t.audit.actions.hvhhApproved}</option>
              <option value={AuditActionType.CompanyChangeApproved}>{t.audit.actions.companyChangeApproved}</option>
            </select>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPageNumber(1);
                fetchLogs();
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                className="form-input"
                placeholder={t.audit.entityFilterPlaceholder}
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                style={{ width: "220px" }}
              />
              <Button type="submit" variant="secondary">{t.common.search}</Button>
            </form>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : logs.length === 0 ? (
          <div className="table-empty">{t.common.noData}</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.audit.adminUser}</th>
                  <th>{t.audit.action}</th>
                  <th>{t.audit.entityId}</th>
                  <th>{t.audit.valueChange}</th>
                  <th>{t.audit.reasonBasis}</th>
                  <th>{t.audit.dateTime}</th>
                  <th>{t.audit.ipAddress}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "13px" }}>
                        {log.adminEmail || log.adminId || (isHy ? "Համակարգ" : "System")}
                      </div>
                    </td>
                    <td>{renderActionBadge(log.actionType)}</td>
                    <td>
                      <div style={{ fontSize: "13px", fontWeight: 500 }}>{log.entityType}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        {log.entityId}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                        <span style={{ color: "var(--text-muted)" }}>{log.previousValue || "—"}</span>
                        <ArrowRight size={12} color="var(--text-muted)" />
                        <span style={{ color: "#38bdf8", fontWeight: 600 }}>{log.newValue || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", maxWidth: "200px" }}>
                        {log.reason || "—"}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                        {new Date(log.timestamp).toLocaleString(locale)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                        {log.ipAddress || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPageNumber(1);
          }}
        />
      </div>
    </div>
  );
};

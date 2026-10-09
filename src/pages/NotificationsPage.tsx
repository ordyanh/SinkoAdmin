import React, { useEffect, useState } from "react";
import {
  Bell,
  Mail,
  Send,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  FileCode,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminNotificationLogResponse,
  AdminNotificationTemplateDto,
  NotificationDeliveryStatus,
} from "../types/admin";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const NotificationsPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [activeTab, setActiveTab] = useState<"logs" | "templates">("logs");

  // Logs
  const [logs, setLogs] = useState<AdminNotificationLogResponse[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Templates
  const [templates, setTemplates] = useState<AdminNotificationTemplateDto[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Template Modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");
  const [templateKey, setTemplateKey] = useState("");
  const [titleTemplate, setTitleTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [supportedVariablesJson, setSupportedVariablesJson] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await adminApi.getNotifications(1, 50);
      setLogs(res.items || []);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Ծանուցումների մատյանի բեռնման սխալ" : "Failed to load notification logs"), "error");
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const res = await adminApi.getNotificationTemplates();
      setTemplates(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Ձևանմուշների բեռնման սխալ" : "Failed to load notification templates"), "error");
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") fetchLogs();
    else fetchTemplates();
  }, [activeTab]);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.saveNotificationTemplate({
        id: templateId || "",
        templateKey,
        titleTemplate,
        bodyTemplate,
        supportedVariablesJson,
        isActive,
      });
      showToast(isHy ? "Ծանուցման ձևանմուշը պահպանվեց" : "Notification template saved", "success");
      setTemplateModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Ձևանմուշի պահպանման սխալ" : "Failed to save template"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatus = (status: NotificationDeliveryStatus | string) => {
    const s = String(status);
    if (s === "2" || s === "Sent" || s === "3" || s === "Delivered") {
      return <span className="badge badge-success">{t.notifications.statusSent}</span>;
    }
    if (s === "4" || s === "Failed") {
      return <span className="badge badge-danger">{t.notifications.statusFailed}</span>;
    }
    return <span className="badge badge-warning">{t.notifications.statusCreated}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          {t.notifications.tabLogs}
        </button>
        <button
          className={`tab-btn ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          {t.notifications.tabTemplates} ({templates.length})
        </button>
      </div>

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="table-container">
          {logsLoading ? (
            <Spinner />
          ) : logs.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.notifications.recipient}</th>
                    <th>{t.notifications.title}</th>
                    <th>{t.notifications.message}</th>
                    <th>{t.notifications.orderId}</th>
                    <th>{t.notifications.deliveryStatus}</th>
                    <th>{t.notifications.sendDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{l.userName || l.userId}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{l.title || "—"}</span>
                      </td>
                      <td>
                        <div style={{
                          maxWidth: "320px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "13px",
                          color: "var(--text-secondary)"
                        }}>
                          {l.message}
                        </div>
                      </td>
                      <td>
                        {l.orderId ? (
                          <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>#{l.orderId.slice(0, 8)}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td>{renderStatus(l.deliveryStatus)}</td>
                      <td>
                        <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {new Date(l.creationDate).toLocaleString(locale)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="table-container">
          <div className="table-toolbar">
            <span style={{ fontSize: "14px", fontWeight: 600 }}>{t.notifications.templatesTitle}</span>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setTemplateId("");
                setTemplateKey("");
                setTitleTemplate("");
                setBodyTemplate("");
                setSupportedVariablesJson("{companyName}, {orderId}, {statusName}");
                setIsActive(true);
                setTemplateModalOpen(true);
              }}
            >
              {t.notifications.newTemplateBtn}
            </Button>
          </div>

          {templatesLoading ? (
            <Spinner />
          ) : templates.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.notifications.templateKey}</th>
                    <th>{t.notifications.title}</th>
                    <th>{t.notifications.templateBody}</th>
                    <th>{t.notifications.variables}</th>
                    <th>{t.common.status}</th>
                    <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl) => (
                    <tr key={tpl.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#38bdf8" }}>
                          {tpl.templateKey}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{tpl.titleTemplate}</span>
                      </td>
                      <td>
                        <div style={{
                          maxWidth: "340px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "12.5px",
                          color: "var(--text-secondary)"
                        }}>
                          {tpl.bodyTemplate}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                          {tpl.supportedVariablesJson || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${tpl.isActive ? "badge-success" : "badge-neutral"}`}>
                          {tpl.isActive ? (isHy ? "Ակտիվ" : "Active") : (isHy ? "Անջատված" : "Inactive")}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Edit size={13} />}
                          onClick={() => {
                            setTemplateId(tpl.id);
                            setTemplateKey(tpl.templateKey);
                            setTitleTemplate(tpl.titleTemplate);
                            setBodyTemplate(tpl.bodyTemplate);
                            setSupportedVariablesJson(tpl.supportedVariablesJson || "");
                            setIsActive(tpl.isActive);
                            setTemplateModalOpen(true);
                          }}
                        >
                          {t.common.edit}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title={t.notifications.templateModalTitle}
        maxWidth="640px"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setTemplateModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleSaveTemplate}>{t.common.save}</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTemplate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">{t.notifications.templateKeyLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
              placeholder="order_status_changed"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.notifications.templateTitleLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={titleTemplate}
              onChange={(e) => setTitleTemplate(e.target.value)}
              placeholder={isHy ? "Ձեր #{orderId} պատվերի կարգավիճակը թարմացվել է" : "Status of your order #{orderId} updated"}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.notifications.templateBodyLabel}</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              placeholder={isHy ? "Բարև Ձեզ, {companyName}: #{orderId} պատվերը փոխանցվել է կարգավիճակ՝ {statusName}:" : "Hello {companyName}. Order #{orderId} updated to status: {statusName}."}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.notifications.supportedVarsLabel}</label>
            <input
              type="text"
              className="form-input"
              value={supportedVariablesJson}
              onChange={(e) => setSupportedVariablesJson(e.target.value)}
              placeholder="{companyName}, {orderId}, {statusName}"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

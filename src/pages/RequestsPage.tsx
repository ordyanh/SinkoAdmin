import React, { useEffect, useState } from "react";
import {
  FileText,
  Building,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Clock,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminHvhhRequestResponse,
  AdminCompanyChangeResponse,
} from "../types/admin";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const RequestsPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [activeTab, setActiveTab] = useState<"hvhh" | "company">("hvhh");

  const [hvhhRequests, setHvhhRequests] = useState<AdminHvhhRequestResponse[]>([]);
  const [companyRequests, setCompanyRequests] = useState<AdminCompanyChangeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedHvhh, setSelectedHvhh] = useState<AdminHvhhRequestResponse | null>(null);
  const [selectedComp, setSelectedComp] = useState<AdminCompanyChangeResponse | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchHvhhRequests = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getHvhhRequests();
      setHvhhRequests(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "ՀՎՀՀ փոփոխության հարցումների բեռնման սխալ" : "Failed to load HVHH requests"), "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyRequests = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCompanyChangeRequests();
      setCompanyRequests(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Տվյալների փոփոխության հարցումների բեռնման սխալ" : "Failed to load company requests"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "hvhh") fetchHvhhRequests();
    else fetchCompanyRequests();
  }, [activeTab]);

  const handleReview = async (approve: boolean) => {
    try {
      setSubmitting(true);
      if (selectedHvhh) {
        await adminApi.reviewHvhhRequest(selectedHvhh.id, approve, approve ? undefined : declineReason);
        showToast(
          approve
            ? (isHy ? "ՀՎՀՀ-ի փոփոխության հարցումը հաստատվեց" : "HVHH change approved")
            : (isHy ? "Հարցումը մերժվեց" : "Request declined"),
          "success"
        );
        fetchHvhhRequests();
      } else if (selectedComp) {
        await adminApi.reviewCompanyChangeRequest(selectedComp.id, approve, approve ? undefined : declineReason);
        showToast(
          approve
            ? (isHy ? "Տվյալների փոփոխության հարցումը հաստատվեց" : "Company change approved")
            : (isHy ? "Հարցումը մերժվեց" : "Request declined"),
          "success"
        );
        fetchCompanyRequests();
      }
      setReviewModalOpen(false);
      setDeclineReason("");
    } catch (err: any) {
      showToast(err.message || (isHy ? "Հարցման քննարկման սխալ" : "Failed to review request"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatus = (status?: number | null) => {
    if (status === 1) return <span className="badge badge-success">{t.requests.statusApproved}</span>;
    if (status === 2) return <span className="badge badge-danger">{t.requests.statusRejected}</span>;
    return <span className="badge badge-warning">{t.requests.statusPending}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "hvhh" ? "active" : ""}`}
          onClick={() => setActiveTab("hvhh")}
        >
          {t.requests.tabHvhh} ({hvhhRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "company" ? "active" : ""}`}
          onClick={() => setActiveTab("company")}
        >
          {t.requests.tabCompany} ({companyRequests.length})
        </button>
      </div>

      {/* HVHH Requests Tab */}
      {activeTab === "hvhh" && (
        <div className="table-container">
          {loading ? (
            <Spinner />
          ) : hvhhRequests.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{isHy ? "Մատակարար" : "Supplier"}</th>
                    <th>{t.requests.currentHvhh}</th>
                    <th>{t.requests.newHvhh}</th>
                    <th>{t.requests.reasonBasis}</th>
                    <th>{t.common.status}</th>
                    <th>{t.requests.requestDate}</th>
                    <th style={{ textAlign: "right" }}>{t.requests.moderation}</th>
                  </tr>
                </thead>
                <tbody>
                  {hvhhRequests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{r.supplierName}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>
                          {r.oldHvhh}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#38bdf8" }}>
                          {r.newHvhh}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{r.reason || "—"}</div>
                      </td>
                      <td>{renderStatus(r.status)}</td>
                      <td>
                        <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString(locale) : "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {r.status === 0 || r.status === null ? (
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<Eye size={13} />}
                            onClick={() => {
                              setSelectedHvhh(r);
                              setSelectedComp(null);
                              setDeclineReason("");
                              setReviewModalOpen(true);
                            }}
                          >
                            {t.requests.reviewBtn}
                          </Button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Company Requests Tab */}
      {activeTab === "company" && (
        <div className="table-container">
          {loading ? (
            <Spinner />
          ) : companyRequests.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{isHy ? "Մատակարար" : "Supplier"}</th>
                    <th>{t.requests.requestedChanges}</th>
                    <th>{t.common.status}</th>
                    <th>{t.requests.requestDate}</th>
                    <th style={{ textAlign: "right" }}>{t.requests.moderation}</th>
                  </tr>
                </thead>
                <tbody>
                  {companyRequests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{r.supplierName}</div>
                      </td>
                      <td>
                        <pre style={{
                          margin: 0,
                          fontSize: "12px",
                          background: "var(--bg-surface)",
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-subtle)",
                          maxWidth: "360px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {r.dataJson}
                        </pre>
                      </td>
                      <td>{renderStatus(r.status)}</td>
                      <td>
                        <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString(locale) : "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {r.status === 0 || r.status === null ? (
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<Eye size={13} />}
                            onClick={() => {
                              setSelectedComp(r);
                              setSelectedHvhh(null);
                              setDeclineReason("");
                              setReviewModalOpen(true);
                            }}
                          >
                            {t.requests.reviewBtn}
                          </Button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={t.requests.reviewModalTitle}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>{t.common.cancel}</Button>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                variant="danger"
                loading={submitting}
                onClick={() => handleReview(false)}
              >
                {t.requests.declineRequest}
              </Button>
              <Button
                variant="primary"
                loading={submitting}
                onClick={() => handleReview(true)}
              >
                {t.requests.approveAndApply}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {selectedHvhh && (
            <div style={{
              background: "var(--bg-surface)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "13.5px"
            }}>
              <div><strong>{t.requests.supplierLabel}</strong> {selectedHvhh.supplierName}</div>
              <div><strong>{t.requests.oldHvhhLabel}</strong> {selectedHvhh.oldHvhh}</div>
              <div><strong>{t.requests.newHvhhLabel}</strong> <span style={{ color: "#38bdf8", fontWeight: 600 }}>{selectedHvhh.newHvhh}</span></div>
              {selectedHvhh.reason && <div><strong>{t.requests.reasonLabel}</strong> {selectedHvhh.reason}</div>}
            </div>
          )}

          {selectedComp && (
            <div style={{
              background: "var(--bg-surface)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              fontSize: "13.5px"
            }}>
              <div style={{ marginBottom: "8px" }}><strong>{t.requests.supplierLabel}</strong> {selectedComp.supplierName}</div>
              <div className="form-label">{t.requests.changedParamsLabel}</div>
              <pre style={{
                background: "var(--bg-dark)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                overflowX: "auto"
              }}>
                {selectedComp.dataJson}
              </pre>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{t.requests.declineReasonLabel}</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder={t.requests.declineReasonPlaceholder}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

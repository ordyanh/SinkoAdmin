import React, { useEffect, useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  PhoneCall,
  UserCheck,
  Eye,
  Filter,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminRegistrationResponse,
  AdminRegistrationDetailResponse,
  RegistrationStatus,
  UserRole,
  CallResult,
} from "../types/admin";
import { StatusBadge } from "../components/common/StatusBadge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Pagination } from "../components/common/Pagination";
import { Spinner } from "../components/common/Spinner";
import { InternalNotesSection } from "../components/notes/InternalNotesSection";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const RegistrationsPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [registrations, setRegistrations] = useState<AdminRegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");

  // Detail Modal
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminRegistrationDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action Modals
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callResult, setCallResult] = useState<CallResult>(CallResult.ContactedInterested);
  const [callNotes, setCallNotes] = useState("");

  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvePassword, setApprovePassword] = useState("");
  const [approvePlan, setApprovePlan] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRegistrations({
        searchTerm: searchTerm.trim() || undefined,
        status: statusFilter === "" ? undefined : (Number(statusFilter) as RegistrationStatus),
        accountType: roleFilter === "" ? undefined : (Number(roleFilter) as UserRole),
        pageNumber,
        pageSize,
      });
      setRegistrations(res.items || []);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Հայտերի ցուցակի բեռնման սխալ" : "Failed to load registrations"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [pageNumber, pageSize, statusFilter, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchRegistrations();
  };

  const handleOpenDetail = async (id: string) => {
    try {
      setSelectedId(id);
      setDetailLoading(true);
      const res = await adminApi.getRegistrationById(id);
      setDetail(res);
      setApprovePlan(res.selectedPlan || (isHy ? "Բազային" : "Basic"));
    } catch (err: any) {
      showToast(err.message || (isHy ? "Հայտի մանրամասների բեռնման սխալ" : "Failed to load registration details"), "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      setSubmitting(true);
      await adminApi.addCallLog(selectedId, { callResult, notes: callNotes });
      showToast(isHy ? "Զանգի արդյունքը գրանցվեց" : "Call result recorded", "success");
      setCallModalOpen(false);
      setCallNotes("");
      handleOpenDetail(selectedId);
      fetchRegistrations();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Չհաջողվեց պահպանել զանգը" : "Failed to save call log"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedId) return;
    try {
      setSubmitting(true);
      const res = await adminApi.approveRegistration(selectedId, {
        selectedPlan: approvePlan || undefined,
        initialPassword: approvePassword || undefined,
      });
      showToast(res.message || (isHy ? "Հայտը հաջողությամբ հաստատվեց!" : "Registration approved successfully!"), "success");
      setApproveModalOpen(false);
      setSelectedId(null);
      fetchRegistrations();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Հայտի հաստատման սխալ" : "Failed to approve registration"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !declineReason.trim()) return;
    try {
      setSubmitting(true);
      await adminApi.declineRegistration(selectedId, declineReason.trim());
      showToast(isHy ? "Հայտը մերժվեց" : "Registration declined", "info");
      setDeclineModalOpen(false);
      setDeclineReason("");
      setSelectedId(null);
      fetchRegistrations();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Հայտի մերժման սխալ" : "Failed to decline registration"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Table Container */}
      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
              <input
                type="text"
                className="form-input"
                placeholder={t.registrations.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
            <Button type="submit" variant="secondary">{t.common.search}</Button>
          </form>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPageNumber(1);
              }}
              style={{ width: "160px" }}
            >
              <option value="">{t.common.allStatuses}</option>
              <option value={RegistrationStatus.Pending}>{isHy ? "Սպասման մեջ" : "Pending"}</option>
              <option value={RegistrationStatus.InProgress}>{isHy ? "Մշակվում է" : "In Progress"}</option>
              <option value={RegistrationStatus.Approved}>{isHy ? "Հաստատված" : "Approved"}</option>
              <option value={RegistrationStatus.Declined}>{isHy ? "Մերժված" : "Declined"}</option>
            </select>

            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as any);
                setPageNumber(1);
              }}
              style={{ width: "160px" }}
            >
              <option value="">{t.common.allRoles}</option>
              <option value={UserRole.Client}>{isHy ? "HoReCa (Հաճախորդ)" : "HoReCa (Client)"}</option>
              <option value={UserRole.Supplier}>{isHy ? "Մատակարար" : "Supplier"}</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <Spinner />
        ) : registrations.length === 0 ? (
          <div className="table-empty">{t.common.noData}</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.common.company}</th>
                  <th>{isHy ? "Տեսակ" : "Type"}</th>
                  <th>{isHy ? "Կոնտակտներ" : "Contacts"}</th>
                  <th>{isHy ? "ՀՎՀՀ (HVHH)" : "Tax ID (HVHH)"}</th>
                  <th>{t.common.status}</th>
                  <th>{t.registrations.assignedCurator}</th>
                  <th>{t.registrations.applicationDate}</th>
                  <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{reg.companyName}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reg.applicantEmail}</div>
                    </td>
                    <td>
                      <StatusBadge type="userRole" value={reg.accountType} />
                    </td>
                    <td>
                      <div style={{ fontSize: "13px" }}>{reg.phone}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{reg.typeOfActivity || "—"}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 600 }}>
                        {reg.taxCode}
                      </span>
                    </td>
                    <td>
                      <StatusBadge type="registration" value={reg.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px" }}>{reg.assignedAdminName || t.registrations.notAssigned}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                        {new Date(reg.createdAt).toLocaleDateString(locale)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Eye size={14} />}
                        onClick={() => handleOpenDetail(reg.id)}
                      >
                        {t.common.details}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      {/* Registration Details Modal */}
      <Modal
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detail ? `${isHy ? "Հայտ" : "Application"}: ${detail.companyName}` : t.common.loading}
        maxWidth="760px"
        footer={
          detail && (
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="secondary"
                  icon={<PhoneCall size={14} />}
                  onClick={() => setCallModalOpen(true)}
                >
                  {t.registrations.logCallBtn}
                </Button>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {detail.status !== RegistrationStatus.Declined && (
                  <Button
                    variant="danger"
                    icon={<XCircle size={14} />}
                    onClick={() => setDeclineModalOpen(true)}
                  >
                    {t.common.decline}
                  </Button>
                )}
                {detail.status !== RegistrationStatus.Approved && (
                  <Button
                    variant="primary"
                    icon={<CheckCircle size={14} />}
                    onClick={() => setApproveModalOpen(true)}
                  >
                    {t.common.approve}
                  </Button>
                )}
              </div>
            </div>
          )
        }
      >
        {detailLoading || !detail ? (
          <Spinner />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Overview Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                background: "var(--bg-surface)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div>
                <span className="form-label">{t.registrations.accountType}</span>
                <StatusBadge type="userRole" value={detail.accountType} />
              </div>
              <div>
                <span className="form-label">{t.registrations.currentStatus}</span>
                <StatusBadge type="registration" value={detail.status} />
              </div>
              <div>
                <span className="form-label">{isHy ? "ՀՎՀՀ / Հարկային կոդ" : "Tax Code / HVHH"}</span>
                <span style={{ fontWeight: 600, color: "#38bdf8" }}>{detail.taxCode}</span>
              </div>
              <div>
                <span className="form-label">{t.common.plan}</span>
                <span>{detail.selectedPlan || (isHy ? "Նշված չէ" : "Not specified")}</span>
              </div>
              <div>
                <span className="form-label">{isHy ? "Դիմողի էլ. հասցե" : "Applicant Email"}</span>
                <span>{detail.applicantEmail}</span>
              </div>
              <div>
                <span className="form-label">{t.common.phone}</span>
                <span>{detail.phone}</span>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span className="form-label">{t.registrations.jurAddress}</span>
                <span>{detail.jurAddress || (isHy ? "Նշված չէ" : "Not specified")}</span>
              </div>
            </div>

            {/* Call History */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <PhoneCall size={16} color="#38bdf8" />
                <h4 style={{ fontSize: "14px", fontWeight: 600 }}>{t.registrations.callHistoryTitle}</h4>
              </div>

              {detail.callHistory.length === 0 ? (
                <div style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  {t.registrations.noCallsYet}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {detail.callHistory.map((call) => (
                    <div
                      key={call.id}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "13px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, color: "#60a5fa" }}>{call.adminEmail || (isHy ? "Ադմին" : "Admin")}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                          {new Date(call.callDate).toLocaleString(locale)}
                        </span>
                      </div>
                      <div style={{ color: "var(--text-secondary)" }}>{call.notes || (isHy ? "Առանց նշումների" : "No notes")}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Internal notes */}
            <InternalNotesSection
              entityType="Registration"
              entityId={detail.id}
              initialNotes={detail.notes}
            />
          </div>
        )}
      </Modal>

      {/* Add Call Log Modal */}
      <Modal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title={t.registrations.logCallModalTitle}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setCallModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleAddCallLog}>{isHy ? "Պահպանել զանգը" : "Save Call"}</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">{t.registrations.callResultLabel}</label>
            <select
              className="form-select"
              value={callResult}
              onChange={(e) => setCallResult(Number(e.target.value) as CallResult)}
            >
              <option value={CallResult.ContactedInterested}>{t.registrations.callResults.contactedInterested}</option>
              <option value={CallResult.ContactedNeedsClarification}>{t.registrations.callResults.contactedNeedsClarification}</option>
              <option value={CallResult.CallScheduled}>{t.registrations.callResults.callScheduled}</option>
              <option value={CallResult.CouldNotReach}>{t.registrations.callResults.couldNotReach}</option>
              <option value={CallResult.ContactedNotInterested}>{t.registrations.callResults.contactedNotInterested}</option>
              <option value={CallResult.InformationIncorrect}>{t.registrations.callResults.informationIncorrect}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.registrations.callNotesLabel}</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder={t.registrations.callNotesPlaceholder}
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={t.registrations.approveModalTitle}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setApproveModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleApprove}>{t.registrations.confirmAndCreateOrg}</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
            {t.registrations.approveDesc}
          </p>

          <div className="form-group">
            <label className="form-label">{t.common.plan}</label>
            <input
              type="text"
              className="form-input"
              value={approvePlan}
              onChange={(e) => setApprovePlan(e.target.value)}
              placeholder={isHy ? "Օրինակ՝ Ստանդարտ, Բիզնես կամ Պրեմիում" : "E.g. Standard, Business or Premium"}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.registrations.initialPasswordLabel}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t.registrations.initialPasswordPlaceholder}
              value={approvePassword}
              onChange={(e) => setApprovePassword(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Decline Modal */}
      <Modal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        title={t.registrations.declineModalTitle}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setDeclineModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="danger" loading={submitting} onClick={handleDecline}>{t.registrations.declineConfirmBtn}</Button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">{t.registrations.declineReasonLabel}</label>
          <textarea
            className="form-textarea"
            rows={4}
            required
            placeholder={t.registrations.declineReasonPlaceholder}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

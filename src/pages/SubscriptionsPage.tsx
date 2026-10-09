import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Calendar,
  Clock,
  Plus,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminSubscriptionResponse,
  AdminSubscriptionPlanDto,
  UserRole,
} from "../types/admin";
import { StatusBadge } from "../components/common/StatusBadge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Pagination } from "../components/common/Pagination";
import { Spinner } from "../components/common/Spinner";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const SubscriptionsPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [activeTab, setActiveTab] = useState<"subscriptions" | "plans">("subscriptions");

  // Subscriptions list
  const [subs, setSubs] = useState<AdminSubscriptionResponse[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subTotal, setSubTotal] = useState(0);
  const [subPages, setSubPages] = useState(1);
  const [subPageNum, setSubPageNum] = useState(1);
  const [subPageSize, setSubPageSize] = useState(20);

  // Plans list
  const [plans, setPlans] = useState<AdminSubscriptionPlanDto[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Assign Plan Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<AdminSubscriptionResponse | null>(null);
  const [assignForm, setAssignForm] = useState({
    planName: "",
    employeeLimit: 10,
    endDate: "",
  });

  // Extend Days Modal
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(30);

  // Plan Create / Edit Modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    accountType: UserRole.Client,
    price: 0,
    billingPeriod: "Monthly",
    maxEmployees: 10,
    features: "",
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch Subscriptions
  const fetchSubscriptions = async () => {
    try {
      setSubsLoading(true);
      const res = await adminApi.getSubscriptions({
        pageNumber: subPageNum,
        pageSize: subPageSize,
      });
      setSubs(res.items || []);
      setSubTotal(res.totalCount || 0);
      setSubPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Բաժանորդագրությունների բեռնման սխալ" : "Failed to load subscriptions"), "error");
    } finally {
      setSubsLoading(false);
    }
  };

  // Fetch Plans
  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const res = await adminApi.getSubscriptionPlans();
      setPlans(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Սակագների բեռնման սխալ" : "Failed to load plans"), "error");
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "subscriptions") fetchSubscriptions();
    else fetchPlans();
  }, [activeTab, subPageNum, subPageSize]);

  // Open Assign Modal
  const handleOpenAssign = (s: AdminSubscriptionResponse) => {
    setSelectedSub(s);
    setAssignForm({
      planName: s.currentPlan || (isHy ? "Ստանդարտ" : "Standard"),
      employeeLimit: s.employeeLimit || 10,
      endDate: s.endDate ? s.endDate.slice(0, 10) : "",
    });
    setAssignModalOpen(true);
  };

  // Submit Assign
  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    try {
      setSubmitting(true);
      await adminApi.assignSubscription(selectedSub.organizationId, {
        planName: assignForm.planName,
        employeeLimit: Number(assignForm.employeeLimit),
        endDate: assignForm.endDate ? new Date(assignForm.endDate).toISOString() : undefined,
      });
      showToast(isHy ? "Սակագնային պլանը նշանակվեց" : "Subscription plan assigned", "success");
      setAssignModalOpen(false);
      fetchSubscriptions();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Նշանակման սխալ" : "Failed to assign plan"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Extend
  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    try {
      setSubmitting(true);
      await adminApi.extendSubscription(selectedSub.organizationId, Number(extendDays));
      showToast(isHy ? "Բաժանորդագրությունը երկարաձգվեց" : "Subscription extended", "success");
      setExtendModalOpen(false);
      fetchSubscriptions();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Երկարաձգման սխալ" : "Failed to extend subscription"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Suspend
  const handleSuspend = async (s: AdminSubscriptionResponse) => {
    try {
      await adminApi.suspendSubscription(s.organizationId);
      showToast(isHy ? "Բաժանորդագրությունը կասեցվեց" : "Subscription suspended", "info");
      fetchSubscriptions();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կասեցման սխալ" : "Failed to suspend subscription"), "error");
    }
  };

  // Open Plan Modal
  const handleOpenPlanModal = (p?: AdminSubscriptionPlanDto) => {
    if (p) {
      setPlanId(p.id);
      setPlanForm({
        name: p.planName,
        accountType: Number(p.accountType) as UserRole,
        price: p.price,
        billingPeriod: p.billingPeriod,
        maxEmployees: p.employeeLimit,
        features: p.featuresJson || "",
        isActive: p.isActive,
      });
    } else {
      setPlanId(null);
      setPlanForm({
        name: "",
        accountType: UserRole.Client,
        price: 0,
        billingPeriod: "Monthly",
        maxEmployees: 10,
        features: "",
        isActive: true,
      });
    }
    setPlanModalOpen(true);
  };

  // Save Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (planId) {
        await adminApi.updateSubscriptionPlan(planId, {
          planName: planForm.name,
          price: planForm.price,
          billingPeriod: planForm.billingPeriod,
          employeeLimit: planForm.maxEmployees,
          featuresJson: planForm.features,
        });
        showToast(isHy ? "Սակագնային պլանը թարմացվեց" : "Subscription plan updated", "success");
      } else {
        await adminApi.createSubscriptionPlan({
          planName: planForm.name,
          accountType: planForm.accountType,
          price: planForm.price,
          billingPeriod: planForm.billingPeriod,
          employeeLimit: planForm.maxEmployees,
          featuresJson: planForm.features,
        });
        showToast(isHy ? "Նոր սակագնային պլանը ստեղծվեց" : "New plan created", "success");
      }
      setPlanModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Սակագնի պահպանման սխալ" : "Failed to save plan"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Plan Status
  const handleTogglePlanStatus = async (p: AdminSubscriptionPlanDto) => {
    try {
      await adminApi.toggleSubscriptionPlanStatus(p.id, !p.isActive);
      showToast(isHy ? "Սակագնի կարգավիճակը փոխվեց" : "Plan status updated", "info");
      fetchPlans();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կարգավիճակի փոփոխման սխալ" : "Failed to toggle plan status"), "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "subscriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("subscriptions")}
        >
          {t.subscriptions.tabSubscriptions} ({subTotal})
        </button>
        <button
          className={`tab-btn ${activeTab === "plans" ? "active" : ""}`}
          onClick={() => setActiveTab("plans")}
        >
          {t.subscriptions.tabPlans} ({plans.length})
        </button>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div className="table-container">
          {subsLoading ? (
            <Spinner />
          ) : subs.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.common.company}</th>
                    <th>{isHy ? "Տեսակ" : "Type"}</th>
                    <th>{t.subscriptions.currentPlan}</th>
                    <th>{t.subscriptions.startDate}</th>
                    <th>{t.subscriptions.endDate}</th>
                    <th>{t.subscriptions.usageLimit}</th>
                    <th>{t.common.status}</th>
                    <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.organizationId}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{s.organizationName}</div>
                      </td>
                      <td>
                        <StatusBadge type="userRole" value={s.accountType} />
                      </td>
                      <td>
                        <span className="badge badge-purple">{s.currentPlan || "—"}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {new Date(s.startDate).toLocaleDateString(locale)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {s.endDate ? new Date(s.endDate).toLocaleDateString(locale) : t.subscriptions.unlimited}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px" }}>
                          {s.currentEmployeeUsage} / {s.employeeLimit}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${s.isActive ? "badge-success" : "badge-neutral"}`}>
                          {s.isActive ? t.subscriptions.active : t.subscriptions.inactive}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenAssign(s)}
                          >
                            {t.subscriptions.changePlanBtn}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedSub(s);
                              setExtendDays(30);
                              setExtendModalOpen(true);
                            }}
                          >
                            {t.subscriptions.extend30DaysBtn}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleSuspend(s)}
                          >
                            {t.subscriptions.suspendSubBtn}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            pageNumber={subPageNum}
            pageSize={subPageSize}
            totalCount={subTotal}
            totalPages={subPages}
            onPageChange={setSubPageNum}
            onPageSizeChange={(newSize) => {
              setSubPageSize(newSize);
              setSubPageNum(1);
            }}
          />
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => handleOpenPlanModal()}
            >
              {t.subscriptions.newPlanBtn}
            </Button>
          </div>

          {plansLoading ? (
            <Spinner />
          ) : plans.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {plans.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>{p.planName}</h3>
                      <StatusBadge type="userRole" value={p.accountType} />
                    </div>

                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 800, color: "#38bdf8" }}>
                        {p.price.toLocaleString()} ֏
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ {t.subscriptions.perMonth}</span>
                    </div>

                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      <strong>{t.subscriptions.employeeLimitLabel}</strong> {p.employeeLimit}
                    </div>

                    {p.featuresJson && (
                      <div style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {p.featuresJson}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                    <span className={`badge ${p.isActive ? "badge-success" : "badge-neutral"}`}>
                      {p.isActive ? t.subscriptions.active : t.subscriptions.inactive}
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Edit size={13} />}
                        onClick={() => handleOpenPlanModal(p)}
                      >
                        {t.common.edit}
                      </Button>
                      <Button
                        size="sm"
                        variant={p.isActive ? "danger" : "secondary"}
                        onClick={() => handleTogglePlanStatus(p)}
                      >
                        {p.isActive ? t.common.deactivate : t.common.activate}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={t.subscriptions.assignModalTitle}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleAssignPlan}>{t.common.save}</Button>
          </div>
        }
      >
        <form onSubmit={handleAssignPlan} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">{t.subscriptions.assignPlanLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={assignForm.planName}
              onChange={(e) => setAssignForm({ ...assignForm, planName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.subscriptions.assignLimitLabel}</label>
            <input
              type="number"
              required
              className="form-input"
              value={assignForm.employeeLimit}
              onChange={(e) => setAssignForm({ ...assignForm, employeeLimit: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.subscriptions.assignEndDateLabel}</label>
            <input
              type="date"
              className="form-input"
              value={assignForm.endDate}
              onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Extend Days Modal */}
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title={t.subscriptions.extendModalTitle}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setExtendModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleExtend}>{isHy ? "Երկարաձգել" : "Extend"}</Button>
          </div>
        }
      >
        <form onSubmit={handleExtend} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">{t.subscriptions.extendDaysLabel}</label>
            <input
              type="number"
              required
              min={1}
              max={365}
              className="form-input"
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
            />
          </div>
        </form>
      </Modal>

      {/* Plan Modal (Create / Edit) */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={planId ? t.subscriptions.planModalTitleEdit : t.subscriptions.planModalTitleCreate}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setPlanModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleSavePlan}>{t.common.save}</Button>
          </div>
        }
      >
        <form onSubmit={handleSavePlan} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">{t.subscriptions.planNameLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.subscriptions.accountTypeLabel}</label>
            <select
              className="form-select"
              value={planForm.accountType}
              onChange={(e) => setPlanForm({ ...planForm, accountType: Number(e.target.value) as UserRole })}
            >
              <option value={UserRole.Client}>{isHy ? "HoReCa (Հաճախորդ)" : "HoReCa (Client)"}</option>
              <option value={UserRole.Supplier}>{isHy ? "Մատակարար" : "Supplier"}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.subscriptions.priceLabel}</label>
            <input
              type="number"
              required
              min={0}
              className="form-input"
              value={planForm.price}
              onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.subscriptions.billingPeriodLabel}</label>
            <select
              className="form-select"
              value={planForm.billingPeriod}
              onChange={(e) => setPlanForm({ ...planForm, billingPeriod: e.target.value })}
            >
              <option value="Monthly">{t.subscriptions.periods.Monthly}</option>
              <option value="Yearly">{t.subscriptions.periods.Yearly}</option>
              <option value="Quarterly">{t.subscriptions.periods.Quarterly}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.subscriptions.employeeLimitLabel} *</label>
            <input
              type="number"
              required
              min={1}
              className="form-input"
              value={planForm.maxEmployees}
              onChange={(e) => setPlanForm({ ...planForm, maxEmployees: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.subscriptions.featuresLabel}</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder={t.subscriptions.featuresPlaceholder}
              value={planForm.features}
              onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

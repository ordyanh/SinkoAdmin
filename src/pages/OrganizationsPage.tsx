import React, { useEffect, useState } from "react";
import {
  Search,
  Building2,
  Users,
  Eye,
  PauseCircle,
  PlayCircle,
  MapPin,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminOrganizationSummaryResponse,
  AdminOrganizationDetailResponse,
  OrganizationStatus,
  UserRole,
} from "../types/admin";
import { StatusBadge } from "../components/common/StatusBadge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Pagination } from "../components/common/Pagination";
import { Spinner } from "../components/common/Spinner";
import { InternalNotesSection } from "../components/notes/InternalNotesSection";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const OrganizationsPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [organizations, setOrganizations] = useState<AdminOrganizationSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");

  // Detail Modal
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrganizationDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"info" | "users" | "orders" | "notes">("info");

  // Suspend Modal
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrganizations({
        searchTerm: searchTerm.trim() || undefined,
        status: statusFilter === "" ? undefined : (Number(statusFilter) as OrganizationStatus),
        accountType: roleFilter === "" ? undefined : (Number(roleFilter) as UserRole),
        pageNumber,
        pageSize,
      });
      setOrganizations(res.items || []);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կազմակերպությունների ցուցակի բեռնման սխալ" : "Failed to load organizations"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [pageNumber, pageSize, statusFilter, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchOrganizations();
  };

  const handleOpenDetail = async (id: string) => {
    try {
      setSelectedId(id);
      setDetailTab("info");
      setDetailLoading(true);
      const res = await adminApi.getOrganizationById(id);
      setDetail(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կազմակերպության մանրամասների բեռնման սխալ" : "Failed to load organization details"), "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !suspendReason.trim()) return;
    try {
      setSubmitting(true);
      await adminApi.suspendOrganization(selectedId, suspendReason.trim());
      showToast(isHy ? "Կազմակերպության գործունեությունը կասեցվեց" : "Organization suspended", "warning");
      setSuspendModalOpen(false);
      setSuspendReason("");
      handleOpenDetail(selectedId);
      fetchOrganizations();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կասեցման սխալ" : "Failed to suspend organization"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedId) return;
    try {
      setSubmitting(true);
      await adminApi.reactivateOrganization(selectedId);
      showToast(isHy ? "Կազմակերպությունը հաջողությամբ վերականգնվեց!" : "Organization reactivated successfully!", "success");
      handleOpenDetail(selectedId);
      fetchOrganizations();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Վերականգնման սխալ" : "Failed to reactivate organization"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
              <input
                type="text"
                className="form-input"
                placeholder={t.organizations.searchPlaceholder}
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
              <option value={OrganizationStatus.Active}>{isHy ? "Ակտիվ" : "Active"}</option>
              <option value={OrganizationStatus.Suspended}>{isHy ? "Կասեցված" : "Suspended"}</option>
              <option value={OrganizationStatus.Blocked}>{isHy ? "Արգելափակված" : "Blocked"}</option>
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
              <option value={UserRole.Client}>{isHy ? "Հաճախորդներ (HoReCa)" : "Clients (HoReCa)"}</option>
              <option value={UserRole.Supplier}>{isHy ? "Մատակարարներ" : "Suppliers"}</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <Spinner />
        ) : organizations.length === 0 ? (
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
                  <th>{t.organizations.employeesCount}</th>
                  <th>{t.organizations.regDate}</th>
                  <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{org.companyName}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{org.email}</div>
                    </td>
                    <td>
                      <StatusBadge type="userRole" value={org.role} />
                    </td>
                    <td>
                      <div style={{ fontSize: "13px" }}>{org.phoneNumber}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{org.typeOfActivity || "—"}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 600 }}>
                        {org.taxCode}
                      </span>
                    </td>
                    <td>
                      <StatusBadge type="organization" value={org.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: "13px" }}>
                        {org.employeeCount}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                        {new Date(org.creationDate).toLocaleDateString(locale)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Eye size={14} />}
                        onClick={() => handleOpenDetail(org.id)}
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

      {/* Detail Modal */}
      <Modal
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detail ? detail.companyName : t.common.loading}
        maxWidth="820px"
        footer={
          detail && (
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div></div>
              <div style={{ display: "flex", gap: "10px" }}>
                {detail.status === OrganizationStatus.Active ? (
                  <Button
                    variant="danger"
                    icon={<PauseCircle size={15} />}
                    onClick={() => setSuspendModalOpen(true)}
                  >
                    {t.organizations.suspendOrgBtn}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    icon={<PlayCircle size={15} />}
                    loading={submitting}
                    onClick={handleReactivate}
                  >
                    {t.organizations.reactivateOrgBtn}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: "6px" }}>
              <button
                className={`tab-btn ${detailTab === "info" ? "active" : ""}`}
                onClick={() => setDetailTab("info")}
              >
                {t.organizations.tabInfo}
              </button>
              <button
                className={`tab-btn ${detailTab === "users" ? "active" : ""}`}
                onClick={() => setDetailTab("users")}
              >
                {t.organizations.tabUsers} ({detail.users.length})
              </button>
              <button
                className={`tab-btn ${detailTab === "orders" ? "active" : ""}`}
                onClick={() => setDetailTab("orders")}
              >
                {t.organizations.tabOrders} ({detail.recentOrders.length})
              </button>
              <button
                className={`tab-btn ${detailTab === "notes" ? "active" : ""}`}
                onClick={() => setDetailTab("notes")}
              >
                {t.organizations.tabNotes}
              </button>
            </div>

            {/* Tab: Info */}
            {detailTab === "info" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  background: "var(--bg-surface)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)"
                }}>
                  <div>
                    <span className="form-label">{isHy ? "Դերը համակարգում" : "System Role"}</span>
                    <StatusBadge type="userRole" value={detail.role} />
                  </div>
                  <div>
                    <span className="form-label">{isHy ? "Ընթացիկ կարգավիճակ" : "Current Status"}</span>
                    <StatusBadge type="organization" value={detail.status} />
                  </div>
                  <div>
                    <span className="form-label">{isHy ? "ՀՎՀՀ / Հարկային կոդ" : "Tax Code / HVHH"}</span>
                    <span style={{ fontWeight: 600, color: "#38bdf8" }}>{detail.taxCode}</span>
                  </div>
                  <div>
                    <span className="form-label">{t.common.plan}</span>
                    <span>{detail.subscriptionPlan || (isHy ? "Նշված չէ" : "Not assigned")}</span>
                  </div>
                  <div>
                    <span className="form-label">{t.organizations.employeeLimit}</span>
                    <span>{detail.currentEmployeesCount} {t.organizations.outOf} {detail.maxEmployees}</span>
                  </div>
                  <div>
                    <span className="form-label">{t.organizations.regDate}</span>
                    <span>{new Date(detail.creationDate).toLocaleDateString(locale)}</span>
                  </div>
                  <div>
                    <span className="form-label">{t.common.email}</span>
                    <span>{detail.email}</span>
                  </div>
                  <div>
                    <span className="form-label">{t.common.phone}</span>
                    <span>{detail.phoneNumber}</span>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span className="form-label">{isHy ? "Իրավաբանական հասցե" : "Juridical Address"}</span>
                    <span>{detail.jurAddress || (isHy ? "Նշված չէ" : "Not specified")}</span>
                  </div>
                </div>

                {detail.deliveryAddresses && detail.deliveryAddresses.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: "8px" }}>{t.organizations.deliveryAddresses}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {detail.deliveryAddresses.map((addr, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
                          <MapPin size={14} color="#38bdf8" />
                          <span>{addr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Users */}
            {detailTab === "users" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {detail.users.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                    {t.organizations.noUsersRegistered}
                  </div>
                ) : (
                  detail.users.map((u) => (
                    <div
                      key={u.id}
                      style={{
                        padding: "12px 16px",
                        background: "var(--bg-surface)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{u.companyName || u.email}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.email} • {u.phoneNumber}</div>
                      </div>
                      <StatusBadge type="userRole" value={u.role} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Orders */}
            {detailTab === "orders" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {detail.recentOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                    {t.organizations.noOrdersYet}
                  </div>
                ) : (
                  detail.recentOrders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        padding: "12px 16px",
                        background: "var(--bg-surface)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{t.organizations.orderNum}{o.id.slice(0, 8)}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {new Date(o.creationDate).toLocaleString(locale)} • {o.productsCount} {t.organizations.itemsCount}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span style={{ fontWeight: 600, color: "#34d399" }}>
                          {(o.finalPrice ?? o.price).toLocaleString()} ֏
                        </span>
                        <StatusBadge type="order" value={o.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Notes */}
            {detailTab === "notes" && (
              <InternalNotesSection
                entityType="Organization"
                entityId={detail.id}
                initialNotes={detail.notes}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Suspend Reason Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={t.organizations.suspendModalTitle}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setSuspendModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="danger" loading={submitting} onClick={handleSuspend}>{t.common.suspend}</Button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">{t.organizations.suspendReasonLabel}</label>
          <textarea
            className="form-textarea"
            rows={4}
            required
            placeholder={t.organizations.suspendReasonPlaceholder}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

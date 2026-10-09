import React, { useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Edit,
  UserCheck,
  Building,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminUserResponse,
  AdminEmployeeResponse,
  UserRole,
  EmployeeRole,
} from "../types/admin";
import { StatusBadge } from "../components/common/StatusBadge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Pagination } from "../components/common/Pagination";
import { Spinner } from "../components/common/Spinner";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const UsersPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [activeTab, setActiveTab] = useState<"users" | "employees">("users");

  // Users State
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userTotal, setUserTotal] = useState(0);
  const [userPages, setUserPages] = useState(1);
  const [userPageNum, setUserPageNum] = useState(1);
  const [userPageSize, setUserPageSize] = useState(20);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | "">("");

  // Employees State
  const [employees, setEmployees] = useState<AdminEmployeeResponse[]>([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empTotal, setEmpTotal] = useState(0);
  const [empPages, setEmpPages] = useState(1);
  const [empPageNum, setEmpPageNum] = useState(1);
  const [empPageSize, setEmpPageSize] = useState(20);
  const [empSearch, setEmpSearch] = useState("");

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    taxCode: "",
    role: UserRole.Client,
    password: "",
    address: "",
    typeOfActivity: "",
    subscriptionPlan: isHy ? "Բազային" : "Basic",
  });

  // Edit User Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [editForm, setEditForm] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    taxCode: "",
    jurAddress: "",
    typeOfActivity: "",
    subscriptionPlan: "",
  });

  // Reset Password Modal
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Change Role Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>(UserRole.Client);

  const [submitting, setSubmitting] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await adminApi.getUsers({
        searchTerm: userSearch.trim() || undefined,
        role: userRoleFilter === "" ? undefined : (Number(userRoleFilter) as UserRole),
        pageNumber: userPageNum,
        pageSize: userPageSize,
      });
      setUsers(res.items || []);
      setUserTotal(res.totalCount || 0);
      setUserPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Օգտատերերի բեռնման սխալ" : "Failed to load users"), "error");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      setEmpLoading(true);
      const res = await adminApi.getEmployees({
        searchTerm: empSearch.trim() || undefined,
        pageNumber: empPageNum,
        pageSize: empPageSize,
      });
      setEmployees(res.items || []);
      setEmpTotal(res.totalCount || 0);
      setEmpPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Աշխատակիցների բեռնման սխալ" : "Failed to load employees"), "error");
    } finally {
      setEmpLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else fetchEmployees();
  }, [activeTab, userPageNum, userPageSize, userRoleFilter, empPageNum, empPageSize]);

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.createUser({
        ...createForm,
        role: Number(createForm.role) as UserRole,
      });
      showToast(isHy ? "Օգտատերը հաջողությամբ ստեղծվեց!" : "User created successfully!", "success");
      setCreateModalOpen(false);
      setCreateForm({
        companyName: "",
        email: "",
        phoneNumber: "",
        taxCode: "",
        role: UserRole.Client,
        password: "",
        address: "",
        typeOfActivity: "",
        subscriptionPlan: isHy ? "Բազային" : "Basic",
      });
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Օգտատիրոջ ստեղծման սխալ" : "Failed to create user"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit User
  const handleOpenEdit = (u: AdminUserResponse) => {
    setSelectedUser(u);
    setEditForm({
      companyName: u.companyName,
      email: u.email,
      phoneNumber: u.phoneNumber,
      taxCode: u.taxCode,
      jurAddress: u.jurAddress || "",
      typeOfActivity: u.typeOfActivity || "",
      subscriptionPlan: u.subscriptionPlan || "",
    });
    setEditModalOpen(true);
  };

  // Update User Handler
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      await adminApi.updateUser(selectedUser.id, editForm);
      showToast(isHy ? "Օգտատիրոջ տվյալները թարմացվեցին" : "User updated successfully", "success");
      setEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Թարմացման սխալ" : "Failed to update user"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Block User
  const handleToggleBlock = async (u: AdminUserResponse) => {
    try {
      const willBlock = u.isActive;
      await adminApi.toggleUserBlockStatus(u.id, willBlock);
      showToast(
        willBlock
          ? (isHy ? "Օգտատերն արգելափակվեց" : "User blocked")
          : (isHy ? "Օգտատերն ապաարգելափակվեց" : "User unblocked"),
        "info"
      );
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կարգավիճակի փոփոխման սխալ" : "Failed to update user status"), "error");
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword.trim()) return;
    try {
      setSubmitting(true);
      await adminApi.resetUserPassword(selectedUser.id, newPassword.trim());
      showToast(isHy ? "Գաղտնաբառը հաջողությամբ փոխվեց" : "Password changed successfully", "success");
      setPwdModalOpen(false);
      setNewPassword("");
    } catch (err: any) {
      showToast(err.message || (isHy ? "Գաղտնաբառի փոփոխման սխալ" : "Failed to reset password"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Change Role Handler
  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      await adminApi.changeUserRole(selectedUser.id, newRole);
      showToast(isHy ? "Օգտատիրոջ դերը փոխվեց" : "User role updated successfully", "success");
      setRoleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Դերի փոփոխման սխալ" : "Failed to change user role"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Employee Status
  const handleToggleEmployee = async (emp: AdminEmployeeResponse) => {
    try {
      await adminApi.toggleEmployeeStatus(emp.id, !emp.isActive);
      showToast(isHy ? "Աշխատակցի կարգավիճակը փոխվեց" : "Employee status updated", "info");
      fetchEmployees();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կարգավիճակի փոփոխման սխալ" : "Failed to toggle employee status"), "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "-4px" }}>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          {t.users.tabUsers} ({userTotal})
        </button>
        <button
          className={`tab-btn ${activeTab === "employees" ? "active" : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          {t.users.tabEmployees} ({empTotal})
        </button>
      </div>

      {/* Content for Users */}
      {activeTab === "users" && (
        <div className="table-container">
          <div className="table-toolbar">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUserPageNum(1);
                fetchUsers();
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}
            >
              <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.users.searchPlaceholder}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
              <Button type="submit" variant="secondary">{t.common.search}</Button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <select
                className="form-select"
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value as any);
                  setUserPageNum(1);
                }}
                style={{ width: "160px" }}
              >
                <option value="">{t.common.allRoles}</option>
                <option value={UserRole.Client}>{isHy ? "HoReCa (Հաճախորդ)" : "HoReCa (Client)"}</option>
                <option value={UserRole.Supplier}>{isHy ? "Մատակարար" : "Supplier"}</option>
                <option value={UserRole.Owner}>{isHy ? "Ղեկավար / Ադմին" : "Owner / Admin"}</option>
              </select>

              <Button
                variant="primary"
                icon={<UserPlus size={16} />}
                onClick={() => setCreateModalOpen(true)}
              >
                {t.users.createUserBtn}
              </Button>
            </div>
          </div>

          {usersLoading ? (
            <Spinner />
          ) : users.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.common.company}</th>
                    <th>{isHy ? "Տեսակ" : "Type"}</th>
                    <th>{t.common.contacts}</th>
                    <th>{isHy ? "ՀՎՀՀ" : "Tax ID"}</th>
                    <th>{t.common.status}</th>
                    <th>{t.users.activityTypeLabel}</th>
                    <th>{t.users.lastLogin}</th>
                    <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{u.companyName}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.email}</div>
                      </td>
                      <td>
                        <StatusBadge type="userRole" value={u.role} />
                      </td>
                      <td>
                        <div style={{ fontSize: "13px" }}>{u.phoneNumber}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.jurAddress || "—"}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 600 }}>
                          {u.taxCode}
                        </span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="badge badge-success">{t.users.activeStatus}</span>
                        ) : (
                          <span className="badge badge-danger">{t.users.blockedStatus}</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {u.typeOfActivity || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleDateString(locale)
                            : t.users.neverLoggedIn}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Edit size={13} />}
                            onClick={() => handleOpenEdit(u)}
                            title={t.common.edit}
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<KeyRound size={13} />}
                            onClick={() => {
                              setSelectedUser(u);
                              setNewPassword("");
                              setPwdModalOpen(true);
                            }}
                            title={t.common.resetPassword}
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<ShieldAlert size={13} />}
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(Number(u.role) as UserRole);
                              setRoleModalOpen(true);
                            }}
                            title={t.common.changeRole}
                          />
                          <Button
                            size="sm"
                            variant={u.isActive ? "danger" : "secondary"}
                            icon={u.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                            onClick={() => handleToggleBlock(u)}
                            title={u.isActive ? t.common.block : t.common.unblock}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            pageNumber={userPageNum}
            pageSize={userPageSize}
            totalCount={userTotal}
            totalPages={userPages}
            onPageChange={setUserPageNum}
            onPageSizeChange={(newSize) => {
              setUserPageSize(newSize);
              setUserPageNum(1);
            }}
          />
        </div>
      )}

      {/* Content for Employees */}
      {activeTab === "employees" && (
        <div className="table-container">
          <div className="table-toolbar">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmpPageNum(1);
                fetchEmployees();
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}
            >
              <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.users.searchEmpPlaceholder}
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
              <Button type="submit" variant="secondary">{t.common.search}</Button>
            </form>
          </div>

          {empLoading ? (
            <Spinner />
          ) : employees.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.users.fullName}</th>
                    <th>{isHy ? "Պաշտոն / Դեր" : "Position / Role"}</th>
                    <th>{t.common.contacts}</th>
                    <th>{t.users.organization}</th>
                    <th>{t.common.status}</th>
                    <th>{t.users.serviceAreas}</th>
                    <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {emp.employeeName}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{emp.email}</div>
                      </td>
                      <td>
                        <StatusBadge type="employeeRole" value={emp.role} />
                      </td>
                      <td>
                        <div style={{ fontSize: "13px" }}>{emp.phoneNumber || "—"}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "13px", fontWeight: 500 }}>
                          {emp.organizationName || (isHy ? "Գլխավոր գրասենյակ" : "Main HQ")}
                        </div>
                      </td>
                      <td>
                        {emp.isActive ? (
                          <span className="badge badge-success">{t.users.activeStatus}</span>
                        ) : (
                          <span className="badge badge-danger">{t.users.disabledStatus}</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {emp.serviceAreas && emp.serviceAreas.length > 0 ? emp.serviceAreas.join(", ") : t.users.allAreas}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          size="sm"
                          variant={emp.isActive ? "danger" : "secondary"}
                          onClick={() => handleToggleEmployee(emp)}
                        >
                          {emp.isActive ? t.common.deactivate : t.common.activate}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            pageNumber={empPageNum}
            pageSize={empPageSize}
            totalCount={empTotal}
            totalPages={empPages}
            onPageChange={setEmpPageNum}
            onPageSizeChange={(newSize) => {
              setEmpPageSize(newSize);
              setEmpPageNum(1);
            }}
          />
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t.users.createModalTitle}
        maxWidth="640px"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleCreateUser}>{t.common.create}</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateUser} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">{t.users.companyNameLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={createForm.companyName}
              onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.common.email} *</label>
            <input
              type="email"
              required
              className="form-input"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.common.phone} *</label>
            <input
              type="tel"
              required
              className="form-input"
              value={createForm.phoneNumber}
              onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isHy ? "ՀՎՀՀ / Հարկային կոդ *" : "Tax Code / HVHH *"}</label>
            <input
              type="text"
              required
              className="form-input"
              value={createForm.taxCode}
              onChange={(e) => setCreateForm({ ...createForm, taxCode: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isHy ? "Դեր *" : "Role *"}</label>
            <select
              className="form-select"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: Number(e.target.value) as UserRole })}
            >
              <option value={UserRole.Client}>{isHy ? "HoReCa (Հաճախորդ)" : "HoReCa (Client)"}</option>
              <option value={UserRole.Supplier}>{isHy ? "Մատակարար" : "Supplier"}</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">{t.users.passwordLabel}</label>
            <input
              type="password"
              required
              className="form-input"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">{isHy ? "Իրավաբանական հասցե *" : "Juridical Address *"}</label>
            <input
              type="text"
              required
              className="form-input"
              value={createForm.address}
              onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.users.activityTypeLabel}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t.users.activityTypePlaceholder}
              value={createForm.typeOfActivity}
              onChange={(e) => setCreateForm({ ...createForm, typeOfActivity: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.users.subscriptionPlanLabel}</label>
            <input
              type="text"
              className="form-input"
              value={createForm.subscriptionPlan}
              onChange={(e) => setCreateForm({ ...createForm, subscriptionPlan: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={t.users.editModalTitle}
        maxWidth="640px"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleUpdateUser}>{t.common.save}</Button>
          </div>
        }
      >
        <form onSubmit={handleUpdateUser} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">{t.users.companyNameLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={editForm.companyName}
              onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.common.email} *</label>
            <input
              type="email"
              required
              className="form-input"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.common.phone} *</label>
            <input
              type="tel"
              required
              className="form-input"
              value={editForm.phoneNumber}
              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isHy ? "ՀՎՀՀ / Հարկային կոդ *" : "Tax Code / HVHH *"}</label>
            <input
              type="text"
              required
              className="form-input"
              value={editForm.taxCode}
              onChange={(e) => setEditForm({ ...editForm, taxCode: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.users.subscriptionPlanLabel}</label>
            <input
              type="text"
              className="form-input"
              value={editForm.subscriptionPlan}
              onChange={(e) => setEditForm({ ...editForm, subscriptionPlan: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">{isHy ? "Իրավաբանական հասցե *" : "Juridical Address *"}</label>
            <input
              type="text"
              required
              className="form-input"
              value={editForm.jurAddress}
              onChange={(e) => setEditForm({ ...editForm, jurAddress: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={pwdModalOpen}
        onClose={() => setPwdModalOpen(false)}
        title={`${t.users.resetPwdModalTitle}: ${selectedUser?.email || ""}`}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setPwdModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleResetPassword}>{isHy ? "Հաստատել նոր գաղտնաբառը" : "Set New Password"}</Button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">{t.users.newPasswordLabel}</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder={t.users.newPasswordPlaceholder}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`${t.users.changeRoleModalTitle}: ${selectedUser?.companyName || ""}`}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setRoleModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleChangeRole}>{t.common.changeRole}</Button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">{t.users.selectRoleLabel}</label>
          <select
            className="form-select"
            value={newRole}
            onChange={(e) => setNewRole(Number(e.target.value) as UserRole)}
          >
            <option value={UserRole.Client}>{isHy ? "HoReCa (Հաճախորդ)" : "HoReCa (Client)"}</option>
            <option value={UserRole.Supplier}>{isHy ? "Մատակարար" : "Supplier"}</option>
            <option value={UserRole.Owner}>{isHy ? "Ղեկավար / Ադմին" : "Owner / Admin"}</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};

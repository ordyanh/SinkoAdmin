import React, { useEffect, useState } from "react";
import {
  FolderTree,
  MapPin,
  Briefcase,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminCategoryDto,
  AdminServiceAreaDto,
  AdminBusinessTypeDto,
} from "../types/admin";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Spinner } from "../components/common/Spinner";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const CatalogConfigPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";

  const [activeTab, setActiveTab] = useState<"categories" | "areas" | "businesses">("categories");

  // Categories
  const [categories, setCategories] = useState<AdminCategoryDto[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  // Areas
  const [serviceAreas, setServiceAreas] = useState<AdminServiceAreaDto[]>([]);
  const [areaLoading, setAreaLoading] = useState(true);

  // Businesses
  const [businessTypes, setBusinessTypes] = useState<AdminBusinessTypeDto[]>([]);
  const [bizLoading, setBizLoading] = useState(true);

  // Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catId, setCatId] = useState<number | null>(null);
  const [catName, setCatName] = useState("");

  // Area Modal
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [areaName, setAreaName] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setCatLoading(true);
      const res = await adminApi.getCategories();
      setCategories(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կատեգորիաների բեռնման սխալ" : "Failed to load categories"), "error");
    } finally {
      setCatLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      setAreaLoading(true);
      const res = await adminApi.getServiceAreas();
      setServiceAreas(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Առաքման գոտիների բեռնման սխալ" : "Failed to load service areas"), "error");
    } finally {
      setAreaLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      setBizLoading(true);
      const res = await adminApi.getBusinessTypes();
      setBusinessTypes(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Գործունեության ոլորտների բեռնման սխալ" : "Failed to load business types"), "error");
    } finally {
      setBizLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "categories") fetchCategories();
    else if (activeTab === "areas") fetchAreas();
    else fetchBusinesses();
  }, [activeTab]);

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (catId !== null) {
        await adminApi.updateCategory(catId, catName);
        showToast(isHy ? "Կատեգորիան թարմացվեց" : "Category updated", "success");
      } else {
        await adminApi.createCategory(catName);
        showToast(isHy ? "Նոր կատեգորիա ավելացվեց" : "New category added", "success");
      }
      setCatModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Կատեգորիայի պահպանման սխալ" : "Failed to save category"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Area
  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (areaId !== null) {
        await adminApi.updateServiceArea(areaId, areaName);
        showToast(isHy ? "Սպասարկման գոտին թարմացվեց" : "Service area updated", "success");
      } else {
        await adminApi.createServiceArea(areaName);
        showToast(isHy ? "Նոր գոտի ավելացվեց" : "New service area added", "success");
      }
      setAreaModalOpen(false);
      fetchAreas();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Գոտու պահպանման սխալ" : "Failed to save service area"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          {t.config.tabCategories} ({categories.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "areas" ? "active" : ""}`}
          onClick={() => setActiveTab("areas")}
        >
          {t.config.tabAreas} ({serviceAreas.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "businesses" ? "active" : ""}`}
          onClick={() => setActiveTab("businesses")}
        >
          {t.config.tabBusinesses} ({businessTypes.length})
        </button>
      </div>

      {/* Categories */}
      {activeTab === "categories" && (
        <div className="table-container">
          <div className="table-toolbar">
            <span style={{ fontSize: "14px", fontWeight: 600 }}>{t.config.categoriesTreeTitle}</span>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setCatId(null);
                setCatName("");
                setCatModalOpen(true);
              }}
            >
              {t.config.addCategoryBtn}
            </Button>
          </div>

          {catLoading ? (
            <Spinner />
          ) : categories.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.config.nameCol}</th>
                    <th>{t.common.status}</th>
                    <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {c.name}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${c.isActive ? "badge-success" : "badge-neutral"}`}>
                          {c.isActive ? (isHy ? "Ակտիվ" : "Active") : (isHy ? "Անջատված" : "Inactive")}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Edit size={13} />}
                          onClick={() => {
                            setCatId(c.id);
                            setCatName(c.name);
                            setCatModalOpen(true);
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

      {/* Areas */}
      {activeTab === "areas" && (
        <div className="table-container">
          <div className="table-toolbar">
            <span style={{ fontSize: "14px", fontWeight: 600 }}>{t.config.areasTitle}</span>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setAreaId(null);
                setAreaName("");
                setAreaModalOpen(true);
              }}
            >
              {t.config.addAreaBtn}
            </Button>
          </div>

          {areaLoading ? (
            <Spinner />
          ) : serviceAreas.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.config.nameCol}</th>
                    <th>{t.common.status}</th>
                    <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceAreas.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{a.name}</div>
                      </td>
                      <td>
                        <span className={`badge ${a.isActive ? "badge-success" : "badge-neutral"}`}>
                          {a.isActive ? (isHy ? "Ակտիվ" : "Active") : (isHy ? "Անջատված" : "Inactive")}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Edit size={13} />}
                          onClick={() => {
                            setAreaId(a.id);
                            setAreaName(a.name);
                            setAreaModalOpen(true);
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

      {/* Business Types */}
      {activeTab === "businesses" && (
        <div className="table-container">
          <div className="table-toolbar">
            <span style={{ fontSize: "14px", fontWeight: 600 }}>{t.config.businessTypesTitle}</span>
          </div>

          {bizLoading ? (
            <Spinner />
          ) : businessTypes.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>{t.config.idCol}</th>
                    <th>{t.config.nameCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {businessTypes.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{b.id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{b.name}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={catId !== null ? t.config.catModalTitleEdit : t.config.catModalTitleNew}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setCatModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleSaveCategory}>{t.common.save}</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">{t.config.catNameLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder={t.config.catNamePlaceholder}
            />
          </div>
        </form>
      </Modal>

      {/* Area Modal */}
      <Modal
        isOpen={areaModalOpen}
        onClose={() => setAreaModalOpen(false)}
        title={areaId !== null ? t.config.areaModalTitleEdit : t.config.areaModalTitleNew}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setAreaModalOpen(false)}>{t.common.cancel}</Button>
            <Button variant="primary" loading={submitting} onClick={handleSaveArea}>{t.common.save}</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveArea} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">{t.config.areaNameLabel}</label>
            <input
              type="text"
              required
              className="form-input"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder={t.config.areaNamePlaceholder}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

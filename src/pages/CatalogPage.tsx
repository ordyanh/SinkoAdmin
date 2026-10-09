import React, { useEffect, useState } from "react";
import {
  Search,
  Package,
  Tag,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminProductResponse,
  AdminPromotionResponse,
} from "../types/admin";
import { StatusBadge } from "../components/common/StatusBadge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Pagination } from "../components/common/Pagination";
import { Spinner } from "../components/common/Spinner";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const CatalogPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [activeTab, setActiveTab] = useState<"products" | "promotions">("products");

  // Products
  const [products, setProducts] = useState<AdminProductResponse[]>([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodTotal, setProdTotal] = useState(0);
  const [prodPages, setProdPages] = useState(1);
  const [prodPageNum, setProdPageNum] = useState(1);
  const [prodPageSize, setProdPageSize] = useState(20);
  const [prodSearch, setProdSearch] = useState("");

  // Promotions
  const [promotions, setPromotions] = useState<AdminPromotionResponse[]>([]);
  const [promosLoading, setPromosLoading] = useState(true);

  // Block Promo Modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<AdminPromotionResponse | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setProdLoading(true);
      const res = await adminApi.getProducts({
        searchTerm: prodSearch.trim() || undefined,
        pageNumber: prodPageNum,
        pageSize: prodPageSize,
      });
      setProducts(res.items || []);
      setProdTotal(res.totalCount || 0);
      setProdPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Ապրանքների բեռնման սխալ" : "Failed to load products"), "error");
    } finally {
      setProdLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      setPromosLoading(true);
      const res = await adminApi.getPromotions();
      setPromotions(res.items || []);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Ակցիաների բեռնման սխալ" : "Failed to load promotions"), "error");
    } finally {
      setPromosLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    else fetchPromotions();
  }, [activeTab, prodPageNum, prodPageSize]);

  // Toggle Product Status
  const handleToggleProduct = async (p: AdminProductResponse) => {
    try {
      await adminApi.toggleProductStatus(p.id, !p.isActive);
      showToast(
        isHy
          ? `Ապրանք «${p.name}» ${!p.isActive ? "ակտիվացվեց" : "անջատվեց"}`
          : `Product "${p.name}" ${!p.isActive ? "activated" : "disabled"}`,
        "success"
      );
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Ապրանքի կարգավիճակի փոփոխման սխալ" : "Failed to toggle product status"), "error");
    }
  };

  // Block Promo
  const handleTogglePromoBlock = async () => {
    if (!selectedPromo) return;
    try {
      setSubmitting(true);
      const willBlock = !selectedPromo.isBlocked;
      await adminApi.blockPromotion(selectedPromo.id, willBlock, blockReason);
      showToast(
        willBlock
          ? (isHy ? "Ակցիան արգելափակվեց" : "Promotion blocked")
          : (isHy ? "Ակցիան ապաարգելափակվեց" : "Promotion unblocked"),
        "info"
      );
      setBlockModalOpen(false);
      setBlockReason("");
      fetchPromotions();
    } catch (err: any) {
      showToast(err.message || (isHy ? "Ակցիայի արգելափակման սխալ" : "Failed to toggle promotion block"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          {t.catalog.tabProducts} ({prodTotal})
        </button>
        <button
          className={`tab-btn ${activeTab === "promotions" ? "active" : ""}`}
          onClick={() => setActiveTab("promotions")}
        >
          {t.catalog.tabPromotions} ({promotions.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="table-container">
          <div className="table-toolbar">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setProdPageNum(1);
                fetchProducts();
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}
            >
              <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "12px" }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.catalog.searchProdPlaceholder}
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  style={{ paddingLeft: "36px" }}
                />
              </div>
              <Button type="submit" variant="secondary">{t.common.search}</Button>
            </form>
          </div>

          {prodLoading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.catalog.sku}</th>
                    <th>{t.catalog.productName}</th>
                    <th>{t.catalog.category}</th>
                    <th>{t.orders.supplier}</th>
                    <th>{t.catalog.basePrice}</th>
                    <th>{t.catalog.unit}</th>
                    <th>{t.catalog.inStock}</th>
                    <th>{t.common.status}</th>
                    <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: "12px" }}>
                          {p.code || "—"}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{p.name}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{p.categoryName || "—"}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{p.supplierName}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#34d399" }}>
                          {p.basePrice.toLocaleString()} ֏
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12.5px" }}>{p.unitName || p.unitDisplay || (isHy ? "հատ" : "pcs")}</span>
                      </td>
                      <td>
                        <span className={`badge ${p.inStock ? "badge-info" : "badge-neutral"}`}>
                          {p.inStock ? t.catalog.available : t.catalog.outOfStock}
                        </span>
                      </td>
                      <td>
                        <StatusBadge type="product" value={p.isActive} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          size="sm"
                          variant={p.isActive ? "danger" : "secondary"}
                          onClick={() => handleToggleProduct(p)}
                        >
                          {p.isActive ? t.common.deactivate : t.common.activate}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            pageNumber={prodPageNum}
            pageSize={prodPageSize}
            totalCount={prodTotal}
            totalPages={prodPages}
            onPageChange={setProdPageNum}
            onPageSizeChange={(newSize) => {
              setProdPageSize(newSize);
              setProdPageNum(1);
            }}
          />
        </div>
      )}

      {/* Promotions Tab */}
      {activeTab === "promotions" && (
        <div className="table-container">
          {promosLoading ? (
            <Spinner />
          ) : promotions.length === 0 ? (
            <div className="table-empty">{t.common.noData}</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t.catalog.promoName}</th>
                    <th>{t.orders.supplier}</th>
                    <th>{t.catalog.promoType}</th>
                    <th>{t.catalog.promoPeriod}</th>
                    <th>{t.catalog.promoProducts}</th>
                    <th>{t.common.status}</th>
                    <th>{t.catalog.promoBlockStatus}</th>
                    <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((pr) => (
                    <tr key={pr.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{pr.name}</div>
                        {pr.description && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{pr.description}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: "13px" }}>{pr.supplierName}</div>
                      </td>
                      <td>
                        <span className="badge badge-purple">{String(pr.type)}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {new Date(pr.startDate).toLocaleDateString(locale)} — {new Date(pr.endDate).toLocaleDateString(locale)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px" }}>{pr.productsCount}</span>
                      </td>
                      <td>
                        <StatusBadge type="promotion" value={pr.status} />
                      </td>
                      <td>
                        <span className={`badge ${pr.isBlocked ? "badge-danger" : "badge-success"}`}>
                          {pr.isBlocked ? t.catalog.promoBlocked : t.catalog.promoActive}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Button
                          size="sm"
                          variant={pr.isBlocked ? "secondary" : "danger"}
                          icon={pr.isBlocked ? <Unlock size={13} /> : <Lock size={13} />}
                          onClick={() => {
                            setSelectedPromo(pr);
                            setBlockReason("");
                            setBlockModalOpen(true);
                          }}
                        >
                          {pr.isBlocked ? t.common.unblock : t.common.block}
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

      {/* Block Promo Modal */}
      <Modal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        title={selectedPromo?.isBlocked ? t.catalog.blockModalTitleUnblock : t.catalog.blockModalTitleBlock}
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setBlockModalOpen(false)}>{t.common.cancel}</Button>
            <Button
              variant={selectedPromo?.isBlocked ? "primary" : "danger"}
              loading={submitting}
              onClick={handleTogglePromoBlock}
            >
              {t.common.confirm}
            </Button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">{t.catalog.blockReasonLabel}</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder={t.catalog.blockReasonPlaceholder}
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

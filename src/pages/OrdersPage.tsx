import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Calendar,
  Building,
  Eye,
  CheckCircle,
  Truck,
  PackageCheck,
  Ban,
  Clock,
} from "lucide-react";
import { adminApi } from "../api/adminService";
import {
  AdminOrderResponse,
  AdminOrderDetailResponse,
  OrderStatus,
} from "../types/admin";
import { StatusBadge } from "../components/common/StatusBadge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Pagination } from "../components/common/Pagination";
import { Spinner } from "../components/common/Spinner";
import { useBackend } from "../context/BackendContext";
import { useTranslation } from "../context/LanguageContext";

export const OrdersPage: React.FC = () => {
  const { showToast } = useBackend();
  const { t, language } = useTranslation();
  const isHy = language === "hy";
  const locale = isHy ? "hy-AM" : "en-US";

  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

  // Detail Modal
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders({
        searchTerm: searchTerm.trim() || undefined,
        status: statusFilter === "" ? undefined : (Number(statusFilter) as OrderStatus),
        pageNumber,
        pageSize,
      });
      setOrders(res.items || []);
      setTotalCount(res.totalCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Պատվերների բեռնման սխալ" : "Failed to load orders"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pageNumber, pageSize, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchOrders();
  };

  const handleOpenDetail = async (id: string) => {
    try {
      setSelectedId(id);
      setDetailLoading(true);
      const res = await adminApi.getOrderById(id);
      setDetail(res);
    } catch (err: any) {
      showToast(err.message || (isHy ? "Պատվերի մանրամասների բեռնման սխալ" : "Failed to load order details"), "error");
    } finally {
      setDetailLoading(false);
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
                placeholder={t.orders.searchPlaceholder}
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
              style={{ width: "170px" }}
            >
              <option value="">{t.common.allStatuses}</option>
              <option value={OrderStatus.New}>{isHy ? "Նոր" : "New"}</option>
              <option value={OrderStatus.Seen}>{isHy ? "Դիտված" : "Seen"}</option>
              <option value={OrderStatus.Accepted}>{isHy ? "Ընդունված" : "Accepted"}</option>
              <option value={OrderStatus.InProgress}>{isHy ? "Հավաքվում է" : "In Progress"}</option>
              <option value={OrderStatus.ReadyForDelivery}>{isHy ? "Պատրաստ է / Ճանապարհին" : "Ready / In Transit"}</option>
              <option value={OrderStatus.Delivered}>{isHy ? "Առաքված" : "Delivered"}</option>
              <option value={OrderStatus.Paid}>{isHy ? "Վճարված" : "Paid"}</option>
              <option value={OrderStatus.Finished}>{isHy ? "Ավարտված" : "Finished"}</option>
              <option value={OrderStatus.Rejected}>{isHy ? "Չեղարկված" : "Cancelled"}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <div className="table-empty">{t.common.noData}</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.orders.orderNumber}</th>
                  <th>{t.orders.clientHoreca}</th>
                  <th>{t.orders.supplier}</th>
                  <th>{t.orders.itemsCount}</th>
                  <th>{t.orders.amount}</th>
                  <th>{t.common.status}</th>
                  <th>{t.orders.orderDate}</th>
                  <th>{t.orders.delivery}</th>
                  <th style={{ textAlign: "right" }}>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#38bdf8" }}>
                        #{o.id.slice(0, 8)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{o.clientName}</div>
                    </td>
                    <td>
                      <div style={{ color: "var(--text-secondary)" }}>{o.supplierName}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px" }}>{o.productsCount}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#34d399" }}>
                        {(o.finalPrice ?? o.price).toLocaleString()} ֏
                      </span>
                    </td>
                    <td>
                      <StatusBadge type="order" value={o.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                        {new Date(o.creationDate).toLocaleDateString(locale)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                        {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString(locale) : "—"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Eye size={14} />}
                        onClick={() => handleOpenDetail(o.id)}
                      >
                        {t.orders.itemsContent}
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

      {/* Order Detail Modal */}
      <Modal
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detail ? `${t.orders.modalTitle}${detail.id}` : t.common.loading}
        maxWidth="840px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <Button variant="secondary" onClick={() => setSelectedId(null)}>{t.common.close}</Button>
          </div>
        }
      >
        {detailLoading || !detail ? (
          <Spinner />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Summary Grid */}
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
                <span className="form-label">{t.orders.clientHoreca}</span>
                <span style={{ fontWeight: 600 }}>{detail.clientName}</span>
              </div>
              <div>
                <span className="form-label">{t.orders.supplier}</span>
                <span style={{ fontWeight: 600 }}>{detail.supplierName}</span>
              </div>
              <div>
                <span className="form-label">{t.common.status}</span>
                <StatusBadge type="order" value={detail.status} />
              </div>
              <div>
                <span className="form-label">{t.orders.totalAmount}</span>
                <span style={{ fontWeight: 700, color: "#34d399", fontSize: "16px" }}>
                  {(detail.finalPrice ?? detail.price).toLocaleString()} ֏
                </span>
              </div>
              <div>
                <span className="form-label">{t.orders.orderDate}</span>
                <span>{new Date(detail.creationDate).toLocaleString(locale)}</span>
              </div>
              <div>
                <span className="form-label">{t.orders.deliveryDate}</span>
                <span>{detail.deliveryDate ? new Date(detail.deliveryDate).toLocaleDateString(locale) : t.orders.notAssignedDate}</span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>{t.orders.orderContentsTitle}</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t.orders.productCol}</th>
                      <th>{t.orders.qtyCol}</th>
                      <th>{t.orders.priceCol}</th>
                      <th style={{ textAlign: "right" }}>{t.orders.totalCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.products || []).map((it) => (
                      <tr key={it.productId}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{it.productName}</div>
                        </td>
                        <td>{it.quantity}</td>
                        <td>{it.price.toLocaleString()} ֏</td>
                        <td style={{ textAlign: "right", fontWeight: 600, color: "#34d399" }}>
                          {it.totalPrice.toLocaleString()} ֏
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status History */}
            {detail.statusLogs && detail.statusLogs.length > 0 && (
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>{t.orders.statusHistoryTitle}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {detail.statusLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: "10px 14px",
                        background: "var(--bg-surface)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "13px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <StatusBadge type="order" value={log.newStatus} />
                        <span>{t.orders.changedBy} <strong>{log.changedByUserName || t.orders.systemUser}</strong></span>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(log.changedAt).toLocaleString(locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

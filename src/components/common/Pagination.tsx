import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { useTranslation } from "../../context/LanguageContext";

interface PaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();
  const from = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const to = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 24px",
      borderTop: "1px solid var(--border-subtle)",
      flexWrap: "wrap",
      gap: "12px"
    }}>
      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
        {t.common.showing} <strong style={{ color: "var(--text-main)" }}>{from}–{to}</strong> {t.common.of}{" "}
        <strong style={{ color: "var(--text-main)" }}>{totalCount}</strong> {t.common.records}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {onPageSizeChange && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <span style={{ color: "var(--text-muted)" }}>{t.common.rowsPerPage}</span>
            <select
              className="form-select"
              style={{ width: "70px", padding: "4px 8px", height: "32px", fontSize: "12px" }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Button
            variant="icon"
            disabled={pageNumber <= 1}
            onClick={() => onPageChange(pageNumber - 1)}
            style={{ width: "32px", height: "32px" }}
          >
            <ChevronLeft size={16} />
          </Button>

          <span style={{ fontSize: "13px", padding: "0 8px", color: "var(--text-secondary)" }}>
            {t.common.page} <strong style={{ color: "var(--text-main)" }}>{pageNumber}</strong> {t.common.to} {Math.max(1, totalPages)}
          </span>

          <Button
            variant="icon"
            disabled={pageNumber >= totalPages || totalPages === 0}
            onClick={() => onPageChange(pageNumber + 1)}
            style={{ width: "32px", height: "32px" }}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

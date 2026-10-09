import React, { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { adminApi } from "../../api/adminService";
import { AdminNoteDto } from "../../types/admin";
import { Button } from "../common/Button";
import { useBackend } from "../../context/BackendContext";
import { useTranslation } from "../../context/LanguageContext";

interface InternalNotesSectionProps {
  entityType: string;
  entityId: string;
  initialNotes?: AdminNoteDto[];
}

export const InternalNotesSection: React.FC<InternalNotesSectionProps> = ({
  entityType,
  entityId,
  initialNotes,
}) => {
  const { showToast } = useBackend();
  const { t } = useTranslation();
  const [notes, setNotes] = useState<AdminNoteDto[]>(initialNotes || []);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getInternalNotes(entityType, entityId);
      setNotes(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialNotes) {
      fetchNotes();
    }
  }, [entityType, entityId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmitting(true);
      await adminApi.addInternalNote(entityType, entityId, newNote.trim());
      showToast(t.common.save, "success");
      setNewNote("");
      fetchNotes();
    } catch (err: any) {
      showToast(err.message || "Error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <MessageSquare size={16} color="var(--primary-light)" />
        <h4 style={{ fontSize: "14px", fontWeight: 600 }}>{t.internalNotes.title}</h4>
      </div>

      <div style={{
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-md)",
        padding: "16px",
        border: "1px solid var(--border-subtle)",
        marginBottom: "14px",
        maxHeight: "220px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "12px" }}>{t.common.loading}</div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", padding: "10px" }}>
            {t.internalNotes.noNotesYet}
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              style={{
                background: "var(--bg-input)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11.5px" }}>
                <span style={{ fontWeight: 600, color: "#60a5fa" }}>{n.adminEmail || n.adminId || t.internalNotes.adminDefault}</span>
                <span style={{ color: "var(--text-muted)" }}>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-main)", whiteSpace: "pre-wrap" }}>{n.noteText}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddNote} style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          className="form-input"
          placeholder={t.internalNotes.placeholder}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <Button type="submit" variant="primary" loading={submitting} icon={<Send size={15} />}>
          {t.internalNotes.addBtn}
        </Button>
      </form>
    </div>
  );
};

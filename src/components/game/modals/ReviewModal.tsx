// src/components/game/modals/ReviewModal.tsx
"use client";
import { ReviewModalData } from "@/types/game";
import { STAFF_ROLES } from "@/lib/gameConstants";

interface Props {
  data: ReviewModalData;
  onClose: () => void;
}

const VERDICT_LABEL: Record<string, string> = { baik: "✅ Baik", cukup: "🟡 Cukup", buruk: "🔴 Buruk" };
const VERDICT_COLOR: Record<string, string> = { baik: "#22c55e", cukup: "#f59e0b", buruk: "#ef4444" };

export default function ReviewModal({ data, onClose }: Props) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "#13131e", border: "2px solid #c8a96e44", borderRadius: 16, padding: 24, maxWidth: 420, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#c8a96e", marginBottom: 4 }}>📝 Review Performa Staf</div>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 14 }}>Hari ke-{data.day} — evaluasi rutin 30 hari</div>
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {data.results.map((r) => {
            const role = STAFF_ROLES[r.role];
            return (
              <div key={r.id} style={{ background: "#0d0d14", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{role.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#ddd", fontSize: 12 }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: role.color }}>{role.label} · Skor {r.perf}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: VERDICT_COLOR[r.verdict] }}>{VERDICT_LABEL[r.verdict]}</div>
                  {r.warnings > 0 && <div style={{ fontSize: 9, color: "#ef4444" }}>⚠️ Peringatan: {r.warnings}/3</div>}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} style={{ width: "100%", background: "linear-gradient(135deg,#c8a96e,#8a6030)", color: "#000", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Tutup</button>
      </div>
    </div>
  );
}

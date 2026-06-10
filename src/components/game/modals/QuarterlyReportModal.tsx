// src/components/game/modals/QuarterlyReportModal.tsx
"use client";
import { QuarterlyKpiResult } from "@/types/game";

interface Props {
  report: QuarterlyKpiResult;
  onClose: () => void;
}

export default function QuarterlyReportModal({ report: r, onClose }: Props) {
  const ratingColor = r.rating === "Sehat" ? "#22c55e" : r.rating === "Cukup" ? "#60a5fa" : r.rating === "Pengawasan" ? "#f59e0b" : "#ef4444";
  const ratingBg = r.rating === "Sehat" ? "#22c55e18" : r.rating === "Cukup" ? "#60a5fa18" : r.rating === "Pengawasan" ? "#f59e0b18" : "#ef444418";
  const ratingBorder = r.rating === "Sehat" ? "#22c55e33" : r.rating === "Cukup" ? "#60a5fa33" : r.rating === "Pengawasan" ? "#f59e0b33" : "#ef444433";
  const ratingLabel = r.rating === "Sehat" ? "✅ SEHAT" : r.rating === "Cukup" ? "🔵 CUKUP" : r.rating === "Pengawasan" ? "⚠️ PENGAWASAN" : "🚨 SANKSI";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "#13131e", border: "2px solid #c8a96e44", borderRadius: 16, padding: 24, maxWidth: 380, width: "100%" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#c8a96e", marginBottom: 4 }}>🏛️ Evaluasi OJK Kuartal ke-{r.quarter}</div>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 16 }}>Hari {r.day} · {r.passedCount}/4 KPI tercapai</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {r.items.map((item) => (
            <div key={item.label} style={{ background: "#0d0d14", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: "#555", marginBottom: 2 }}>{item.label} (target {item.targetLabel})</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: item.pass ? "#22c55e" : "#ef4444", fontFamily: "monospace" }}>{item.value}%</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 12px", borderRadius: 8, background: ratingBg, border: `1px solid ${ratingBorder}`, marginBottom: 8, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#aaa" }}>Status Pengawasan OJK</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: ratingColor }}>{ratingLabel}</div>
        </div>
        <div style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginBottom: 14 }}>{r.consequence}</div>
        <button onClick={onClose} style={{ width: "100%", background: "linear-gradient(135deg,#c8a96e,#8a6030)", color: "#000", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Tutup</button>
      </div>
    </div>
  );
}

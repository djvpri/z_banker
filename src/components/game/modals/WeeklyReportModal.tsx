// src/components/game/modals/WeeklyReportModal.tsx
"use client";
import { WeeklyReport } from "@/types/game";
import { fmt } from "@/lib/gameFormat";

interface Props {
  report: WeeklyReport;
  onClose: () => void;
}

export default function WeeklyReportModal({ report: r, onClose }: Props) {
  const ratingColor = r.rating === "Sehat" ? "#22c55e" : r.rating === "Cukup" ? "#f59e0b" : "#ef4444";
  const items = [
    { label: "Profit Minggu Ini", val: fmt(r.profit), color: r.profit >= 0 ? "#22c55e" : "#ef4444" },
    { label: "NPL", val: r.npl + "% (" + (r.nplDelta >= 0 ? "+" : "") + r.nplDelta + ")", color: r.npl <= 3 ? "#22c55e" : r.npl <= 5 ? "#f59e0b" : "#ef4444" },
    { label: "Reputasi", val: r.reputation + "% (" + (r.repDelta >= 0 ? "+" : "") + r.repDelta + ")", color: r.reputation >= 70 ? "#22c55e" : "#f59e0b" },
    { label: "CAR", val: r.car + "%", color: r.car >= 14 ? "#22c55e" : "#f59e0b" },
    { label: "Total Deposito", val: fmt(r.deposits), color: "#60a5fa" },
    { label: "Jumlah Staf", val: r.staffCount + " orang", color: "#a78bfa" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "#13131e", border: "2px solid #c8a96e44", borderRadius: 16, padding: 24, maxWidth: 380, width: "100%" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#c8a96e", marginBottom: 4 }}>📋 Laporan Minggu ke-{r.week}</div>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 16 }}>Hari {r.day - 6} – {r.day}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {items.map((item) => (
            <div key={item.label} style={{ background: "#0d0d14", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: "#555", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: item.color, fontFamily: "monospace" }}>{item.val}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 12px", borderRadius: 8, background: r.rating === "Sehat" ? "#22c55e18" : r.rating === "Cukup" ? "#f59e0b18" : "#ef444418", border: `1px solid ${r.rating === "Sehat" ? "#22c55e33" : r.rating === "Cukup" ? "#f59e0b33" : "#ef444433"}`, marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#aaa" }}>Rating Kesehatan Bank Minggu Ini</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: ratingColor }}>{r.rating === "Sehat" ? "✅ SEHAT" : r.rating === "Cukup" ? "⚠️ CUKUP" : "🚨 WASPADA"}</div>
        </div>
        <button onClick={onClose} style={{ width: "100%", background: "linear-gradient(135deg,#c8a96e,#8a6030)", color: "#000", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Tutup Laporan</button>
      </div>
    </div>
  );
}

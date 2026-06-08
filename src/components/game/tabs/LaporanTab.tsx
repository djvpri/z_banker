// src/components/game/tabs/LaporanTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { fmt } from "@/lib/gameFormat";
import WeeklyReportModal from "../modals/WeeklyReportModal";

export default function LaporanTab() {
  const weeklyReports = useGameStore((s) => s.weeklyReports);
  const eventLog = useGameStore((s) => s.eventLog);
  const showWeeklyReport = useGameStore((s) => s.showWeeklyReport);
  const setShowWeeklyReport = useGameStore((s) => s.setShowWeeklyReport);

  return (
    <div>
      {showWeeklyReport && <WeeklyReportModal report={showWeeklyReport} onClose={() => setShowWeeklyReport(null)} />}

      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 12 }}>📋 Laporan Mingguan & Log Event</div>

      {weeklyReports.length === 0 && (
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 20, textAlign: "center", color: "#555", marginBottom: 12 }}>
          Laporan mingguan pertama muncul di hari ke-7.
        </div>
      )}

      {weeklyReports.map((r) => {
        const ratingColor = r.rating === "Sehat" ? "#22c55e" : r.rating === "Cukup" ? "#f59e0b" : "#ef4444";
        return (
          <div key={r.week} style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 12, marginBottom: 8, cursor: "pointer" }} onClick={() => setShowWeeklyReport(r)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontWeight: 700, color: "#ddd", fontSize: 12 }}>Minggu ke-{r.week} <span style={{ fontSize: 10, color: "#555" }}>(Hari {r.day - 6}–{r.day})</span></div>
              <div style={{ fontSize: 11, fontWeight: 700, color: ratingColor }}>{r.rating === "Sehat" ? "✅" : r.rating === "Cukup" ? "⚠️" : "🚨"} {r.rating}</div>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
              <span style={{ color: r.profit >= 0 ? "#22c55e" : "#ef4444" }}>{r.profit >= 0 ? "+" : ""}{fmt(r.profit)}</span>
              <span style={{ color: "#555" }}>NPL {r.npl}%</span>
              <span style={{ color: "#555" }}>Rep {r.reputation}%</span>
            </div>
            <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>Tap untuk detail lengkap →</div>
          </div>
        );
      })}

      <div style={{ fontSize: 12, fontWeight: 700, color: "#c8a96e", margin: "14px 0 8px" }}>📜 Log Event ({eventLog.length})</div>
      {eventLog.length === 0 && (
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 16, textAlign: "center", color: "#555" }}>Belum ada event tercatat.</div>
      )}
      {eventLog.map((e, i) => {
        const c = e.type === "success" ? "#22c55e" : e.type === "danger" ? "#ef4444" : "#f59e0b";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 7, marginBottom: 5 }}>
            <div style={{ width: 3, height: 28, background: c, borderRadius: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#ccc" }}>{e.title}</div>
              <div style={{ fontSize: 9, color: "#444" }}>Hari {e.day}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

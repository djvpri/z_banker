// src/components/game/tabs/DashboardTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { fmt } from "@/lib/gameFormat";
import { STAFF_ROLES } from "@/lib/gameConstants";
import { Bar } from "../ui/Shared";

export default function DashboardTab() {
  const game = useGameStore((s) => s.game);
  const staff = useGameStore((s) => s.staff);

  const active = staff.filter((s) => s.status === "aktif");
  const avgSkill = active.length ? active.reduce((a, s) => a + s.skill, 0) / active.length : 5;
  const totalSalary = staff.reduce((a, s) => a + STAFF_ROLES[s.role].salary, 0);

  const carColor = game.car >= 14 ? "#22c55e" : game.car >= 12 ? "#f59e0b" : "#ef4444";
  const nplColor = game.npl <= 3 ? "#22c55e" : game.npl <= 5 ? "#f59e0b" : "#ef4444";
  const repColor = game.reputation >= 70 ? "#22c55e" : game.reputation >= 40 ? "#f59e0b" : "#ef4444";

  const rows = [
    { label: "CAR", val: game.car, max: 25, color: carColor },
    { label: "NPL", val: game.npl, max: 10, color: nplColor },
    { label: "Reputasi", val: game.reputation, max: 100, color: repColor },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>PROFIT HARI INI</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: game.profit >= 0 ? "#22c55e" : "#ef4444", fontFamily: "monospace" }}>
          {game.profit >= 0 ? "+" : ""}{fmt(game.profit)}
        </div>
      </div>
      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>TOTAL PROFIT</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace" }}>{fmt(game.totalProfit)}</div>
      </div>
      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>GAJI TIM/HARI</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#ef4444", fontFamily: "monospace" }}>-{fmt(totalSalary)}</div>
        <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>{staff.length} karyawan</div>
      </div>
      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>PERFORMA TIM</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#a78bfa", fontFamily: "monospace" }}>{Math.round((avgSkill / 10) * 100)}%</div>
        <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>Avg skill {avgSkill.toFixed(1)}/10</div>
      </div>
      <div style={{ gridColumn: "1/-1", background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#c8a96e", marginBottom: 10 }}>🎯 Kesehatan Bank</div>
        {rows.map((r) => (
          <div key={r.label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 3 }}>
              <span>{r.label}</span><span style={{ color: r.color, fontFamily: "monospace" }}>{r.val}%</span>
            </div>
            <Bar val={r.val} max={r.max} color={r.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

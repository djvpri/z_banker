// src/components/game/tabs/DashboardTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { fmt } from "@/lib/gameFormat";
import { STAFF_ROLES } from "@/lib/gameConstants";
import { DIFFICULTY_CONFIG } from "@/types/game";
import { Bar } from "../ui/Shared";

export default function DashboardTab() {
  const game = useGameStore((s) => s.game);
  const staff = useGameStore((s) => s.staff);
  const loanPortfolio = useGameStore((s) => s.loanPortfolio);
  const savingsPortfolio = useGameStore((s) => s.savingsPortfolio);

  const cfg = DIFFICULTY_CONFIG[game.difficulty];

  // Staff status
  const aktif = staff.filter((s) => s.status === "aktif").length;
  const burnout = staff.filter((s) => s.status === "burnout").length;
  const istirahat = staff.filter((s) => s.status === "istirahat").length;
  const avgSkill = aktif ? staff.filter((s) => s.status === "aktif").reduce((a, s) => a + s.skill, 0) / aktif : 5;
  const totalSalary = staff.reduce((a, s) => a + STAFF_ROLES[s.role].salary, 0);

  // Health colors
  const carColor = game.car >= 14 ? "#22c55e" : game.car >= 12 ? "#f59e0b" : "#ef4444";
  const nplColor = game.npl <= 3 ? "#22c55e" : game.npl <= 5 ? "#f59e0b" : "#ef4444";
  const repColor = game.reputation >= 70 ? "#22c55e" : game.reputation >= 40 ? "#f59e0b" : "#ef4444";

  // Portfolio summary
  const macet = loanPortfolio.filter((l) => l.status === "macet").length;
  const jatuhTempo = savingsPortfolio.filter((s) => s.maturity > 0 && s.daysLeft <= 3).length;

  // Win progress
  const progressPct = Math.min(Math.round((game.totalProfit / cfg.targetProfit) * 100), 100);
  const progressColor = progressPct >= 75 ? "#22c55e" : progressPct >= 40 ? "#f59e0b" : "#c8a96e";

  const card = (children: React.ReactNode, span?: boolean, border?: string) => (
    <div style={{
      gridColumn: span ? "1/-1" : undefined,
      background: "#0e0e18",
      border: `1px solid ${border || "#1a1a2e"}`,
      borderRadius: 12, padding: 14,
    }}>
      {children}
    </div>
  );

  const label = (text: string) => (
    <div style={{ fontSize: 10, color: "#555", marginBottom: 5 }}>{text}</div>
  );

  return (
    <div className="grid-2">

      {/* ── Profit hari ini ── */}
      {card(<>
        {label("PROFIT HARI INI")}
        <div style={{ fontSize: 22, fontWeight: 700, color: game.profit >= 0 ? "#22c55e" : "#ef4444", fontFamily: "monospace" }}>
          {game.profit >= 0 ? "+" : ""}{fmt(game.profit)}
        </div>
      </>)}

      {/* ── Total profit ── */}
      {card(<>
        {label("TOTAL PROFIT")}
        <div style={{ fontSize: 22, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace" }}>{fmt(game.totalProfit)}</div>
      </>)}

      {/* ── Gaji tim ── */}
      {card(<>
        {label("GAJI TIM/HARI")}
        <div style={{ fontSize: 18, fontWeight: 700, color: "#ef4444", fontFamily: "monospace" }}>-{fmt(totalSalary)}</div>
        <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>{staff.length} karyawan</div>
      </>)}

      {/* ── Kas tersisa ── */}
      {card(<>
        {label("KAS TERSISA")}
        <div style={{ fontSize: 18, fontWeight: 700, color: game.cash < 100_000_000 ? "#ef4444" : "#c8a96e", fontFamily: "monospace" }}>{fmt(game.cash)}</div>
        <div style={{ fontSize: 9, color: game.cash < 100_000_000 ? "#ef4444" : "#444", marginTop: 2 }}>
          {game.cash < 100_000_000 ? "⚠️ Kas menipis!" : "Likuiditas aman"}
        </div>
      </>)}

      {/* ── Progress menang ── */}
      {card(<>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: progressColor }}>🏆 Progress Menang</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: progressColor, fontFamily: "monospace" }}>{progressPct}%</div>
        </div>
        <Bar val={progressPct} max={100} color={progressColor} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#444", marginTop: 4 }}>
          <span>{fmt(game.totalProfit)}</span>
          <span>Target: {fmt(cfg.targetProfit)}</span>
        </div>
      </>, true)}

      {/* ── Neraca ringkas ── */}
      {card(<>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#c8a96e", marginBottom: 10 }}>📊 Neraca & Rasio</div>
        <div className="grid-2" style={{ gap: 8, marginBottom: 10 }}>
          {[
            { label: "Total Kredit", val: fmt(game.loans), color: "#c8a96e" },
            { label: "Total Simpanan", val: fmt(game.deposits), color: "#60a5fa" },
            { label: "LDR", val: game.ldr.toFixed(1) + "%", color: game.ldr > 92 ? "#ef4444" : game.ldr > 78 ? "#f59e0b" : "#22c55e" },
            { label: "NIM", val: game.nim.toFixed(2) + "%", color: game.nim >= 3 ? "#22c55e" : "#f59e0b" },
          ].map((item) => (
            <div key={item.label} style={{ background: "#0d0d14", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: "#444" }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: item.color, fontFamily: "monospace" }}>{item.val}</div>
            </div>
          ))}
        </div>
      </>, true)}

      {/* ── Status staf ── */}
      {card(<>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 10 }}>👥 Status Staf</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {[
            { label: "Aktif", val: aktif, color: "#22c55e", icon: "✅" },
            { label: "Burnout", val: burnout, color: "#ef4444", icon: "🔴" },
            { label: "Istirahat", val: istirahat, color: "#f59e0b", icon: "😴" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "#0d0d14", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 13 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#444" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: "#444" }}>
          Avg skill: <span style={{ color: "#a78bfa", fontFamily: "monospace" }}>{avgSkill.toFixed(1)}/10</span>
          {burnout > 0 && <span style={{ color: "#ef4444", marginLeft: 8 }}>⚠️ {burnout} staf butuh istirahat!</span>}
        </div>
      </>, true)}

      {/* ── Ringkasan portofolio ── */}
      {card(<>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginBottom: 10 }}>📋 Ringkasan Portofolio</div>
        <div className="grid-2" style={{ gap: 8 }}>
          {[
            { label: "Total Debitur", val: loanPortfolio.length, color: "#c8a96e", icon: "💳" },
            { label: "Kredit Macet", val: macet, color: macet > 0 ? "#ef4444" : "#22c55e", icon: "⚠️" },
            { label: "Total Nasabah Simpanan", val: savingsPortfolio.length, color: "#60a5fa", icon: "🏦" },
            { label: "Deposito Jatuh Tempo ≤3h", val: jatuhTempo, color: jatuhTempo > 0 ? "#f59e0b" : "#22c55e", icon: "⏰" },
          ].map((item) => (
            <div key={item.label} style={{ background: "#0d0d14", borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 9, color: "#444" }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: item.color, fontFamily: "monospace" }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>
      </>, true)}

      {/* ── Kesehatan Bank ── */}
      {card(<>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#c8a96e", marginBottom: 10 }}>🎯 Kesehatan Bank</div>
        {[
          { label: "CAR", val: game.car, max: 25, color: carColor, min: "Min 8%" },
          { label: "NPL", val: game.npl, max: 10, color: nplColor, min: "Maks 5%" },
          { label: "Reputasi", val: game.reputation, max: 100, color: repColor, min: "Min 40%" },
        ].map((r) => (
          <div key={r.label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 3 }}>
              <span>{r.label} <span style={{ fontSize: 9, color: "#444" }}>({r.min})</span></span>
              <span style={{ color: r.color, fontFamily: "monospace" }}>{r.val}%</span>
            </div>
            <Bar val={r.val} max={r.max} color={r.color} />
          </div>
        ))}
      </>, true)}

    </div>
  );
}

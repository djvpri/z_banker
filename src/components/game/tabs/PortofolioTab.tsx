// src/components/game/tabs/PortofolioTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { fmt } from "@/lib/gameFormat";
import { Bar } from "../ui/Shared";

export default function PortofolioTab() {
  const loanPortfolio = useGameStore((s) => s.loanPortfolio);
  const savingsPortfolio = useGameStore((s) => s.savingsPortfolio);
  const { handleEarlyRepayment, handleSeizeCollateral } = useGameActions();

  const groups = [
    { label: "Lancar (Kol. 1)", items: loanPortfolio.filter((l) => l.status === "lancar"), color: "#22c55e" },
    { label: "Perhatian (Kol. 2)", items: loanPortfolio.filter((l) => l.status === "perhatian"), color: "#f59e0b" },
    { label: "Macet (Kol. 3-5)", items: loanPortfolio.filter((l) => l.status === "macet"), color: "#ef4444" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "#0e0e18", border: "1px solid #c8a96e33", borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>TOTAL KREDIT</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#c8a96e", fontFamily: "monospace" }}>{fmt(loanPortfolio.reduce((a, l) => a + l.amount, 0))}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{loanPortfolio.length} debitur</div>
        </div>
        <div style={{ background: "#0e0e18", border: "1px solid #60a5fa33", borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>TOTAL SIMPANAN</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace" }}>{fmt(savingsPortfolio.reduce((a, s) => a + s.amount, 0))}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{savingsPortfolio.length} nasabah</div>
        </div>
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#c8a96e", marginBottom: 10 }}>💳 Kualitas Kredit</div>
        {groups.map((g) => (
          <div key={g.label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginBottom: 3 }}>
              <span style={{ color: g.color }}>{g.label}</span>
              <span style={{ fontFamily: "monospace" }}>{g.items.length} · {fmt(g.items.reduce((a, l) => a + l.amount, 0))}</span>
            </div>
            <Bar val={g.items.length} max={Math.max(loanPortfolio.length, 1)} color={g.color} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#c8a96e", marginBottom: 8 }}>📋 Kredit</div>
      {loanPortfolio.map((loan) => {
        const prog = Math.round((loan.paidMonths / loan.tenor) * 100);
        const rc = loan.risk === "low" ? "#22c55e" : loan.risk === "medium" ? "#f59e0b" : "#ef4444";
        const sc = loan.status === "lancar" ? "#22c55e" : loan.status === "perhatian" ? "#f59e0b" : "#ef4444";
        return (
          <div key={loan.id} style={{ background: "#0e0e18", border: `1px solid ${rc}22`, borderRadius: 10, padding: 12, marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#ddd", fontSize: 12 }}>{loan.debtor}</div>
                <div style={{ fontSize: 10, color: "#555" }}>{loan.type} · {loan.rate}% p.a.{loan.collateral ? " · 🏠 " + loan.collateral : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "monospace", color: "#c8a96e", fontSize: 13 }}>{fmt(loan.amount)}</div>
                <div style={{ fontSize: 10, color: sc }}>{loan.status}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", marginBottom: 3 }}>
              <span>Tenor: {loan.paidMonths}/{loan.tenor} bln</span>
              <span style={{ color: rc }}>Risiko: {loan.risk === "low" ? "Rendah" : loan.risk === "medium" ? "Sedang" : "Tinggi"}</span>
              <span>{prog}%</span>
            </div>
            <Bar val={prog} max={100} color={rc} height={4} />
            <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
              <button onClick={() => handleEarlyRepayment(loan.id)} style={{ fontSize: 9, background: "#22c55e18", border: "1px solid #22c55e33", color: "#22c55e", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>💰 Lunasi Awal</button>
              {loan.status === "perhatian" && loan.collateral && (
                <button onClick={() => handleSeizeCollateral(loan.id)} style={{ fontSize: 9, background: "#ef444418", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>🏠 Sita Kolateral</button>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", margin: "14px 0 8px" }}>🏦 Tabungan & Deposito</div>
      {savingsPortfolio.map((sav) => {
        const isDeposito = sav.maturity > 0;
        const prog = isDeposito ? Math.round(((sav.maturity - sav.daysLeft) / sav.maturity) * 100) : 100;
        return (
          <div key={sav.id} style={{ background: "#0e0e18", border: "1px solid #60a5fa22", borderRadius: 10, padding: 12, marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: isDeposito ? 6 : 0 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#ddd", fontSize: 12 }}>{sav.holder}</div>
                <div style={{ fontSize: 10, color: "#555" }}>{sav.type} · {sav.rate}% p.a.</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "monospace", color: "#60a5fa", fontSize: 13 }}>{fmt(sav.amount)}</div>
                {isDeposito && <div style={{ fontSize: 10, color: "#555" }}>Jatuh tempo {sav.daysLeft}h</div>}
              </div>
            </div>
            {isDeposito && <Bar val={prog} max={100} color="#60a5fa" height={4} />}
          </div>
        );
      })}
    </div>
  );
}

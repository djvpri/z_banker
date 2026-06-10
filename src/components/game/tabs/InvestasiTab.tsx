// src/components/game/tabs/InvestasiTab.tsx
"use client";
import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { fmt, M } from "@/lib/gameFormat";
import { INVESTMENT_OPTIONS } from "@/lib/gameConstants";

const riskColor = (r: string) => (r === "low" ? "#22c55e" : r === "medium" ? "#f59e0b" : "#ef4444");

export default function InvestasiTab() {
  const investments = useGameStore((s) => s.investments);
  const game = useGameStore((s) => s.game);
  const { handleInvest, handleWithdrawInvest } = useGameActions();

  const [selInst, setSelInst] = useState("sbi");
  const [selAmt, setSelAmt] = useState("50");
  const opt = INVESTMENT_OPTIONS.find((o) => o.id === selInst) || INVESTMENT_OPTIONS[0];
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const dailyReturn = investments.reduce((sum, inv) => {
    const o = INVESTMENT_OPTIONS.find((x) => x.id === inv.instrument);
    return o ? sum + Math.floor((inv.amount * (o.rateAnnual / 100)) / 365) : sum;
  }, 0);

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 4 }}>💹 Investasi Idle Cash</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 9, color: "#555" }}>TOTAL DIINVESTASIKAN</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace" }}>{fmt(totalInvested)}</div>
        </div>
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 9, color: "#555" }}>RETURN HARIAN EST.</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", fontFamily: "monospace" }}>+{fmt(dailyReturn)}</div>
        </div>
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #c8a96e33", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#c8a96e", marginBottom: 10 }}>+ Investasi Baru</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {INVESTMENT_OPTIONS.map((o) => (
            <button key={o.id} onClick={() => { setSelInst(o.id); setSelAmt(String(o.minAmount / M)); }}
              style={{ background: selInst === o.id ? "#c8a96e22" : "#0d0d14", border: `1px solid ${selInst === o.id ? "#c8a96e55" : "#222"}`, color: selInst === o.id ? "#c8a96e" : "#666", borderRadius: 7, padding: "6px 10px", cursor: "pointer", fontSize: 11 }}>
              {o.icon} {o.name} <span style={{ color: riskColor(o.risk), fontSize: 9 }}>({o.rateAnnual}%)</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#777", marginBottom: 8 }}>
          {opt.desc} · Min {fmt(opt.minAmount)} · Risiko: <span style={{ color: riskColor(opt.risk) }}>{opt.risk === "low" ? "Rendah" : opt.risk === "medium" ? "Sedang" : "Tinggi"}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="number" value={selAmt} min={opt.minAmount / M} step={25}
            onChange={(e) => setSelAmt(e.target.value)}
            style={{ flex: 1, background: "#0d0d14", border: "1px solid #2a2a3a", color: "#ddd", borderRadius: 6, padding: "6px 10px", fontSize: 12 }} />
          <span style={{ color: "#555", fontSize: 11 }}>jt</span>
          <button onClick={() => handleInvest(selInst, (parseInt(selAmt) || 0) * M)}
            style={{ background: "linear-gradient(135deg,#c8a96e,#8a6030)", color: "#000", border: "none", borderRadius: 7, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            Investasi
          </button>
        </div>
      </div>

      {investments.length === 0 && (
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 20, textAlign: "center", color: "#555" }}>Belum ada investasi aktif.</div>
      )}
      {investments.map((inv) => {
        const o = INVESTMENT_OPTIONS.find((x) => x.id === inv.instrument);
        if (!o) return null;
        const daysHeld = game.day - inv.startDay;
        const dailyEst = Math.floor((inv.amount * (o.rateAnnual / 100)) / 365);
        const earned = Math.floor(dailyEst * daysHeld);
        return (
          <div key={inv.id} style={{ background: "#0e0e18", border: `1px solid ${riskColor(o.risk)}22`, borderRadius: 10, padding: 12, marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{o.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#ddd", fontSize: 12 }}>{o.name}</div>
              <div style={{ fontSize: 10, color: "#555" }}>
                {fmt(inv.amount)} · {daysHeld === 0 ? "baru diinvestasikan" : daysHeld + " hari"} ·{" "}
                {daysHeld === 0
                  ? <span style={{ color: "#60a5fa" }}>Est. harian: +{fmt(dailyEst)}</span>
                  : <span style={{ color: "#22c55e" }}>Return: +{fmt(earned)}</span>}
              </div>
            </div>
            <button onClick={() => handleWithdrawInvest(String(inv.id))}
              style={{ background: "#ef444418", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11 }}>
              Cairkan
            </button>
          </div>
        );
      })}
    </div>
  );
}

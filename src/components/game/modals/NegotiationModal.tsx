// src/components/game/modals/NegotiationModal.tsx
"use client";
import { useState } from "react";
import { Negotiation } from "@/types/game";
import { fmt } from "@/lib/gameFormat";

interface Props {
  negotiation: Negotiation;
  loanRate: number;
  onAccept: (rate: number) => void;
  onReject: () => void;
  onCounter: (rate: number) => void;
}

export default function NegotiationModal({ negotiation, loanRate, onAccept, onReject, onCounter }: Props) {
  const [counterInput, setCounterInput] = useState(parseFloat((loanRate - 0.5).toFixed(1)));
  const c = negotiation.customer;
  const offered = negotiation.proposedRate;
  const round = (c.negotiationRound || 0) + 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "#13131e", border: "2px solid #60a5fa44", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 28 }}>💬</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#60a5fa" }}>Negosiasi Kredit</div>
            <div style={{ fontSize: 10, color: "#555" }}>Putaran {round} dari 3</div>
          </div>
        </div>
        <div style={{ background: "#0d0d14", borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: "#ddd", marginBottom: 4 }}>{c.name}</div>
          <div style={{ fontSize: 10, color: "#555" }}>{c.type} · {fmt(c.amount)} · Skor {c.score}</div>
          {c.collateral && <div style={{ fontSize: 10, color: "#a78bfa", marginTop: 4 }}>🏠 Kolateral: {c.collateral} ({fmt(c.collateralValue)})</div>}
          <div style={{ marginTop: 8, padding: "6px 10px", background: "#111", borderRadius: 6, fontSize: 11, color: "#f59e0b" }}>
            💬 Nasabah minta bunga: <strong style={{ color: "#60a5fa" }}>{offered}%</strong>
            <span style={{ color: "#555" }}> (bank: {loanRate}%)</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#666", marginBottom: 10 }}>Pilih respons:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => onAccept(offered)} style={{ background: "#22c55e18", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 9, padding: "9px 12px", cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>✅ Setujui {offered}%</div>
            <div style={{ fontSize: 10, color: "#777", marginTop: 2 }}>Terima rate nasabah — deal langsung.</div>
          </button>
          <div style={{ background: "#60a5fa11", border: "1px solid #60a5fa33", borderRadius: 9, padding: "9px 12px" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#60a5fa", marginBottom: 6 }}>🔄 Counter-offer</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="number"
                value={counterInput}
                min={offered}
                max={loanRate}
                step={0.5}
                onChange={(e) => setCounterInput(parseFloat(e.target.value) || offered)}
                style={{ flex: 1, background: "#0d0d14", border: "1px solid #2a2a3a", color: "#ddd", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}
              />
              <span style={{ color: "#555", fontSize: 11 }}>%</span>
              <button onClick={() => onCounter(counterInput)} style={{ background: "#60a5fa22", border: "1px solid #60a5fa44", color: "#60a5fa", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                Tawar
              </button>
            </div>
          </div>
          <button onClick={onReject} style={{ background: "#ef444418", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 9, padding: "9px 12px", cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>❌ Tolak & Batalkan</div>
            <div style={{ fontSize: 10, color: "#777", marginTop: 2 }}>Nasabah pergi ke bank lain. Reputasi -2.</div>
          </button>
        </div>
      </div>
    </div>
  );
}

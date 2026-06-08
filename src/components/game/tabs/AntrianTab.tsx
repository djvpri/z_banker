// src/components/game/tabs/AntrianTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { fmt } from "@/lib/gameFormat";
import { BRANCHES } from "@/lib/gameConstants";
import { Bar } from "../ui/Shared";
import NegotiationModal from "../modals/NegotiationModal";
import { Customer } from "@/types/game";

const isLoanType = (type: string) => ["Deposito", "Buka Rekening", "Deposito Korporat"].indexOf(type) < 0;

export default function AntrianTab() {
  const customers = useGameStore((s) => s.customers);
  const creditPipeline = useGameStore((s) => s.creditPipeline);
  const staff = useGameStore((s) => s.staff);
  const game = useGameStore((s) => s.game);
  const rates = useGameStore((s) => s.rates);
  const negotiation = useGameStore((s) => s.negotiation);
  const { handleCustomer, handleNegotiationAccept, handleNegotiationReject, handleNegotiationCounter } = useGameActions();

  const branch = BRANCHES[game.branch];

  return (
    <div>
      {negotiation && (
        <NegotiationModal
          negotiation={negotiation}
          loanRate={rates.loan}
          onAccept={handleNegotiationAccept}
          onReject={handleNegotiationReject}
          onCounter={handleNegotiationCounter}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e" }}>👥 Antrian ({customers.length}/{branch.maxCustomers})</div>
      </div>

      {customers.length === 0 && creditPipeline.length === 0 && (
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 24, textAlign: "center", color: "#555" }}>
          Tidak ada antrian. Tekan Next Day.
        </div>
      )}

      {/* Credit Pipeline */}
      {creditPipeline.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>⏳ Pipeline Kredit ({creditPipeline.length})</div>
          {creditPipeline.map((p) => {
            const stages = p.customer.processDays;
            const done = stages - p.daysLeft;
            const pct = Math.round((done / stages) * 100);
            return (
              <div key={p.id} style={{ background: "#0e0e18", border: "1px solid #a78bfa33", borderRadius: 10, padding: 10, marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ fontSize: 12, color: "#ddd" }}>{p.customer.name} <span style={{ fontSize: 10, color: "#555" }}>{p.customer.type}</span></div>
                  <div style={{ fontSize: 11, color: "#a78bfa" }}>{fmt(p.customer.amount)} @ {p.agreedRate}%</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", marginBottom: 3 }}>
                  <span>Sedang dikaji analis</span>
                  <span>{p.daysLeft} hari lagi</span>
                </div>
                <Bar val={pct} max={100} color="#a78bfa" height={4} />
              </div>
            );
          })}
        </div>
      )}

      {customers.map((c) => (
        <CustomerCard key={c.id} c={c} staff={staff} onAction={handleCustomer} />
      ))}
    </div>
  );
}

function CustomerCard({ c, staff, onAction }: { c: Customer; staff: ReturnType<typeof useGameStore.getState>["staff"]; onAction: (c: Customer, action: "accept" | "reject") => void }) {
  const isLoan = isLoanType(c.type);
  const risky = isLoan && (c.score < 500 || c.risk > 70);
  const isVip = c.type === "Deposito Korporat";
  const icon = c.type === "Deposito" ? "💰" : c.type === "Buka Rekening" ? "📋" : c.type === "Deposito Korporat" ? "🏛️" : c.type === "Pinjaman KPR" ? "🏠" : "📄";

  const activeTellers = staff.filter((s) => s.role === "teller" && s.status === "aktif");
  const activeAnalysts = staff.filter((s) => s.role === "analis" && s.status === "aktif");

  const canProcessDeposit = !isLoan && activeTellers.length > 0;
  const canProcessLoan = isLoan && activeAnalysts.length > 0;

  const analyst = activeAnalysts.length > 0 ? activeAnalysts.reduce((best, s) => (s.workload < best.workload ? s : best), activeAnalysts[0]) : null;
  const analystOverload = !!analyst && analyst.workload >= 80;

  const acceptBlocked = isLoan ? !canProcessLoan : !canProcessDeposit;

  return (
    <div style={{ background: isVip ? "#1a1208" : "#0e0e18", border: `1px solid ${risky ? "#ef444433" : isVip ? "#c8a96e44" : "#1a1a2e"}`, borderRadius: 12, padding: 12, marginBottom: 7 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: isLoan ? 8 : 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontWeight: 700, color: "#ddd" }}>{c.name}</span>
            {isVip && <span style={{ fontSize: 9, background: "#c8a96e33", color: "#c8a96e", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>VIP</span>}
            <span style={{ fontSize: 10, color: "#555" }}>{c.type}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#c8a96e", fontFamily: "monospace" }}>{fmt(c.amount)}</span>
            {isLoan && <span style={{ fontSize: 10, color: risky ? "#ef4444" : "#22c55e" }}>Skor {c.score} {risky ? "⚠️ Berisiko" : "✅ Aman"}</span>}
            {c.wantsNegotiate && c.negotiationRound === 0 && <span style={{ fontSize: 9, background: "#60a5fa22", color: "#60a5fa", padding: "1px 5px", borderRadius: 3 }}>💬 Mau Nego</span>}
            {c.needsCollateral && <span style={{ fontSize: 9, background: "#a78bfa22", color: "#a78bfa", padding: "1px 5px", borderRadius: 3 }}>🏠 Ada Kolateral</span>}
            {isLoan && c.processDays > 1 && <span style={{ fontSize: 9, background: "#f59e0b22", color: "#f59e0b", padding: "1px 5px", borderRadius: 3 }}>⏳ {c.processDays}h proses</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button
            disabled={acceptBlocked}
            onClick={() => onAction(c, "accept")}
            title={acceptBlocked ? (isLoan ? "Analis Kredit sedang istirahat!" : "Teller sedang istirahat!") : ""}
            style={{ background: acceptBlocked ? "#1a1a1a" : "#22c55e20", border: `1px solid ${acceptBlocked ? "#333" : "#22c55e44"}`, color: acceptBlocked ? "#444" : "#22c55e", borderRadius: 6, padding: "5px 10px", cursor: acceptBlocked ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700 }}
          >
            {acceptBlocked ? "🔒" : "✓"}
          </button>
          <button onClick={() => onAction(c, "reject")} style={{ background: "#ef444420", border: "1px solid #ef444444", color: "#ef4444", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✗</button>
        </div>
      </div>

      {!isLoan && acceptBlocked && (
        <div style={{ padding: "5px 9px", borderRadius: 6, background: "#1a0808", border: "1px solid #ef444433", fontSize: 10, color: "#ef4444", marginTop: 6 }}>
          🔒 Teller sedang istirahat — transaksi tidak bisa diproses. Tunggu besok.
        </div>
      )}

      {isLoan && (
        <div style={{ padding: "6px 9px", borderRadius: 6, background: acceptBlocked ? "#1a0808" : analystOverload ? "#1a1008" : "#0d0d14", border: `1px solid ${acceptBlocked ? "#ef444433" : analystOverload ? "#f59e0b33" : "#1e1e2e"}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13 }}>📋</span>
          {acceptBlocked ? (
            <span style={{ fontSize: 10, color: "#ef4444" }}>🔒 Analis Kredit sedang istirahat — pengajuan kredit tidak bisa diproses. Tunggu besok.</span>
          ) : (
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                <span style={{ color: "#aaa" }}>
                  Analis: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{analyst ? analyst.name : "—"}</span>
                  {analyst && <span style={{ color: "#555" }}> (skill {analyst.skill}/10)</span>}
                </span>
                {analyst && (
                  <span style={{ color: analystOverload ? "#f59e0b" : "#555" }}>
                    Beban {analyst.workload}% → {Math.min(100, analyst.workload + 25)}%{analystOverload ? " ⚠️" : ""}
                  </span>
                )}
              </div>
              {analyst && <Bar val={analyst.workload} max={100} color="#f59e0b" height={3} />}
              <div style={{ fontSize: 9, color: "#555", marginTop: 3 }}>
                NPL impact: <span style={{ color: risky ? "#ef4444" : "#22c55e" }}>
                  {risky ? "+" + Math.max(0.05, 0.4 - ((analyst ? analyst.skill : 3) - 3) * 0.04).toFixed(2) + "%" : "±0%"}
                </span>
                {risky && analyst && analyst.skill >= 7 && <span style={{ color: "#22c55e" }}> (skill tinggi mitigasi risiko)</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

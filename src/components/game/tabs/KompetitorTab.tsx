// src/components/game/tabs/KompetitorTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { BRANCHES, getCompetitionAggression } from "@/lib/gameConstants";
import { fmt, clamp } from "@/lib/gameFormat";
import { Bar } from "../ui/Shared";

export default function KompetitorTab() {
  const game = useGameStore((s) => s.game);
  const staff = useGameStore((s) => s.staff);
  const competitors = useGameStore((s) => s.competitors);
  const branch = BRANCHES[game.branch];

  const aggression = getCompetitionAggression(game.day, game.econPhase);
  const aggLevel = aggression < 0.9 ? "Rendah" : aggression < 1.3 ? "Sedang" : aggression < 1.8 ? "Tinggi" : "Ekstrem";
  const aggColor = aggression < 0.9 ? "#22c55e" : aggression < 1.3 ? "#60a5fa" : aggression < 1.8 ? "#f59e0b" : "#ef4444";

  const totalDeposits = game.deposits + competitors.reduce((s, b) => s + b.deposits, 0);
  const totalLoans = game.loans + competitors.reduce((s, b) => s + b.loans, 0);
  const myName = game.bankName || "Bank Nusantara";
  const shareRows = [{ label: myName, val: game.deposits, color: "#c8a96e" }].concat(
    competitors.map((b) => ({ label: b.name, val: b.deposits, color: "#ef4444" }))
  );
  const loanShareRows = [{ label: myName, val: game.loans, color: "#c8a96e" }].concat(
    competitors.map((b) => ({ label: b.name, val: b.loans, color: "#ef4444" }))
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e" }}>⚔️ Persaingan Pasar ({competitors.length} bank aktif)</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: aggColor, background: aggColor + "22", padding: "2px 8px", borderRadius: 6 }}>
          🔥 Persaingan: {aggLevel}
        </div>
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #c8a96e44", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{branch.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: "#c8a96e" }}>{myName} (KAMU)</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{branch.name} · {staff.length} staf</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", fontFamily: "monospace" }}>Rep {game.reputation}%</div>
            <div style={{ fontSize: 10, color: "#aaa" }}>💰 {fmt(game.deposits)} · 📋 {fmt(game.loans)}</div>
          </div>
        </div>
      </div>

      {competitors.length === 0 && (
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 20, textAlign: "center", color: "#555" }}>Tidak ada kompetitor saat ini.</div>
      )}
      {competitors.map((b) => {
        const ahead = b.reputation > game.reputation;
        const stratColor = b.strategy === "agresif" ? "#ef4444" : b.strategy === "ekspansif" ? "#f59e0b" : b.strategy === "konservatif" ? "#22c55e" : "#60a5fa";
        const stratIcon = b.strategy === "agresif" ? "⚡" : b.strategy === "ekspansif" ? "📈" : b.strategy === "konservatif" ? "🛡️" : "🔒";
        const lifeRemain = b.lifespan - b.age;
        return (
          <div key={b.id} style={{ background: "#0d0d14", border: `1px solid ${b.exitWarning ? "#ef444433" : ahead ? "#ef444422" : "#1e1e2e"}`, borderRadius: 12, padding: 13, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: "#ddd" }}>🏦 {b.name}</span>
                  {b.exitWarning && <span style={{ fontSize: 9, background: "#ef444422", color: "#ef4444", padding: "1px 5px", borderRadius: 3 }}>⚠️ Mau Keluar</span>}
                  {ahead && <span style={{ fontSize: 9, background: "#ef444422", color: "#ef4444", padding: "1px 5px", borderRadius: 3 }}>↑ Unggul</span>}
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
                  <span style={{ color: stratColor }}>{stratIcon} {b.strategy.charAt(0).toUpperCase() + b.strategy.slice(1)}</span>
                  <span style={{ color: "#444" }}>·</span>
                  <span style={{ color: "#555" }}>{b.speciality === "loan" ? "Kredit" : b.speciality === "deposit" ? "Deposito" : b.speciality === "retail" ? "Retail" : "Korporat"}</span>
                  <span style={{ color: "#444" }}>·</span>
                  <span style={{ color: b.exitWarning ? "#ef4444" : "#555" }}>Hari ke-{b.age}/{b.lifespan}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: ahead ? "#ef4444" : "#22c55e", fontFamily: "monospace" }}>Rep {b.reputation.toFixed(0)}%</div>
                <div style={{ fontSize: 10, color: "#777" }}>💰 {fmt(b.deposits)} · 📋 {fmt(b.loans)}</div>
              </div>
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#444", marginBottom: 3 }}>
                <span>Reputasi vs Kamu</span>
                <span style={{ color: ahead ? "#ef4444" : "#22c55e" }}>{ahead ? "+" : ""}{(b.reputation - game.reputation).toFixed(0)} poin</span>
              </div>
              <div style={{ background: "#1a1a24", borderRadius: 3, height: 4, position: "relative" }}>
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#333" }} />
                <div style={{ width: clamp(b.reputation, 0, 100) + "%", background: ahead ? "#ef4444" : "#22c55e", height: "100%", borderRadius: 3 }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#444", marginBottom: 2 }}>
                <span>Eksistensi di pasar</span>
                <span style={{ color: b.exitWarning ? "#ef4444" : "#555" }}>{lifeRemain} hari lagi</span>
              </div>
              <div style={{ background: "#1a1a24", borderRadius: 3, height: 3 }}>
                <div style={{ width: Math.round((b.age / b.lifespan) * 100) + "%", background: b.exitWarning ? "#ef4444" : "#555", height: "100%", borderRadius: 3, transition: "width 0.4s" }} />
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14, marginTop: 8 }}>
        <div style={{ fontSize: 11, color: "#c8a96e", fontWeight: 700, marginBottom: 8 }}>📊 Pangsa Pasar Deposito</div>
        {shareRows.map((item, i) => {
          const pct = Math.round((item.val / totalDeposits) * 100);
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 3 }}>
                <span>{item.label}</span>
                <span style={{ color: item.color, fontFamily: "monospace" }}>{pct}% · {fmt(item.val)}</span>
              </div>
              <Bar val={pct} max={100} color={item.color} />
            </div>
          );
        })}
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14, marginTop: 8 }}>
        <div style={{ fontSize: 11, color: "#c8a96e", fontWeight: 700, marginBottom: 8 }}>📋 Pangsa Pasar Kredit</div>
        {loanShareRows.map((item, i) => {
          const pct = Math.round((item.val / totalLoans) * 100);
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 3 }}>
                <span>{item.label}</span>
                <span style={{ color: item.color, fontFamily: "monospace" }}>{pct}% · {fmt(item.val)}</span>
              </div>
              <Bar val={pct} max={100} color={item.color} />
            </div>
          );
        })}
      </div>

      <div style={{ background: "#0d0d14", borderRadius: 8, padding: 10, marginTop: 8, fontSize: 10, color: "#555" }}>
        <div style={{ fontWeight: 700, color: "#666", marginBottom: 5 }}>Strategi Kompetitor:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <span>⚡ <span style={{ color: "#ef4444" }}>Agresif</span> — pertumbuhan cepat, volatil</span>
          <span>📈 <span style={{ color: "#f59e0b" }}>Ekspansif</span> — tumbuh stabil</span>
          <span>🛡️ <span style={{ color: "#22c55e" }}>Konservatif</span> — pertumbuhan lambat</span>
          <span>🔒 <span style={{ color: "#60a5fa" }}>Defensif</span> — jaga posisi</span>
        </div>
      </div>
    </div>
  );
}

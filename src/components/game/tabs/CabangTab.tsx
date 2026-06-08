// src/components/game/tabs/CabangTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { BRANCHES } from "@/lib/gameConstants";
import { fmt } from "@/lib/gameFormat";

export default function CabangTab() {
  const game = useGameStore((s) => s.game);
  const { handleUpgradeBranch } = useGameActions();

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 12 }}>🏢 Upgrade Cabang</div>
      {BRANCHES.map((b, i) => {
        const current = i === game.branch;
        const done = i < game.branch;
        const next = i === game.branch + 1;
        return (
          <div key={b.name} style={{ background: current ? "#1a1208" : "#0e0e18", border: `1px solid ${current ? "#c8a96e44" : done ? "#22c55e33" : "#1a1a2e"}`, borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>{b.icon}</span>
                  <span style={{ fontWeight: 700, color: "#ddd" }}>{b.name}</span>
                  {current && <span style={{ fontSize: 9, background: "#c8a96e33", color: "#c8a96e", padding: "1px 5px", borderRadius: 3 }}>AKTIF</span>}
                  {done && <span style={{ fontSize: 9, background: "#22c55e33", color: "#22c55e", padding: "1px 5px", borderRadius: 3 }}>✓</span>}
                </div>
                <div style={{ fontSize: 11, color: "#555" }}>Kapasitas: {b.maxCustomers} nasabah/hari</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {b.cost > 0 && <div style={{ fontSize: 12, color: "#c8a96e", fontFamily: "monospace", marginBottom: 6 }}>{fmt(b.cost)}</div>}
                {next && (
                  <button
                    onClick={handleUpgradeBranch}
                    style={{ background: game.cash >= b.cost ? "linear-gradient(135deg,#c8a96e,#8a6030)" : "#222", color: game.cash >= b.cost ? "#000" : "#555", border: "none", borderRadius: 7, padding: "7px 14px", cursor: game.cash >= b.cost ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11 }}
                  >
                    {game.cash >= b.cost ? "🚀 Upgrade" : "💰 Belum"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

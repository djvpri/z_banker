// src/components/game/tabs/BungaTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { fmt } from "@/lib/gameFormat";

const SLIDERS = [
  { key: "savings" as const, label: "🏦 Bunga Tabungan", min: 1, max: 12, step: 0.5, color: "#60a5fa" },
  { key: "loan" as const,    label: "📋 Bunga Kredit",   min: 5, max: 24, step: 0.5, color: "#c8a96e" },
];

export default function BungaTab() {
  const game = useGameStore((s) => s.game);
  const rates = useGameStore((s) => s.rates);
  const setRates = useGameStore((s) => s.setRates);

  return (
    <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 14 }}>💹 Atur Suku Bunga</div>
      {SLIDERS.map((r) => (
        <div key={r.key} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ color: "#aaa", fontSize: 12 }}>{r.label}</label>
            <span style={{ color: r.color, fontFamily: "monospace", fontWeight: 700 }}>{rates[r.key]}%</span>
          </div>
          <input
            type="range"
            min={r.min}
            max={r.max}
            step={r.step}
            value={rates[r.key]}
            onChange={(e) => setRates({ ...rates, [r.key]: parseFloat(e.target.value) })}
            style={{ width: "100%", accentColor: r.color }}
          />
        </div>
      ))}
      <div style={{ background: "#0d0d14", borderRadius: 8, padding: 12 }}>
        <div className="grid-3">
          <div>
            <div style={{ fontSize: 9, color: "#555" }}>Pendapatan</div>
            <div style={{ color: "#22c55e", fontFamily: "monospace", fontSize: 12 }}>+{fmt(Math.floor((game.loans * (rates.loan / 100)) / 365))}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#555" }}>Biaya Bunga</div>
            <div style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 12 }}>-{fmt(Math.floor((game.deposits * (rates.savings / 100)) / 365))}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#555" }}>NIM Est.</div>
            <div style={{ color: "#f59e0b", fontFamily: "monospace", fontSize: 12 }}>{Math.max(0, rates.loan - rates.savings - 1.5).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

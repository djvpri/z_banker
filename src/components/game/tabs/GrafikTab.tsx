// src/components/game/tabs/GrafikTab.tsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useGameStore } from "@/store/gameStore";

export default function GrafikTab() {
  const profitHistory = useGameStore((s) => s.profitHistory);

  return (
    <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 12 }}>📈 Profit Harian (juta Rp)</div>
      {profitHistory.length < 2 ? (
        <div style={{ textAlign: "center", color: "#555", padding: 32 }}>Mainkan beberapa hari dulu...</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={profitHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#555" }} />
            <YAxis tick={{ fontSize: 9, fill: "#555" }} />
            <Tooltip
              contentStyle={{ background: "#13131e", border: "1px solid #2a2a3a", borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: "#c8a96e" }}
              formatter={(v: number) => [v + "jt"]}
            />
            <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

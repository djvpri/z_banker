// src/components/game/tabs/CamelsTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { calcCAMELS } from "@/lib/camels";

export default function CamelsTab() {
  const game = useGameStore((s) => s.game);
  const staff = useGameStore((s) => s.staff);
  const cam = calcCAMELS(game, staff);

  const dims = [
    { key: "C", label: "Capital Adequacy", detail: "CAR " + game.car + "%", val: cam.C },
    { key: "A", label: "Asset Quality", detail: "NPL " + game.npl + "%", val: cam.A },
    { key: "M", label: "Management", detail: "Avg skill tim", val: cam.M },
    { key: "E", label: "Earnings", detail: "NIM " + game.nim + "%", val: cam.E },
    { key: "L", label: "Liquidity", detail: "LDR " + game.ldr + "%", val: cam.L },
    { key: "S", label: "Sensitivity", detail: "Reputasi " + game.reputation + "%", val: cam.S },
  ];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 4 }}>⚖️ CAMELS Rating OJK</div>
      <div style={{ fontSize: 10, color: "#555", marginBottom: 14 }}>Standar penilaian kesehatan bank Bank Indonesia</div>
      <div style={{ background: "#0e0e18", border: `2px solid ${cam.color}44`, borderRadius: 14, padding: 16, textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>RATING KESELURUHAN</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: cam.color, fontFamily: "monospace" }}>{cam.avg}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: cam.color, marginTop: 4 }}>{cam.label}</div>
      </div>
      {dims.map((d) => {
        const dc = d.val >= 4 ? "#22c55e" : d.val >= 3 ? "#60a5fa" : d.val >= 2 ? "#f59e0b" : "#ef4444";
        return (
          <div key={d.key} style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 12, marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <span style={{ fontWeight: 700, color: dc, fontSize: 16, fontFamily: "monospace" }}>{d.key}</span>
                <span style={{ color: "#aaa", fontSize: 12, marginLeft: 8 }}>{d.label}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: dc, fontFamily: "monospace" }}>{d.val}/5</div>
                <div style={{ fontSize: 9, color: "#555" }}>{d.detail}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= d.val ? dc : "#1a1a24" }} />
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ background: "#0d0d14", borderRadius: 8, padding: 10, fontSize: 10, color: "#555", marginTop: 4 }}>
        💡 Rating 1=Buruk · 2=Kurang · 3=Cukup · 4=Baik · 5=Sangat Baik. OJK mensyaratkan minimal Cukup Sehat (≥2.5) untuk beroperasi normal.
      </div>
    </div>
  );
}

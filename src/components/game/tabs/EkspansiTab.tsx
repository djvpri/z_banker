// src/components/game/tabs/EkspansiTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { CITIES, ACQUISITION_TARGETS } from "@/lib/gameConstants";
import { fmt } from "@/lib/gameFormat";

export default function EkspansiTab() {
  const game = useGameStore((s) => s.game);
  const branches = useGameStore((s) => s.branches);
  const acquired = useGameStore((s) => s.acquired);
  const { handleExpand, handleAcquire } = useGameActions();

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 4 }}>🌍 Ekspansi & Akuisisi</div>
      {game.branch < 2 && (
        <div style={{ background: "#1a1208", border: "1px solid #f59e0b33", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: "#f59e0b" }}>
          ⚠️ Perlu upgrade ke Kantor Pusat untuk membuka cabang kota baru atau melakukan akuisisi.
        </div>
      )}

      {branches.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 7 }}>✅ Cabang ({branches.length})</div>
          {branches.map((b) => {
            const city = CITIES.find((c) => c.id === b.cityId);
            if (!city) return null;
            const isBuilding = b.status === "building";
            const daysLeft = Math.max(0, b.activeDay - game.day);
            return (
              <div key={b.cityId} style={{ background: isBuilding ? "#1a1208" : "#0d1a0d", border: `1px solid ${isBuilding ? "#f59e0b33" : "#22c55e33"}`, borderRadius: 10, padding: 11, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 18 }}>{city.icon}</span>
                  <span style={{ fontWeight: 700, color: "#ddd", marginLeft: 8, fontSize: 13 }}>{city.name}</span>
                  {isBuilding ? (
                    <span style={{ fontSize: 9, background: "#f59e0b22", color: "#f59e0b", padding: "1px 5px", borderRadius: 3, marginLeft: 6 }}>🏗️ Sedang Dibangun</span>
                  ) : (
                    <span style={{ fontSize: 9, background: "#22c55e22", color: "#22c55e", padding: "1px 5px", borderRadius: 3, marginLeft: 6 }}>✓ Aktif</span>
                  )}
                </div>
                <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>
                  {isBuilding ? (
                    <div style={{ color: "#f59e0b" }}>Aktif {daysLeft > 0 ? "dalam " + daysLeft + " hari" : "besok"}</div>
                  ) : (
                    <div>Dep: {fmt(b.deposits)}</div>
                  )}
                  <div>Buka hari {b.openDay}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, color: "#c8a96e", marginBottom: 8 }}>🏙️ Buka Cabang Kota Baru</div>
      {CITIES.map((city) => {
        const isOpen = branches.find((b) => b.cityId === city.id);
        const canOpen = game.branch >= 2 && !isOpen && game.cash >= city.cost;
        const locked = game.branch < 2;
        return (
          <div key={city.id} style={{ background: isOpen ? "#0d1a0d" : "#0e0e18", border: `1px solid ${isOpen ? "#22c55e33" : locked ? "#1a1a2e" : "#1e2030"}`, borderRadius: 11, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 20 }}>{city.icon}</span>
                  <span style={{ fontWeight: 700, color: isOpen ? "#ddd" : locked ? "#444" : "#bbb", fontSize: 13 }}>{city.name}</span>
                  <span style={{ fontSize: 9, color: "#555" }}>{city.marketSize === "besar" ? "🔴 Besar" : city.marketSize === "sedang" ? "🟡 Sedang" : "🟢 Kecil"}</span>
                  {isOpen && <span style={{ fontSize: 9, background: "#22c55e22", color: "#22c55e", padding: "1px 5px", borderRadius: 3 }}>✓ Sudah dibuka</span>}
                </div>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{city.desc}</div>
                <div style={{ display: "flex", gap: 10, fontSize: 10 }}>
                  <span style={{ color: "#60a5fa" }}>Max {city.maxCusts} nasabah/hari</span>
                  <span style={{ color: "#a78bfa" }}>+{Math.round(city.depBonus * 100)}% dep</span>
                </div>
              </div>
              {!isOpen && (
                <button onClick={() => handleExpand(city.id)} disabled={!canOpen} style={{ background: canOpen ? "linear-gradient(135deg,#c8a96e,#8a6030)" : "#222", color: canOpen ? "#000" : "#555", border: "none", borderRadius: 7, padding: "7px 12px", cursor: canOpen ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", marginLeft: 8 }}>
                  {fmt(city.cost)}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 8, marginTop: 14 }}>🤝 Akuisisi Bank Pesaing</div>
      {ACQUISITION_TARGETS.map((target) => {
        const isDone = acquired.indexOf(target.id) >= 0;
        const canBuy = game.branch >= 2 && !isDone && game.cash >= target.price;
        const hc = target.health === "sehat" ? "#22c55e" : target.health === "cukup" ? "#f59e0b" : "#ef4444";
        return (
          <div key={target.id} style={{ background: isDone ? "#0d1a0d" : "#0e0e18", border: `1px solid ${isDone ? "#22c55e33" : "#1e1e2e"}`, borderRadius: 11, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 20 }}>{target.icon}</span>
                  <span style={{ fontWeight: 700, color: isDone ? "#ddd" : "#bbb", fontSize: 13 }}>{target.name}</span>
                  <span style={{ fontSize: 9, color: hc, fontWeight: 700 }}>{target.health === "sehat" ? "✅ Sehat" : target.health === "cukup" ? "⚠️ Cukup" : "🔴 Buruk"}</span>
                  {isDone && <span style={{ fontSize: 9, background: "#22c55e22", color: "#22c55e", padding: "1px 5px", borderRadius: 3 }}>✓ Diakuisisi</span>}
                </div>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 5 }}>{target.desc}</div>
                <div style={{ display: "flex", gap: 8, fontSize: 10, flexWrap: "wrap" }}>
                  <span style={{ color: "#60a5fa" }}>Dep: {fmt(target.deposits)}</span>
                  <span style={{ color: "#c8a96e" }}>Kredit: {fmt(target.loans)}</span>
                  <span style={{ color: target.npl > 5 ? "#ef4444" : "#f59e0b" }}>NPL: {target.npl}%</span>
                  <span style={{ color: "#a78bfa" }}>{target.staff} staf</span>
                </div>
              </div>
              {!isDone && (
                <button onClick={() => handleAcquire(target.id)} disabled={!canBuy} style={{ background: canBuy ? "linear-gradient(135deg,#ef4444,#991b1b)" : "#222", color: canBuy ? "#fff" : "#555", border: "none", borderRadius: 7, padding: "7px 12px", cursor: canBuy ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", marginLeft: 8 }}>
                  {fmt(target.price)}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

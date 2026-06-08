// src/components/game/tabs/ProdukTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { ALL_PRODUCTS, BRANCHES } from "@/lib/gameConstants";
import { fmt } from "@/lib/gameFormat";

export default function ProdukTab() {
  const game = useGameStore((s) => s.game);
  const activeProducts = useGameStore((s) => s.activeProducts);
  const { handleUnlockProduct } = useGameActions();

  const totalPassive = activeProducts.reduce((s, pid) => {
    const p = ALL_PRODUCTS.find((x) => x.id === pid);
    return p && p.passiveIncome ? s + p.passiveIncome - (p.maintenanceCost || 0) : s;
  }, 0);
  const hasSvc = activeProducts.some((pid) => {
    const p = ALL_PRODUCTS.find((x) => x.id === pid);
    return p && p.passiveIncome > 0;
  });

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 4 }}>📦 Produk & Layanan Bank</div>
      <div style={{ fontSize: 10, color: "#555", marginBottom: 10 }}>{activeProducts.length}/{ALL_PRODUCTS.length} aktif</div>

      {hasSvc && (
        <div style={{ background: "#0d1a0d", border: "1px solid #22c55e33", borderRadius: 9, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: "#aaa" }}>
          💰 Passive income layanan: <span style={{ color: "#22c55e", fontFamily: "monospace", fontWeight: 700 }}>+{fmt(totalPassive)}/hari</span>
        </div>
      )}

      <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, marginBottom: 6 }}>🏧 Layanan & Infrastruktur</div>
      {ALL_PRODUCTS.filter((p) => p.passiveIncome > 0 || p.payrollDeposit > 0).map((prod) => {
        const isActive = activeProducts.indexOf(prod.id) >= 0;
        const canUnlock = !isActive && prod.fee > 0 && game.branch >= prod.unlockBranch && game.day >= prod.unlockDay;
        const locked = !isActive && (game.branch < prod.unlockBranch || game.day < prod.unlockDay);
        const netIncome = (prod.passiveIncome || 0) - (prod.maintenanceCost || 0);
        return (
          <div key={prod.id} style={{ background: isActive ? "#0d1a12" : "#0e0e18", border: `1px solid ${isActive ? "#22c55e33" : locked ? "#1a1a2e" : "#a78bfa33"}`, borderRadius: 11, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 18 }}>{prod.icon}</span>
                  <span style={{ fontWeight: 700, color: isActive ? "#ddd" : locked ? "#444" : "#bbb", fontSize: 13 }}>{prod.name}</span>
                  {isActive && <span style={{ fontSize: 9, background: "#22c55e22", color: "#22c55e", padding: "1px 5px", borderRadius: 3 }}>✓ Aktif</span>}
                  {locked && <span style={{ fontSize: 9, color: "#444" }}>🔒 {game.branch < prod.unlockBranch ? "Perlu " + BRANCHES[prod.unlockBranch].name : "Hari " + prod.unlockDay}</span>}
                </div>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{prod.desc}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 10 }}>
                  {prod.passiveIncome > 0 && <span style={{ color: "#22c55e" }}>+{fmt(netIncome)}/hari</span>}
                  {prod.maintenanceCost > 0 && <span style={{ color: "#ef4444" }}>-{fmt(prod.maintenanceCost)}/hari maint</span>}
                  {prod.custPerDay > 0 && <span style={{ color: "#60a5fa" }}>+{prod.custPerDay} walk-in/hari</span>}
                  {prod.payrollDeposit > 0 && <span style={{ color: "#a78bfa" }}>+{fmt(prod.payrollDeposit)} deposit/30h</span>}
                  {prod.nimBonus > 0 && <span style={{ color: "#f59e0b" }}>NIM +{prod.nimBonus}%</span>}
                </div>
              </div>
              {canUnlock && (
                <button onClick={() => handleUnlockProduct(prod.id)} style={{ background: game.cash >= prod.fee ? "linear-gradient(135deg,#c8a96e,#8a6030)" : "#222", color: game.cash >= prod.fee ? "#000" : "#555", border: "none", borderRadius: 7, padding: "6px 12px", cursor: game.cash >= prod.fee ? "pointer" : "not-allowed", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8 }}>
                  {fmt(prod.fee)}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ fontSize: 10, color: "#c8a96e", fontWeight: 700, marginBottom: 6, marginTop: 12 }}>📋 Produk Perbankan</div>
      {ALL_PRODUCTS.filter((p) => !p.passiveIncome && !p.payrollDeposit).map((prod) => {
        const isActive = activeProducts.indexOf(prod.id) >= 0;
        const canUnlock = !isActive && prod.fee > 0 && game.branch >= prod.unlockBranch && game.day >= prod.unlockDay;
        const locked = !isActive && (game.branch < prod.unlockBranch || game.day < prod.unlockDay);
        return (
          <div key={prod.id} style={{ background: isActive ? "#0d1a0d" : "#0e0e18", border: `1px solid ${isActive ? "#22c55e33" : locked ? "#1a1a2e" : "#c8a96e33"}`, borderRadius: 11, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 18 }}>{prod.icon}</span>
                  <span style={{ fontWeight: 700, color: isActive ? "#ddd" : locked ? "#444" : "#bbb", fontSize: 13 }}>{prod.name}</span>
                  {isActive && <span style={{ fontSize: 9, background: "#22c55e22", color: "#22c55e", padding: "1px 5px", borderRadius: 3 }}>✓ Aktif</span>}
                  {locked && <span style={{ fontSize: 9, color: "#444" }}>🔒 {game.branch < prod.unlockBranch ? "Perlu " + BRANCHES[prod.unlockBranch].name : "Hari " + prod.unlockDay}</span>}
                </div>
                <div style={{ fontSize: 10, color: "#555" }}>{prod.desc}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 10 }}>
                  {prod.nimBonus > 0 && <span style={{ color: "#f59e0b" }}>NIM +{prod.nimBonus}%</span>}
                  {prod.depBonus > 0 && <span style={{ color: "#60a5fa" }}>Dep +{Math.round(prod.depBonus * 100)}%</span>}
                </div>
              </div>
              {canUnlock && (
                <button onClick={() => handleUnlockProduct(prod.id)} style={{ background: game.cash >= prod.fee ? "linear-gradient(135deg,#c8a96e,#8a6030)" : "#222", color: game.cash >= prod.fee ? "#000" : "#555", border: "none", borderRadius: 7, padding: "6px 12px", cursor: game.cash >= prod.fee ? "pointer" : "not-allowed", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {fmt(prod.fee)}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

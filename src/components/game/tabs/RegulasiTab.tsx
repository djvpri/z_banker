// src/components/game/tabs/RegulasiTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { STRESS_SCENARIOS, LPS_PREMIUM_RATE } from "@/lib/gameConstants";
import { fmt } from "@/lib/gameFormat";

export default function RegulasiTab() {
  const game = useGameStore((s) => s.game);
  const lpsEnabled = useGameStore((s) => s.lpsEnabled);
  const bmpkLog = useGameStore((s) => s.bmpkLog);
  const stressResult = useGameStore((s) => s.stressResult);
  const { handleToggleLps, handleBmpkCheck, handleStressTest } = useGameActions();

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 14 }}>⚖️ Risiko & Regulasi</div>

      <div style={{ background: "#0e0e18", border: `1px solid ${lpsEnabled ? "#22c55e44" : "#1a1a2e"}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontWeight: 700, color: "#ddd", fontSize: 13 }}>🛡️ Asuransi Deposito LPS</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Jaminan simpanan nasabah maks Rp2M per rekening</div>
          </div>
          <button onClick={handleToggleLps} style={{ background: lpsEnabled ? "#22c55e22" : "#111", border: `1px solid ${lpsEnabled ? "#22c55e55" : "#333"}`, color: lpsEnabled ? "#22c55e" : "#666", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
            {lpsEnabled ? "✓ Aktif" : "Aktifkan"}
          </button>
        </div>
        {lpsEnabled && (
          <div style={{ background: "#0d1a0d", borderRadius: 7, padding: "7px 10px", fontSize: 10, color: "#aaa" }}>
            Premi harian: <span style={{ color: "#ef4444", fontFamily: "monospace" }}>-{fmt(Math.floor(game.deposits * LPS_PREMIUM_RATE / 365))}</span>
            {" · "}Manfaat: <span style={{ color: "#22c55e" }}>Reputasi +5, Deposito +5% (sekali)</span>
          </div>
        )}
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "#ddd", fontSize: 13, marginBottom: 4 }}>📋 Cek BMPK</div>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 10 }}>
          Batas Maksimum Pemberian Kredit: maks 20% modal per debitur. Modal estimasi: <span style={{ color: "#c8a96e", fontFamily: "monospace" }}>{fmt(Math.floor(game.cash * (game.car / 100) * 0.2))}</span>
        </div>
        <button onClick={handleBmpkCheck} style={{ background: "linear-gradient(135deg,#c8a96e,#8a6030)", color: "#000", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontWeight: 700, fontSize: 12, marginBottom: 10 }}>
          🔍 Jalankan Cek BMPK
        </button>
        {bmpkLog.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 5 }}>Riwayat cek terakhir:</div>
            {bmpkLog.slice(0, 4).map((log, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "4px 8px", background: "#0d0d14", borderRadius: 5, marginBottom: 3 }}>
                <span style={{ color: "#555" }}>Hari {log.day}</span>
                <span style={{ color: log.status === "aman" ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{log.status === "aman" ? "✅ Aman" : "🚨 " + log.violations + " pelanggaran"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
        <div style={{ fontWeight: 700, color: "#ddd", fontSize: 13, marginBottom: 4 }}>🧪 Stress Test OJK</div>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 10 }}>Simulasi dampak skenario buruk terhadap kondisi bank. Tidak mempengaruhi game nyata.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
          {STRESS_SCENARIOS.map((sc) => (
            <button key={sc.id} onClick={() => handleStressTest(sc.id)} style={{ background: "#0d0d14", border: "1px solid #2a2a3a", color: "#aaa", borderRadius: 9, padding: "9px 12px", cursor: "pointer", textAlign: "left", transition: "border 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 14 }}>{sc.icon}</span>
                  <span style={{ fontWeight: 700, color: "#ddd", marginLeft: 7, fontSize: 12 }}>{sc.name}</span>
                </div>
                <span style={{ fontSize: 9, color: "#555" }}>NPL +{sc.nplShock}% · Dep {Math.round(sc.depShock * 100)}%</span>
              </div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{sc.desc}</div>
            </button>
          ))}
        </div>
        {stressResult && (
          <div style={{ background: stressResult.survives ? "#0d1a0d" : "#1a0808", border: `1px solid ${stressResult.survives ? "#22c55e44" : "#ef444444"}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700, color: stressResult.survives ? "#22c55e" : "#ef4444", fontSize: 13, marginBottom: 8 }}>
              {stressResult.survives ? "✅ Bank Selamat" : "💥 Bank Kolaps!"} — {stressResult.scenario.name}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[
                { label: "NPL Proyeksi", val: stressResult.simNpl.toFixed(1) + "%", color: stressResult.simNpl > 10 ? "#ef4444" : "#f59e0b" },
                { label: "CAR Proyeksi", val: stressResult.simCar.toFixed(1) + "%", color: stressResult.simCar < 8 ? "#ef4444" : "#f59e0b" },
                { label: "Deposito Proyeksi", val: fmt(stressResult.simDep), color: "#60a5fa" },
                { label: "Kas Proyeksi", val: fmt(stressResult.simCash), color: stressResult.simCash < 0 ? "#ef4444" : "#aaa" },
              ].map((r) => (
                <div key={r.label} style={{ background: "#0d0d14", borderRadius: 6, padding: "6px 9px" }}>
                  <div style={{ fontSize: 9, color: "#555" }}>{r.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: "monospace" }}>{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

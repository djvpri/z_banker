// src/components/game/tabs/TimTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { STAFF_ROLES } from "@/lib/gameConstants";
import { teamStats } from "@/lib/teamStats";
import StaffCard from "../ui/StaffCard";
import HireModal from "../modals/HireModal";
import FraudModal from "../modals/FraudModal";

export default function TimTab() {
  const staff = useGameStore((s) => s.staff);
  const game = useGameStore((s) => s.game);
  const showHire = useGameStore((s) => s.showHire);
  const fraudEvent = useGameStore((s) => s.fraudEvent);
  const setShowHire = useGameStore((s) => s.setShowHire);
  const { handleTrain, handleRest, handleFire, handlePromote, handleHire, handleFraud } = useGameActions();

  const burnouts = staff.filter((s) => s.status === "burnout").length;
  const ts = teamStats(staff);

  return (
    <div>
      {showHire && <HireModal onHire={handleHire} onClose={() => setShowHire(false)} cash={game.cash} />}
      {fraudEvent && <FraudModal fe={fraudEvent} onResolve={handleFraud} />}

      <div className="grid-4" style={{ marginBottom: 12 }}>
        {(Object.entries(STAFF_ROLES) as [keyof typeof STAFF_ROLES, typeof STAFF_ROLES[keyof typeof STAFF_ROLES]][]).map(([k, r]) => {
          const count = staff.filter((s) => s.role === k).length;
          return (
            <div key={k} style={{ background: "#0e0e18", border: `1px solid ${r.color}22`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{r.icon}</div>
              <div style={{ fontSize: 10, color: r.color, marginTop: 2 }}>{r.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#ddd", fontFamily: "monospace" }}>{count}</div>
            </div>
          );
        })}
      </div>

      {burnouts > 0 && (
        <div style={{ background: "#1a0808", border: "1px solid #ef444444", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#f87171" }}>
          🔥 {burnouts} staf burnout! Istirahatkan sebelum performa merosot.
        </div>
      )}

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#c8a96e", fontWeight: 700, marginBottom: 8 }}>📊 Efek Tim</div>
        <div className="grid-3" style={{ marginBottom: ts.hasMgr ? 10 : 0 }}>
          <div><div style={{ fontSize: 9, color: "#555" }}>NPL Bonus</div><div style={{ fontSize: 13, color: "#22c55e", fontFamily: "monospace" }}>{ts.nplMod.toFixed(2)}</div></div>
          <div><div style={{ fontSize: 9, color: "#555" }}>Rep Bonus</div><div style={{ fontSize: 13, color: "#60a5fa", fontFamily: "monospace" }}>+{ts.repMod.toFixed(1)}</div></div>
          <div><div style={{ fontSize: 9, color: "#555" }}>Avg Moral</div><div style={{ fontSize: 13, color: "#a78bfa", fontFamily: "monospace" }}>{Math.round(ts.avgMorale)}%</div></div>
        </div>
        {ts.hasMgr ? (
          <div style={{ background: "#c8a96e11", border: "1px solid #c8a96e33", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#c8a96e", fontWeight: 700, marginBottom: 5 }}>👔 Efek Manajer Aktif (skill avg {ts.mgrSkill.toFixed(1)}/10)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 10, color: "#888" }}>
              <div>✅ Skill tim efektif <span style={{ color: "#c8a96e" }}>+2</span></div>
              <div>✅ Workload relief <span style={{ color: "#c8a96e" }}>-{Math.round(5 + ts.mgrSkill * 0.5)}/hari</span></div>
              <div>✅ Auto-rest threshold <span style={{ color: "#c8a96e" }}>95%</span></div>
              <div>✅ Recovery istirahat <span style={{ color: "#c8a96e" }}>-50% WL +20 Moral</span></div>
              <div style={{ gridColumn: "1/-1" }}>✅ Loyalitas efektif <span style={{ color: "#c8a96e" }}>+2</span> (kurangi resign)</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#1a1208", border: "1px solid #f59e0b33", borderRadius: 8, padding: "8px 10px", fontSize: 10, color: "#777" }}>
            ⚠️ Tidak ada Manajer aktif — semua efek boost tim tidak berlaku. Rekrut Manajer untuk unlock 5 efek!
          </div>
        )}
      </div>

      {staff.map((s) => (
        <StaffCard key={s.id} s={s} onTrain={handleTrain} onRest={handleRest} onFire={handleFire} onPromote={handlePromote} currentDay={game.day} />
      ))}
      <button onClick={() => setShowHire(true)} style={{ width: "100%", background: "#c8a96e18", border: "1px solid #c8a96e44", color: "#c8a96e", borderRadius: 10, padding: 12, cursor: "pointer", fontSize: 13, fontWeight: 700, marginTop: 4 }}>
        + Rekrut Staf Baru
      </button>
    </div>
  );
}

// src/components/game/tabs/ProspekTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { useGameActions } from "@/hooks/useGameActions";
import { fmt } from "@/lib/gameFormat";
import { STAFF_ROLES } from "@/lib/gameConstants";
import { Bar } from "../ui/Shared";

export default function ProspekTab() {
  const prospects = useGameStore((s) => s.prospects);
  const staff = useGameStore((s) => s.staff);
  const { handleApproach, handleConvert, handleDismissProspect } = useGameActions();

  const csPool = staff.filter((s) => s.role === "cs" || s.role === "teller");
  const csActive = csPool.filter((s) => s.status === "aktif");
  const noneAvail = csActive.length === 0;
  const bestStaff = csActive.length > 0 ? csActive.reduce((best, s) => (s.workload < best.workload ? s : best), csActive[0]) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e" }}>🎯 Calon Nasabah Potensial</div>
        <div style={{ fontSize: 10, color: "#555" }}>{prospects.length} prospek</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#c8a96e" }}>{prospects.filter((p) => !p.contacted).length}</div>
          <div style={{ fontSize: 9, color: "#555" }}>Belum Dikontak</div>
        </div>
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>{prospects.filter((p) => p.contacted).length}</div>
          <div style={{ fontSize: 9, color: "#555" }}>Sudah Dikontak</div>
        </div>
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>{fmt(prospects.reduce((a, p) => a + p.potential, 0))}</div>
          <div style={{ fontSize: 9, color: "#555" }}>Total Potensi</div>
        </div>
      </div>

      <div style={{ background: noneAvail ? "#1a0808" : "#0d0d14", border: `1px solid ${noneAvail ? "#ef444444" : "#1e1e2e"}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: "#666", marginBottom: 6, fontWeight: 700 }}>👤 STAF UNTUK PROSPEK</div>
        {noneAvail ? (
          <div style={{ fontSize: 11, color: "#ef4444" }}>❌ Tidak ada staf CS/Teller aktif! Approach tidak bisa dilakukan.</div>
        ) : (
          <div>
            {csActive.map((s) => {
              const role = STAFF_ROLES[s.role];
              const wlColor = s.workload >= 80 ? "#ef4444" : s.workload >= 60 ? "#f59e0b" : "#22c55e";
              const isBest = bestStaff && s.id === bestStaff.id;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{role.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                      <span style={{ color: "#aaa" }}>{s.name} <span style={{ color: role.color }}>({role.label})</span></span>
                      <span style={{ color: wlColor, fontFamily: "monospace" }}>Beban {s.workload}%{isBest ? " ← next" : ""}</span>
                    </div>
                    <Bar val={s.workload} max={100} color={wlColor} height={4} />
                  </div>
                </div>
              );
            })}
            {csActive.some((s) => s.workload >= 80) && (
              <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>⚠️ Beberapa staf sudah overload — pertimbangkan istirahatkan mereka.</div>
            )}
          </div>
        )}
      </div>

      <div style={{ fontSize: 10, color: "#555", marginBottom: 10, padding: "6px 10px", background: "#0d0d14", borderRadius: 6 }}>
        💡 Approach pakai staf CS/Teller (workload +20). Konversi bisa dilakukan jika ketertarikan ≥ 50%.
      </div>

      {prospects.length === 0 && (
        <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 24, textAlign: "center", color: "#555" }}>Tidak ada prospek. Tunggu hari berikutnya.</div>
      )}

      {prospects.map((p) => {
        const ic = p.interest >= 70 ? "#22c55e" : p.interest >= 45 ? "#f59e0b" : "#ef4444";
        const urgency = p.daysLeft <= 2;
        const csActiveForP = staff.filter((s) => (s.role === "cs" || s.role === "teller") && s.status === "aktif");
        const noStaff = csActiveForP.length === 0;
        const assignedStaff = csActiveForP.length > 0 ? csActiveForP.reduce((best, s) => (s.workload < best.workload ? s : best), csActiveForP[0]) : null;
        const overloaded = !!assignedStaff && assignedStaff.workload >= 80;
        const approachDisabled = noStaff;

        return (
          <div key={p.id} style={{ background: "#0e0e18", border: `1px solid ${urgency ? "#ef444433" : p.contacted ? "#60a5fa22" : "#1a1a2e"}`, borderRadius: 12, padding: 13, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 16 }}>{p.isLoan ? "💳" : "💰"}</span>
                  <span style={{ fontWeight: 700, color: "#ddd", fontSize: 13 }}>{p.name}</span>
                  {p.contacted && <span style={{ fontSize: 9, background: "#60a5fa22", color: "#60a5fa", padding: "1px 5px", borderRadius: 3 }}>Dikontak {p.approached}x</span>}
                  {urgency && <span style={{ fontSize: 9, background: "#ef444422", color: "#ef4444", padding: "1px 5px", borderRadius: 3 }}>⏰ Hampir habis!</span>}
                </div>
                <div style={{ fontSize: 10, color: "#555" }}>{p.sector} · {p.product}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "monospace", color: "#c8a96e", fontSize: 13 }}>{fmt(p.potential)}</div>
                <div style={{ fontSize: 9, color: "#555" }}>Sisa {p.daysLeft}h</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", marginBottom: 3 }}>
                  <span>Ketertarikan</span><span style={{ color: ic }}>{p.interest}%</span>
                </div>
                <Bar val={p.interest} max={100} color={ic} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
                {p.isLoan
                  ? <span style={{ color: p.score >= 650 ? "#22c55e" : p.score >= 550 ? "#f59e0b" : "#ef4444" }}>Skor: {p.score}</span>
                  : <span style={{ color: "#555" }}>Sektor: {p.sector}</span>}
              </div>
            </div>

            {assignedStaff && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, padding: "5px 8px", background: overloaded ? "#1a1008" : "#0d0d14", borderRadius: 5, border: `1px solid ${overloaded ? "#f59e0b33" : "#1e1e2e"}` }}>
                <span style={{ fontSize: 12 }}>{STAFF_ROLES[assignedStaff.role].icon}</span>
                <span style={{ fontSize: 10, color: "#888" }}>Akan ditugaskan:</span>
                <span style={{ fontSize: 10, color: "#ddd", fontWeight: 700 }}>{assignedStaff.name}</span>
                <span style={{ fontSize: 9, color: overloaded ? "#f59e0b" : "#555", marginLeft: "auto" }}>
                  {overloaded ? "⚠️ " : ""}{assignedStaff.workload}% → {Math.min(100, assignedStaff.workload + 20)}%
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => handleApproach(p.id)}
                disabled={approachDisabled}
                style={{
                  flex: 1,
                  background: approachDisabled ? "#111" : overloaded ? "#f59e0b18" : "#60a5fa18",
                  border: `1px solid ${approachDisabled ? "#222" : overloaded ? "#f59e0b33" : "#60a5fa33"}`,
                  color: approachDisabled ? "#333" : overloaded ? "#f59e0b" : "#60a5fa",
                  borderRadius: 6, padding: "6px 0", cursor: approachDisabled ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700,
                }}>
                {approachDisabled ? "❌ No Staf" : overloaded ? "⚠️ Approach" : "📞 Approach"}
              </button>
              <button
                onClick={() => handleConvert(p.id)}
                disabled={p.interest < 50}
                style={{
                  flex: 1,
                  background: p.interest >= 50 ? "#22c55e18" : "#111",
                  border: `1px solid ${p.interest >= 50 ? "#22c55e33" : "#222"}`,
                  color: p.interest >= 50 ? "#22c55e" : "#333",
                  borderRadius: 6, padding: "6px 0", cursor: p.interest >= 50 ? "pointer" : "not-allowed", fontSize: 11, fontWeight: 700,
                }}>
                {p.interest >= 50 ? "✅ Konversi" : "⏳ Min 50%"}
              </button>
              <button
                onClick={() => handleDismissProspect(p.id)}
                style={{ background: "#ef444418", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11 }}>✗
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

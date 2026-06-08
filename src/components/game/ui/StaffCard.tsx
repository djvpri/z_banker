// src/components/game/ui/StaffCard.tsx
import { Staff } from "@/types/game";
import { STAFF_ROLES, PROMO_PATHS } from "@/lib/gameConstants";
import { fmt } from "@/lib/gameFormat";
import { Bar, Dots } from "./Shared";

interface Props {
  s: Staff;
  onTrain: (id: number) => void;
  onRest: (id: number) => void;
  onFire: (id: number) => void;
  onPromote: (id: number) => void;
  currentDay: number;
}

export default function StaffCard({ s, onTrain, onRest, onFire, onPromote, currentDay }: Props) {
  const role = STAFF_ROLES[s.role];
  const isBurnout = s.status === "burnout";
  const isRest = s.status === "istirahat";
  const isRestLocked = isRest && s.restDay >= currentDay;
  const mood = s.morale >= 80 ? "🤩" : s.morale >= 60 ? "😊" : s.morale >= 40 ? "😐" : s.morale >= 20 ? "😓" : "😤";
  const perf = Math.round((s.skill * 0.4 + s.speed * 0.3 + (s.morale / 10) * 0.3) * 10);
  const wlColor = s.workload >= 80 ? "#ef4444" : s.workload >= 60 ? "#f59e0b" : "#22c55e";
  const mrColor = s.morale >= 70 ? "#22c55e" : s.morale >= 40 ? "#f59e0b" : "#ef4444";
  const path = PROMO_PATHS[s.role];
  const canPromote = !!path && s.exp >= path.expNeeded;
  const warnColor = s.warningCount === 0 ? "#555" : s.warningCount === 1 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ background: isBurnout ? "#1a0a0a" : isRest ? "#0a1a0a" : "#0e0e18", border: `1px solid ${isBurnout ? "#ef444444" : isRest ? "#22c55e33" : "#1e1e2e"}`, borderRadius: 12, padding: 14, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{role.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: "#ddd", fontSize: 13 }}>{s.name}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: role.color }}>{role.label}</span>
              {s.warningCount > 0 && <span style={{ fontSize: 9, color: warnColor }}>{"⚠️".repeat(s.warningCount)}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: perf >= 70 ? "#22c55e" : perf >= 45 ? "#f59e0b" : "#ef4444" }}>Perf {perf}%</div>
          <div style={{ fontSize: 10, color: "#444" }}>Exp {s.exp}d</div>
          {isBurnout && <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>🔥 BURNOUT</div>}
          {isRest && <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>💤 {isRestLocked ? "Selesai Besok" : "Istirahat"}</div>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Skill {s.skill}/10</div><Dots val={s.skill} color="#60a5fa" /></div>
        <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Speed {s.speed}/10</div><Dots val={s.speed} color="#22c55e" /></div>
        <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Loyal {s.loyalty}/10</div><Dots val={s.loyalty} color="#a78bfa" /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", marginBottom: 3 }}>
            <span>Beban Kerja</span><span style={{ color: wlColor }}>{s.workload}%</span>
          </div>
          <Bar val={s.workload} max={100} color={wlColor} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#555", marginBottom: 3 }}>
            <span>Moral {mood}</span><span>{s.morale}%</span>
          </div>
          <Bar val={s.morale} max={100} color={mrColor} />
        </div>
      </div>
      {path && (
        <div style={{ fontSize: 9, color: canPromote ? "#22c55e" : "#444", marginBottom: 8, padding: "4px 8px", background: "#0d0d14", borderRadius: 5 }}>
          {canPromote ? "✅ Siap promosi → " + STAFF_ROLES[path.to].label : "📈 Promosi di exp " + path.expNeeded + "d (" + s.exp + "/" + path.expNeeded + ") — " + fmt(path.cost)}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, color: "#444" }}>-{fmt(role.salary)}/hari</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {!isRest && !isBurnout && (
            <button onClick={() => onRest(s.id)} style={{ background: "#22c55e18", border: "1px solid #22c55e33", color: "#22c55e", borderRadius: 5, padding: "4px 7px", cursor: "pointer", fontSize: 9 }}>💤</button>
          )}
          {isRest && (
            <button disabled={isRestLocked} onClick={() => { if (!isRestLocked) onRest(s.id); }} style={{ background: isRestLocked ? "#111" : "#60a5fa18", border: `1px solid ${isRestLocked ? "#333" : "#60a5fa33"}`, color: isRestLocked ? "#444" : "#60a5fa", borderRadius: 5, padding: "4px 7px", cursor: isRestLocked ? "not-allowed" : "pointer", fontSize: 9 }}>
              {isRestLocked ? "🔒" : "▶"}
            </button>
          )}
          {canPromote && (
            <button onClick={() => onPromote(s.id)} style={{ background: "#c8a96e22", border: "1px solid #c8a96e55", color: "#c8a96e", borderRadius: 5, padding: "4px 7px", cursor: "pointer", fontSize: 9, fontWeight: 700 }}>⬆️</button>
          )}
          <button onClick={() => onTrain(s.id)} style={{ background: "#f59e0b18", border: "1px solid #f59e0b33", color: "#f59e0b", borderRadius: 5, padding: "4px 7px", cursor: "pointer", fontSize: 9 }}>📚</button>
          <button onClick={() => onFire(s.id)} style={{ background: "#ef444418", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 5, padding: "4px 7px", cursor: "pointer", fontSize: 9 }}>🚪</button>
        </div>
      </div>
    </div>
  );
}

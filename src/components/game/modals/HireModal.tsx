// src/components/game/modals/HireModal.tsx
"use client";
import { useState } from "react";
import { StaffRole } from "@/types/game";
import { STAFF_ROLES } from "@/lib/gameConstants";
import { genStaff } from "@/store/gameStore";
import { fmt, M } from "@/lib/gameFormat";
import { Dots } from "../ui/Shared";

interface Props {
  onHire: (role: StaffRole) => void;
  onClose: () => void;
  cash: number;
}

export default function HireModal({ onHire, onClose, cash }: Props) {
  const [role, setRole] = useState<StaffRole>("teller");
  const preview = genStaff(role);
  const r = STAFF_ROLES[role];
  const canAfford = cash >= 5 * M;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#13131e", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24, maxWidth: 340, width: "92%" }}>
        <div style={{ fontWeight: 700, color: "#c8a96e", fontSize: 15, marginBottom: 14 }}>👤 Rekrut Staf Baru</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {(Object.entries(STAFF_ROLES) as [StaffRole, typeof STAFF_ROLES[StaffRole]][]).map(([k, v]) => (
            <button key={k} onClick={() => setRole(k)} style={{ background: role === k ? v.color + "22" : "#0d0d14", border: `1px solid ${role === k ? v.color + "55" : "#222"}`, color: role === k ? v.color : "#555", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: role === k ? 700 : 400 }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
        <div style={{ background: "#0d0d14", borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>Preview kandidat:</div>
          <div style={{ fontWeight: 700, color: "#ddd", marginBottom: 8 }}>{preview.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Skill {preview.skill}/10</div><Dots val={preview.skill} color="#60a5fa" /></div>
            <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Speed {preview.speed}/10</div><Dots val={preview.speed} color="#22c55e" /></div>
            <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Loyal {preview.loyalty}/10</div><Dots val={preview.loyalty} color="#a78bfa" /></div>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#555" }}>Gaji: <span style={{ color: "#ef4444", fontFamily: "monospace" }}>-{fmt(r.salary)}/hari</span> · Rekrut: <span style={{ color: "#f59e0b" }}>Rp5jt</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: "#222", border: "1px solid #333", color: "#777", borderRadius: 8, padding: 10, cursor: "pointer", fontSize: 12 }}>Batal</button>
          <button onClick={() => onHire(role)} disabled={!canAfford} style={{ flex: 2, background: canAfford ? "linear-gradient(135deg,#c8a96e,#8a6030)" : "#222", color: canAfford ? "#000" : "#555", border: "none", borderRadius: 8, padding: 10, cursor: canAfford ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 12 }}>
            Rekrut (Rp5jt)
          </button>
        </div>
      </div>
    </div>
  );
}

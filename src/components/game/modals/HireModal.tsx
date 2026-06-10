// src/components/game/modals/HireModal.tsx
"use client";
import { useState } from "react";
import { Candidate, Staff, StaffRole } from "@/types/game";
import { STAFF_ROLES, BRANCHES } from "@/lib/gameConstants";
import { useGameStore, genCandidate, genCandidatePool } from "@/store/gameStore";
import { fmt, M, clamp } from "@/lib/gameFormat";
import { Dots } from "../ui/Shared";

interface Props {
  onHire: (candidate: Staff, salary: number) => void;
  onClose: () => void;
  cash: number;
}

// Peluang kandidat menerima tawaran: makin loyal, makin fleksibel soal gaji
function negChance(offer: number, expected: number, loyalty: number): number {
  if (offer >= expected) return 1;
  const minAccept = 0.7 + (10 - loyalty) * 0.02;
  return clamp((offer / expected - minAccept) / (1 - minAccept), 0, 1);
}

export default function HireModal({ onHire, onClose, cash }: Props) {
  const [role, setRole] = useState<StaffRole>("teller");
  const [pools, setPools] = useState<Record<StaffRole, Candidate[]>>(() => {
    const result = {} as Record<StaffRole, Candidate[]>;
    (Object.keys(STAFF_ROLES) as StaffRole[]).forEach((r) => {
      result[r] = genCandidatePool(r, 3);
    });
    return result;
  });
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [offer, setOffer] = useState<number | "">(0);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [negMsg, setNegMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const canAfford = cash >= 5 * M;
  const staffCount = useGameStore((s) => s.staff.length);
  const branch = useGameStore((s) => s.game.branch);
  const maxStaff = BRANCHES[branch]?.maxStaff ?? 5;
  const isFull = staffCount >= maxStaff;
  const canHire = canAfford && !isFull;

  const selectCandidate = (c: Candidate) => {
    setSelected(c);
    setOffer(Math.round((c.expectedSalary * 0.85) / 1000) * 1000);
    setNegMsg(null);
  };

  const backToPool = () => {
    setSelected(null);
    setNegMsg(null);
  };

  const handleOffer = () => {
    if (!selected) return;
    const offerVal = offer || 0;
    const chance = negChance(offerVal, selected.expectedSalary, selected.loyalty);
    if (Math.random() < chance) {
      onHire(selected, offerVal);
      return;
    }
    const newAttempts = (attempts[selected.id] || 0) + 1;
    setAttempts((a) => ({ ...a, [selected.id]: newAttempts }));
    if (newAttempts >= 3) {
      setPools((p) => ({
        ...p,
        [role]: p[role].map((c) => (c.id === selected.id ? genCandidate(role) : c)),
      }));
      setSelected(null);
      setNegMsg(null);
    } else {
      setNegMsg({ text: "❌ " + selected.name + " menolak " + fmt(offerVal) + "/hari. Coba naikkan tawaran.", ok: false });
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "#13131e", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24, maxWidth: 380, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, color: "#c8a96e", fontSize: 15 }}>👤 Rekrut Staf Baru</div>
          <div style={{ fontSize: 10, color: isFull ? "#ef4444" : staffCount >= maxStaff - 1 ? "#f59e0b" : "#555", background: "#0d0d14", padding: "3px 8px", borderRadius: 5 }}>
            {staffCount}/{maxStaff} staf
          </div>
        </div>

        {isFull && (
          <div style={{ background: "#ef444418", border: "1px solid #ef444433", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#ef4444", marginBottom: 12 }}>
            ❌ Kapasitas penuh. Upgrade ke {BRANCHES[Math.min(branch + 1, BRANCHES.length - 1)].name} untuk staf lebih banyak.
          </div>
        )}
        {!canAfford && (
          <div style={{ background: "#ef444418", border: "1px solid #ef444433", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#ef4444", marginBottom: 12 }}>
            ❌ Kas tidak cukup untuk biaya rekrutmen (Rp5jt).
          </div>
        )}

        {!selected ? (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {(Object.entries(STAFF_ROLES) as [StaffRole, typeof STAFF_ROLES[StaffRole]][]).map(([k, v]) => (
                <button key={k} onClick={() => setRole(k)} style={{ background: role === k ? v.color + "22" : "#0d0d14", border: `1px solid ${role === k ? v.color + "55" : "#222"}`, color: role === k ? v.color : "#555", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: role === k ? 700 : 400 }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>Pool kandidat — pilih untuk negosiasi gaji:</div>

            {pools[role].map((c) => (
              <div key={c.id} style={{ background: "#0d0d14", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: "#ddd", fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#f59e0b" }}>{fmt(c.expectedSalary)}/hari</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Skill {c.skill}/10</div><Dots val={c.skill} color="#60a5fa" /></div>
                  <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Speed {c.speed}/10</div><Dots val={c.speed} color="#22c55e" /></div>
                  <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Loyal {c.loyalty}/10</div><Dots val={c.loyalty} color="#a78bfa" /></div>
                </div>
                <button onClick={() => selectCandidate(c)} disabled={!canHire} style={{ width: "100%", background: canHire ? "#60a5fa18" : "#222", border: `1px solid ${canHire ? "#60a5fa44" : "#333"}`, color: canHire ? "#60a5fa" : "#555", borderRadius: 7, padding: "7px 10px", cursor: canHire ? "pointer" : "not-allowed", fontSize: 11, fontWeight: 700 }}>
                  💬 Pilih &amp; Nego Gaji
                </button>
              </div>
            ))}

            <div style={{ fontSize: 10, color: "#444", marginBottom: 14 }}>Biaya rekrutmen: <span style={{ color: "#f59e0b" }}>Rp5jt</span> (di luar gaji harian)</div>

            <button onClick={onClose} style={{ width: "100%", background: "#222", border: "1px solid #333", color: "#777", borderRadius: 8, padding: 10, cursor: "pointer", fontSize: 12 }}>Batal</button>
          </>
        ) : (
          <>
            <button onClick={backToPool} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 11, padding: 0, marginBottom: 12 }}>← Kembali ke pool</button>

            <div style={{ background: "#0d0d14", borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: "#ddd", marginBottom: 8 }}>{selected.name} · {STAFF_ROLES[selected.role].icon} {STAFF_ROLES[selected.role].label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Skill {selected.skill}/10</div><Dots val={selected.skill} color="#60a5fa" /></div>
                <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Speed {selected.speed}/10</div><Dots val={selected.speed} color="#22c55e" /></div>
                <div><div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>Loyal {selected.loyalty}/10</div><Dots val={selected.loyalty} color="#a78bfa" /></div>
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>
                Permintaan gaji: <span style={{ color: "#f59e0b", fontFamily: "monospace" }}>{fmt(selected.expectedSalary)}/hari</span>
              </div>
            </div>

            <div style={{ background: "#60a5fa11", border: "1px solid #60a5fa33", borderRadius: 9, padding: "9px 12px", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#60a5fa", marginBottom: 6 }}>🔄 Tawar Gaji</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="number"
                  value={offer}
                  step={1000}
                  min={Math.round(selected.expectedSalary * 0.5)}
                  onChange={(e) => { const v = e.target.value; setOffer(v === "" ? "" : parseInt(v) || 0); }}
                  style={{ flex: 1, background: "#0d0d14", border: "1px solid #2a2a3a", color: "#ddd", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}
                />
                <span style={{ color: "#555", fontSize: 11 }}>/hari</span>
                <button onClick={handleOffer} disabled={!canHire} style={{ background: canHire ? "#60a5fa22" : "#222", border: `1px solid ${canHire ? "#60a5fa44" : "#333"}`, color: canHire ? "#60a5fa" : "#555", borderRadius: 6, padding: "6px 12px", cursor: canHire ? "pointer" : "not-allowed", fontSize: 11, fontWeight: 700 }}>
                  Tawar
                </button>
              </div>
              {negMsg && <div style={{ fontSize: 10, color: negMsg.ok ? "#22c55e" : "#ef4444", marginTop: 8 }}>{negMsg.text}</div>}
              {(attempts[selected.id] || 0) > 0 && <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>Percobaan: {attempts[selected.id]}/3 — jika gagal terus, kandidat pergi.</div>}
            </div>

            <button onClick={() => onHire(selected, selected.expectedSalary)} disabled={!canHire} style={{ width: "100%", background: canHire ? "#22c55e18" : "#222", border: `1px solid ${canHire ? "#22c55e44" : "#333"}`, color: canHire ? "#22c55e" : "#555", borderRadius: 8, padding: 10, cursor: canHire ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
              ✅ Setujui {fmt(selected.expectedSalary)}/hari (sesuai permintaan)
            </button>

            <button onClick={onClose} style={{ width: "100%", background: "#222", border: "1px solid #333", color: "#777", borderRadius: 8, padding: 10, cursor: "pointer", fontSize: 12 }}>Batal</button>
          </>
        )}
      </div>
    </div>
  );
}

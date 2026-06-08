// src/components/game/modals/FraudModal.tsx
"use client";
import { FraudEvent } from "@/types/game";
import { STAFF_ROLES } from "@/lib/gameConstants";
import { fmt } from "@/lib/gameFormat";

interface Props {
  fe: FraudEvent;
  onResolve: (choice: "pecat" | "investigasi" | "tutup") => void;
}

const EV_LABELS = ["", "🔴 Lemah", "🟡 Sedang", "🟢 Kuat"];
const EV_COLORS = ["", "#ef4444", "#f59e0b", "#22c55e"];

export default function FraudModal({ fe, onResolve }: Props) {
  const { suspect, amount, evidence } = fe;
  const role = STAFF_ROLES[suspect.role];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "#13131e", border: "2px solid #ef444466", borderRadius: 16, padding: 24, maxWidth: 380, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#ef4444" }}>Fraud Internal Terdeteksi!</div>
            <div style={{ fontSize: 11, color: "#666" }}>Laporan audit internal</div>
          </div>
        </div>
        <div style={{ background: "#0d0d14", border: "1px solid #ef444433", borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>TERSANGKA</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 24 }}>{role.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: "#ddd", fontSize: 13 }}>{suspect.name}</div>
              <div style={{ fontSize: 11, color: role.color }}>{role.label} · Loyalitas {suspect.loyalty}/10</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "#111", borderRadius: 6, padding: "6px 10px" }}>
              <div style={{ fontSize: 9, color: "#555" }}>JUMLAH DICURI</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ef4444", fontFamily: "monospace" }}>{fmt(amount)}</div>
            </div>
            <div style={{ background: "#111", borderRadius: 6, padding: "6px 10px" }}>
              <div style={{ fontSize: 9, color: "#555" }}>BUKTI</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: EV_COLORS[evidence] }}>{EV_LABELS[evidence]}</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>Pilih tindakan:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => onResolve("pecat")} style={{ background: "#f59e0b18", border: "1px solid #f59e0b44", color: "#f59e0b", borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>🚪 Pecat Langsung</div>
            <div style={{ fontSize: 10, color: "#777", marginTop: 3 }}>Pecat {suspect.name} sekarang. Dana sebagian kembali. Reputasi turun sedikit.</div>
          </button>
          <button onClick={() => onResolve("investigasi")} style={{ background: "#60a5fa18", border: "1px solid #60a5fa44", color: "#60a5fa", borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>🔍 Investigasi Resmi (Rp20jt)</div>
            <div style={{ fontSize: 10, color: "#777", marginTop: 3 }}>
              {evidence >= 2 ? "Bukti kuat — kemungkinan terbukti. Reputasi naik." : "Bukti lemah — berisiko jika tidak terbukti!"}
            </div>
          </button>
          <button onClick={() => onResolve("tutup")} style={{ background: "#a78bfa18", border: "1px solid #a78bfa44", color: "#a78bfa", borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>🤫 Tutup Diam-diam</div>
            <div style={{ fontSize: 10, color: "#777", marginTop: 3 }}>Hindari publisitas. Risiko 40% bocor ke media!</div>
          </button>
        </div>
      </div>
    </div>
  );
}

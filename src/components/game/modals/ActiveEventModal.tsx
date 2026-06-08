// src/components/game/modals/ActiveEventModal.tsx
"use client";
import { GameEvent } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import { clamp } from "@/lib/gameFormat";

interface Props {
  event: GameEvent;
  onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#60a5fa",
};

export default function ActiveEventModal({ event, onClose }: Props) {
  const color = TYPE_COLORS[event.type] || "#60a5fa";

  const handleBayarBonus = () => {
    const { setGame, setStaff, addNotif } = useGameStore.getState();
    setGame((g) => ({ ...g, cash: g.cash - 20_000_000 }));
    setStaff((s) => s.map((x) => ({ ...x, morale: clamp(x.morale + 15, 0, 100) })));
    addNotif("💰 Bonus Rp20jt dibayar — moral tim membaik!", "success");
    onClose();
  };

  const handleTolakTuntutan = () => {
    const { setStaff, addNotif } = useGameStore.getState();
    setStaff((s) => s.map((x) => ({ ...x, morale: clamp(x.morale - 20, 0, 100) })));
    addNotif("😠 Tuntutan ditolak — moral tim turun drastis!", "danger");
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "#13131e", border: `2px solid ${color}66`, borderRadius: 16, padding: 24, maxWidth: 380, width: "100%" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color, marginBottom: 8 }}>{event.title}</div>
        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5, marginBottom: 18 }}>{event.desc}</div>

        {event.id === "kenaikan_gaji" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={handleBayarBonus} style={{ background: "#22c55e18", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>💰 Bayar Bonus Rp20jt</div>
              <div style={{ fontSize: 10, color: "#777", marginTop: 3 }}>Kas berkurang Rp20jt, tapi moral seluruh tim naik.</div>
            </button>
            <button onClick={handleTolakTuntutan} style={{ background: "#ef444418", border: "1px solid #ef444444", color: "#ef4444", borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>🚫 Tolak Tuntutan</div>
              <div style={{ fontSize: 10, color: "#777", marginTop: 3 }}>Tidak ada biaya, tapi moral tim turun drastis.</div>
            </button>
          </div>
        ) : (
          <button onClick={onClose} style={{ width: "100%", background: "linear-gradient(135deg,#c8a96e,#8a6030)", color: "#000", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Mengerti</button>
        )}
      </div>
    </div>
  );
}

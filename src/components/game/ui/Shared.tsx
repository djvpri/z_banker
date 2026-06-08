// src/components/game/ui/Shared.tsx
import { clamp } from "@/lib/gameFormat";

export function StatCard({ label, value, color, sub }: { label: string; value: React.ReactNode; color: string; sub?: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`, borderRadius: 10, padding: "10px 14px", flex: "1 1 100px", minWidth: 100 }}>
      <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const NOTIF_COLORS: Record<string, string> = { success: "#22c55e", danger: "#ef4444", warning: "#f59e0b", info: "#60a5fa" };

export function Notif({ msg, type }: { msg: string; type?: string }) {
  const c = NOTIF_COLORS[type || "info"] || NOTIF_COLORS.info;
  return (
    <div style={{ background: c + "15", border: `1px solid ${c}33`, borderLeft: `3px solid ${c}`, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#bbb", marginBottom: 5 }}>
      {msg}
    </div>
  );
}

export function Bar({ val, max, color, height }: { val: number; max: number; color: string; height?: number }) {
  const pct = clamp((val / max) * 100, 0, 100);
  return (
    <div style={{ background: "#1a1a24", borderRadius: 3, height: height || 5, overflow: "hidden" }}>
      <div style={{ width: pct + "%", background: color, height: "100%", borderRadius: 3, transition: "width 0.4s" }} />
    </div>
  );
}

export function Dots({ val, max, color }: { val: number; max?: number; color?: string }) {
  const m = max || 10;
  const c = color || "#c8a96e";
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array(m).fill(0).map((_, i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < val ? c : "#222" }} />
      ))}
    </div>
  );
}

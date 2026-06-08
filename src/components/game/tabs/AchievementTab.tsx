// src/components/game/tabs/AchievementTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { ACHIEVEMENTS } from "@/lib/gameConstants";

export default function AchievementTab() {
  const achievements = useGameStore((s) => s.achievements);

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 4 }}>🏅 Pencapaian</div>
      <div style={{ fontSize: 10, color: "#555", marginBottom: 12 }}>{achievements.length}/{ACHIEVEMENTS.length} unlocked</div>
      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, height: 6, marginBottom: 14 }}>
        <div style={{ width: Math.round((achievements.length / ACHIEVEMENTS.length) * 100) + "%", background: "linear-gradient(90deg,#c8a96e,#22c55e)", height: "100%", borderRadius: 10, transition: "width 0.5s" }} />
      </div>
      {ACHIEVEMENTS.map((ach) => {
        const unlocked = achievements.indexOf(ach.id) >= 0;
        return (
          <div key={ach.id} style={{ background: unlocked ? "#0d1a0d" : "#0e0e18", border: `1px solid ${unlocked ? "#22c55e33" : "#1a1a2e"}`, borderRadius: 10, padding: 12, marginBottom: 7, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28, filter: unlocked ? "none" : "grayscale(1) opacity(0.3)" }}>{ach.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: unlocked ? "#ddd" : "#444", fontSize: 13 }}>{ach.title}</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{ach.desc}</div>
              <div style={{ fontSize: 10, color: unlocked ? "#22c55e" : "#333", marginTop: 3 }}>🎁 {ach.reward}</div>
            </div>
            {unlocked && <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓</div>}
          </div>
        );
      })}
    </div>
  );
}

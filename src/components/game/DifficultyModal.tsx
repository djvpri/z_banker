// src/components/game/DifficultyModal.tsx
"use client";
import { motion } from "framer-motion";
import { Difficulty, DIFFICULTY_CONFIG } from "@/types/game";
import { SCENARIOS } from "@/lib/gameConstants";
import { useGameStore } from "@/store/gameStore";
import { useState } from "react";

interface Props {
  onStart: (difficulty: Difficulty, scenarioId: string) => void;
}

export default function DifficultyModal({ onStart }: Props) {
  const [selected, setSelected] = useState<Difficulty>("normal");
  const [selectedScenario, setSelectedScenario] = useState("normal");
  const careerWins = useGameStore((s) => s.careerWins);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 310,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: "#13131e",
          border: "2px solid rgba(200,169,110,0.3)",
          borderRadius: 20,
          padding: 32,
          maxWidth: 400,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏦</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#c8a96e", marginBottom: 6 }}>
          Z Banker
        </h2>
        <p style={{ color: "#555", fontSize: 12, marginBottom: careerWins > 0 ? 8 : 28 }}>
          Pilih tingkat kesulitan untuk memulai
        </p>
        {careerWins > 0 && (
          <div style={{ fontSize: 11, fontWeight: 700, color: "#c8a96e", background: "#c8a96e18", borderRadius: 8, padding: "5px 10px", marginBottom: 20, display: "inline-block" }}>
            🏅 Kemenangan Karir: {careerWins}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG["easy"]][]).map(([key, cfg]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(key)}
              style={{
                background: selected === key ? cfg.color + "18" : "#0d0d14",
                border: `2px solid ${selected === key ? cfg.color : "#1a1a2e"}`,
                borderRadius: 12,
                padding: "12px 16px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: selected === key ? cfg.color : "#aaa", fontSize: 14 }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: 10, color: "#555" }}>
                  Target: {key === "easy" ? "Rp5M" : "Rp10M"}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>{cfg.desc}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: "#444" }}>
                Kas awal: <span style={{ color: cfg.color }}>Rp{cfg.startCash / 1_000_000}jt</span>
                {" · "}
                Event buruk: <span style={{ color: cfg.color }}>{Math.round(cfg.badEventWeight * 100)}%</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", textAlign: "left", marginBottom: 8 }}>
          🎯 Mode Skenario
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
          {SCENARIOS.map((sc) => {
            const unlocked = careerWins >= sc.unlockWins;
            const isSelected = selectedScenario === sc.id;
            return (
              <motion.button
                key={sc.id}
                whileHover={unlocked ? { scale: 1.02 } : undefined}
                whileTap={unlocked ? { scale: 0.98 } : undefined}
                onClick={() => unlocked && setSelectedScenario(sc.id)}
                style={{
                  background: isSelected ? "#c8a96e18" : "#0d0d14",
                  border: `2px solid ${isSelected ? "#c8a96e" : "#1a1a2e"}`,
                  borderRadius: 12,
                  padding: "10px 12px",
                  cursor: unlocked ? "pointer" : "default",
                  textAlign: "left",
                  opacity: unlocked ? 1 : 0.45,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, color: isSelected ? "#c8a96e" : "#aaa", fontSize: 12, marginBottom: 3 }}>
                  {sc.icon} {sc.name}
                </div>
                <div style={{ fontSize: 10, color: "#555", lineHeight: 1.4 }}>
                  {unlocked ? sc.desc : `🔒 Menang ${sc.unlockWins}x untuk membuka`}
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(selected, selectedScenario)}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #c8a96e, #8a6030)",
            color: "#000",
            border: "none",
            borderRadius: 12,
            padding: "14px",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          🚀 Mulai Permainan
        </motion.button>
      </motion.div>
    </div>
  );
}

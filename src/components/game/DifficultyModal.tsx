// src/components/game/DifficultyModal.tsx
"use client";
import { motion } from "framer-motion";
import { Difficulty, DIFFICULTY_CONFIG } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import { useState } from "react";

interface Props {
  onStart: (difficulty: Difficulty) => void;
}

export default function DifficultyModal({ onStart }: Props) {
  const [selected, setSelected] = useState<Difficulty>("normal");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300,
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
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏦</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#c8a96e", marginBottom: 6 }}>
          Z Banker
        </h2>
        <p style={{ color: "#555", fontSize: 12, marginBottom: 28 }}>
          Pilih tingkat kesulitan untuk memulai
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
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

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(selected)}
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

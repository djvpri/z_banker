// src/components/game/Tutorial.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { TUTORIAL_STEPS } from "@/types/game";
import { useGameStore } from "@/store/gameStore";

export default function Tutorial() {
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const showTutorial = useGameStore((s) => s.showTutorial);
  const setTutorialStep = useGameStore((s) => s.setTutorialStep);
  const setShowTutorial = useGameStore((s) => s.setShowTutorial);
  const setGame = useGameStore((s) => s.setGame);

  const current = TUTORIAL_STEPS[tutorialStep];
  const isLast = tutorialStep >= TUTORIAL_STEPS.length - 1;

  if (!showTutorial || !current) return null;

  function handleNext() {
    if (isLast) {
      setShowTutorial(false);
      setGame((g) => ({ ...g, tutorialDone: true }));
    } else {
      setTutorialStep(tutorialStep + 1);
    }
  }

  function handleSkip() {
    setShowTutorial(false);
    setGame((g) => ({ ...g, tutorialDone: true }));
  }

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}>
        <motion.div
          key={tutorialStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            background: "#13131e",
            border: "2px solid rgba(200,169,110,0.4)",
            borderRadius: 16,
            padding: 28,
            maxWidth: 420,
            width: "100%",
            boxShadow: "0 0 60px rgba(200,169,110,0.15)",
          }}
        >
          {/* Progress */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= tutorialStep ? "#c8a96e" : "#1a1a2e",
                transition: "background 0.3s",
              }} />
            ))}
          </div>

          {/* Step indicator */}
          <div style={{ fontSize: 10, color: "#555", marginBottom: 8, letterSpacing: 1 }}>
            LANGKAH {tutorialStep + 1} / {TUTORIAL_STEPS.length}
          </div>

          {/* Content */}
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#c8a96e", marginBottom: 10 }}>
            {current.title}
          </h3>
          <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6, marginBottom: 24 }}>
            {current.description}
          </p>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
            <button
              onClick={handleSkip}
              style={{
                background: "transparent", border: "1px solid #2a2a3a",
                color: "#555", borderRadius: 8, padding: "8px 16px",
                cursor: "pointer", fontSize: 12,
              }}
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNext}
              style={{
                background: "linear-gradient(135deg, #c8a96e, #8a6030)",
                color: "#000", border: "none", borderRadius: 8,
                padding: "8px 24px", fontWeight: 700, cursor: "pointer", fontSize: 13,
              }}
            >
              {isLast ? "🚀 Mulai Bermain!" : "Lanjut →"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

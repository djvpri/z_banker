// src/components/game/GameShell.tsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useGameStore } from "@/store/gameStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useSound } from "@/hooks/useSound";
import { useGameActions } from "@/hooks/useGameActions";
import { useAdvanceDay } from "@/hooks/useAdvanceDay";
import { Difficulty, DIFFICULTY_CONFIG } from "@/types/game";
import { TABS } from "@/lib/gameConstants";
import { fmt } from "@/lib/gameFormat";
import { TAB_COMPONENTS } from "./tabs";
import { Notif as NotifComp } from "./ui/Shared";
import Tutorial from "./Tutorial";
import DifficultyModal from "./DifficultyModal";
import HireModal from "./modals/HireModal";
import FraudModal from "./modals/FraudModal";
import NegotiationModal from "./modals/NegotiationModal";
import ActiveEventModal from "./modals/ActiveEventModal";
import ReviewModal from "./modals/ReviewModal";
import WeeklyReportModal from "./modals/WeeklyReportModal";
import Link from "next/link";

interface Props {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
}

export default function GameShell({ user }: Props) {
  const game = useGameStore((s) => s.game);
  const setGame = useGameStore((s) => s.setGame);
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const darkMode = useGameStore((s) => s.darkMode);
  const isMuted = useGameStore((s) => s.isMuted);
  const showTutorial = useGameStore((s) => s.showTutorial);
  const toggleDarkMode = useGameStore((s) => s.toggleDarkMode);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const resetGame = useGameStore((s) => s.resetGame);
  const setShowTutorial = useGameStore((s) => s.setShowTutorial);

  // Notifs & warnings
  const notifs = useGameStore((s) => s.notifs);
  const predictiveWarnings = useGameStore((s) => s.predictiveWarnings);

  // Modal state
  const activeEvent = useGameStore((s) => s.activeEvent);
  const setActiveEvent = useGameStore((s) => s.setActiveEvent);
  const reviewModal = useGameStore((s) => s.reviewModal);
  const setReviewModal = useGameStore((s) => s.setReviewModal);
  const showWeeklyReport = useGameStore((s) => s.showWeeklyReport);
  const setShowWeeklyReport = useGameStore((s) => s.setShowWeeklyReport);
  const fraudEvent = useGameStore((s) => s.fraudEvent);
  const negotiation = useGameStore((s) => s.negotiation);
  const showHire = useGameStore((s) => s.showHire);
  const setShowHire = useGameStore((s) => s.setShowHire);
  const rates = useGameStore((s) => s.rates);

  const loadGame = useGameStore((s) => s.loadGame);
  const { save } = useAutoSave(1);
  const { play } = useSound();
  const {
    handleFraud, handleHire,
    handleNegotiationAccept, handleNegotiationReject, handleNegotiationCounter,
  } = useGameActions();
  const { advanceDay } = useAdvanceDay();

  const staff = useGameStore((s) => s.staff);
  const achievements = useGameStore((s) => s.achievements);

  const [showDifficulty, setShowDifficulty] = useState(false);
  const [coinFloats, setCoinFloats] = useState<{ id: number; x: number }[]>([]);
  const [editingBankName, setEditingBankName] = useState(false);
  const [bankNameInput, setBankNameInput] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Apply dark/light mode
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Load save from database on mount
  useEffect(() => {
    async function loadFromDB() {
      try {
        const res = await fetch("/api/game/save");
        if (!res.ok) {
          setShowDifficulty(true);
          return;
        }
        const saves: { slot: number; day: number; gameState: Record<string, any> }[] = await res.json();
        const latest = saves.find((s) => s.slot === 1);
        if (latest && latest.day > 1) {
          loadGame(latest.gameState);
        } else {
          setShowDifficulty(true);
        }
      } catch {
        setShowDifficulty(true);
      }
    }
    loadFromDB();
  }, []);

  // Auto-save every time day changes
  useEffect(() => {
    if (game.day > 1) {
      save();
    }
  }, [game.day]);

  // Auto-submit to leaderboard when game is won
  useEffect(() => {
    if (!game.gameWon || scoreSubmitted || !user?.name) return;
    setScoreSubmitted(true);
    const cfg = DIFFICULTY_CONFIG[game.difficulty];
    const BRANCH_NAMES: Record<number, string> = {
      0: "Cabang Kecil", 1: "Cabang Madya", 2: "Kantor Pusat",
    };
    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerName: user.name,
        bankName: game.bankName || "Bank Nusantara",
        totalProfit: game.totalProfit,
        day: game.day,
        level: game.level,
        difficulty: game.difficulty,
        branch: BRANCH_NAMES[game.branch] || "Cabang Kecil",
        achievements: achievements.length,
        npl: game.npl,
        reputation: game.reputation,
      }),
    }).catch(() => {});
  }, [game.gameWon]);

  // Profit coin float animation
  useEffect(() => {
    if (game.profit > 0 && game.day > 1) {
      const id = Date.now();
      setCoinFloats((prev) => [...prev, { id, x: Math.random() * 60 - 30 }]);
      setTimeout(() => setCoinFloats((prev) => prev.filter((c) => c.id !== id)), 900);
      play("coin");
    }
  }, [game.day]);

  function handleStart(difficulty: Difficulty) {
    resetGame(difficulty);
    setShowDifficulty(false);
    setShowTutorial(true);
    play("success");
  }

  function handleNextDay() {
    if (game.gameOver || game.gameWon) return;
    advanceDay();
    play("coin");
  }

  const cfg = DIFFICULTY_CONFIG[game.difficulty];
  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div
      data-theme={darkMode ? "dark" : "light"}
      style={{
        minHeight: "100vh",
        background: darkMode ? "#080810" : "#f5f5f0",
        color: darkMode ? "#e0e0e0" : "#1a1a2e",
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: 13,
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* ── Modals ── */}
      {showDifficulty && <DifficultyModal onStart={handleStart} />}
      {showTutorial && <Tutorial />}
      {showHire && (
        <HireModal
          cash={game.cash}
          onHire={handleHire}
          onClose={() => setShowHire(false)}
        />
      )}
      {fraudEvent && <FraudModal fe={fraudEvent} onResolve={handleFraud} />}
      {negotiation && (
        <NegotiationModal
          negotiation={negotiation}
          loanRate={rates.loan}
          onAccept={handleNegotiationAccept}
          onReject={handleNegotiationReject}
          onCounter={handleNegotiationCounter}
        />
      )}
      {activeEvent && (
        <ActiveEventModal event={activeEvent} onClose={() => setActiveEvent(null)} />
      )}
      {reviewModal && (
        <ReviewModal data={reviewModal} onClose={() => setReviewModal(null)} />
      )}
      {showWeeklyReport && (
        <WeeklyReportModal report={showWeeklyReport} onClose={() => setShowWeeklyReport(null)} />
      )}

      {/* ── Game Over / Game Won end screen ── */}
      {(game.gameOver || game.gameWon) && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: "#13131e",
            border: `2px solid ${game.gameWon ? "#c8a96e66" : "#ef444466"}`,
            borderRadius: 20, padding: 32, maxWidth: 380, width: "100%", textAlign: "center",
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{game.gameWon ? "🏆" : "💸"}</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: game.gameWon ? "#c8a96e" : "#ef4444", marginBottom: 8 }}>
              {game.gameWon ? "MENANG! Bank Empire!" : "GAME OVER"}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 16, lineHeight: 1.6 }}>
              {game.gameWon
                ? "Luar biasa! Kamu berhasil mencapai Rp10 Miliar profit dan membangun bank empire dari nol."
                : game.cash <= 0 ? "Bank kehabisan kas — operasional tidak bisa dilanjutkan."
                : game.npl > 10 ? "NPL terlalu tinggi — bank tidak sehat secara finansial."
                : game.car < 8 ? "CAR di bawah minimum OJK — bank ditutup paksa."
                : "Semua staf resign — bank tidak bisa beroperasi."
              }
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20,
            }}>
              {[
                { label: "Hari Bertahan", val: game.day + " hari" },
                { label: "Total Profit", val: fmt(game.totalProfit) },
                { label: "Efisiensi", val: fmt(Math.round(game.totalProfit / game.day)) + "/hari" },
                { label: "Kesulitan", val: cfg.label },
                { label: "NPL Akhir", val: game.npl.toFixed(1) + "%", color: game.npl <= 3 ? "#22c55e" : game.npl <= 5 ? "#f59e0b" : "#ef4444" },
                { label: "Reputasi Akhir", val: game.reputation + "%", color: game.reputation >= 70 ? "#22c55e" : "#f59e0b" },
              ].map((item: any) => (
                <div key={item.label} style={{ background: "#0d0d14", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: "#555" }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: item.color || "#ddd", fontFamily: "monospace" }}>{item.val}</div>
                </div>
              ))}
            </div>
            {game.gameWon && (
              <div style={{ fontSize: 11, color: "#22c55e", marginBottom: 12, background: "#22c55e11", borderRadius: 8, padding: "8px 12px" }}>
                🏆 Skor otomatis tersimpan ke Leaderboard Global!
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowDifficulty(true)}
                style={{
                  flex: 1, padding: 12, borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg,#c8a96e,#8a6030)",
                  color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer",
                }}
              >
                🔄 Main Lagi
              </button>
              {game.gameWon && (
                <Link href="/leaderboard" style={{
                  flex: 1, padding: 12, borderRadius: 10, border: "1px solid #c8a96e44",
                  background: "transparent", color: "#c8a96e", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  📊 Lihat Ranking
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Notification overlay (fixed bottom-right) ── */}
      <div style={{
        position: "fixed", bottom: 16, right: 16, zIndex: 150,
        width: 280, display: "flex", flexDirection: "column", gap: 0,
        pointerEvents: "none",
      }}>
        <AnimatePresence>
          {notifs.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
            >
              <NotifComp msg={n.msg} type={n.type} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Coin float animations ── */}
      {coinFloats.map((c) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 1, y: 0, x: c.x }}
          animate={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.8 }}
          style={{
            position: "fixed", top: 80, right: 120, zIndex: 500,
            fontSize: 20, pointerEvents: "none",
          }}
        >
          💰
        </motion.div>
      ))}

      {/* ── Header ── */}
      <div style={{
        background: darkMode ? "#0e0e18" : "#fff",
        borderBottom: `1px solid ${darkMode ? "#1a1a2e" : "#e0ddd5"}`,
        padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: darkMode ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏦</span>
          <div>
            {editingBankName ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const name = bankNameInput.trim();
                if (name) setGame((g) => ({ ...g, bankName: name }));
                setEditingBankName(false);
              }} style={{ display: "flex", gap: 4 }}>
                <input
                  autoFocus
                  value={bankNameInput}
                  onChange={(e) => setBankNameInput(e.target.value)}
                  maxLength={30}
                  onBlur={() => {
                    const name = bankNameInput.trim();
                    if (name) setGame((g) => ({ ...g, bankName: name }));
                    setEditingBankName(false);
                  }}
                  style={{
                    background: "#1a1a2e", border: "1px solid #c8a96e55",
                    borderRadius: 5, color: "#c8a96e", fontSize: 13,
                    fontWeight: 700, padding: "2px 6px", width: 140, outline: "none",
                  }}
                />
              </form>
            ) : (
              <div
                onClick={() => { setBankNameInput(game.bankName || "Bank Nusantara"); setEditingBankName(true); }}
                title="Klik untuk ubah nama bank"
                style={{
                  fontWeight: 800, fontSize: 14, letterSpacing: 0.3,
                  background: "linear-gradient(135deg, #c8a96e, #e8c88e)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  cursor: "pointer",
                }}
              >
                {game.bankName || "Bank Nusantara"} ✏️
              </div>
            )}
            <div style={{ fontSize: 9, color: "#555" }}>
              D{game.day} · Lv.{game.level}
              <span style={{ color: cfg.color, marginLeft: 6 }}>· {cfg.label}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {/* User avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#c8a96e22", border: "1px solid #c8a96e44",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#c8a96e", fontWeight: 700, flexShrink: 0,
          }}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Controls */}
          {[
            { icon: isMuted ? "🔇" : "🔊", action: () => { toggleMute(); play("click"); }, title: "Suara" },
            { icon: darkMode ? "☀️" : "🌙", action: () => { toggleDarkMode(); play("click"); }, title: "Tema" },
            { icon: "🔄", action: () => setShowDifficulty(true), title: "New game" },
          ].map((btn) => (
            <button key={btn.icon} onClick={btn.action} title={btn.title}
              className="hdr-btn"
              style={{
                background: "transparent",
                border: `1px solid ${darkMode ? "#1a1a2e" : "#e0ddd5"}`,
                borderRadius: 7, padding: "4px 7px",
                cursor: "pointer", fontSize: 14,
              }}>
              {btn.icon}
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Keluar"
            className="hdr-btn"
            style={{
              background: "transparent",
              border: `1px solid ${darkMode ? "#1a1a2e" : "#e0ddd5"}`,
              borderRadius: 7, padding: "4px 7px",
              cursor: "pointer", fontSize: 13,
              color: darkMode ? "#666" : "#999",
            }}
          >
            <span>🚪</span>
          </button>

          {/* Next Day button */}
          <button
            data-tab="nextday-btn"
            onClick={handleNextDay}
            disabled={game.gameOver || game.gameWon}
            className="hdr-next-day"
            style={{
              background: game.gameOver || game.gameWon ? "#333" : "linear-gradient(135deg,#c8a96e,#8a6030)",
              color: game.gameOver || game.gameWon ? "#555" : "#000",
              border: "none", borderRadius: 8,
              padding: "6px 12px",
              fontWeight: 800, fontSize: 12,
              cursor: game.gameOver || game.gameWon ? "not-allowed" : "pointer",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            ⏭ <span className="hdr-label">Next Day</span>
          </button>

          <Link href="/leaderboard"
            className="hdr-btn"
            style={{
              fontSize: 13, color: "#c8a96e", textDecoration: "none",
              border: "1px solid #c8a96e33",
              padding: "4px 7px", borderRadius: 7,
            }}>
            🏆
          </Link>
        </div>
      </div>

      {/* Win progress bar */}
      <div data-tab="winbar" style={{ background: darkMode ? "#111" : "#e0ddd5", height: 3 }}>
        <motion.div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #c8a96e, #22c55e)",
          }}
          animate={{
            width: `${Math.min((game.totalProfit / (cfg.targetProfit)) * 100, 100)}%`
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Tab navigation */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 2,
        background: darkMode ? "#0e0e18" : "#fff",
        borderBottom: `1px solid ${darkMode ? "#1a1a2e" : "#e0ddd5"}`,
        padding: "0 12px",
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            data-tab={t.id}
            onClick={() => { setActiveTab(t.id); play("click"); }}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === t.id ? "2px solid #c8a96e" : "2px solid transparent",
              color: activeTab === t.id ? "#c8a96e" : "#666",
              padding: "8px 10px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: activeTab === t.id ? 700 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main game content area */}
      <div className="game-content" style={{ padding: "10px 12px", maxWidth: 840, margin: "0 auto" }}>
        {/* Predictive warnings (in-page, above tab content) */}
        {predictiveWarnings.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            {predictiveWarnings.map((w) => (
              <NotifComp key={w.id} msg={w.msg} type={w.type} />
            ))}
          </div>
        )}

        {ActiveTabComponent ? (
          <ActiveTabComponent />
        ) : (
          <div style={{
            textAlign: "center", padding: 40,
            color: darkMode ? "#333" : "#bbb",
            fontSize: 13,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
            <p>Tab "{activeTab}" sedang dikonversi dari artifact</p>
            <p style={{ marginTop: 8, fontSize: 11 }}>
              Lihat <code>src/components/game/tabs/</code> untuk tab yang sudah tersedia
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

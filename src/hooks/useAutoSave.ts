// src/hooks/useAutoSave.ts
"use client";
import { useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useGameStore } from "@/store/gameStore";

export function useAutoSave(slot = 1) {
  const { data: session } = useSession();
  const isSaving = useRef(false);

  const save = useCallback(async () => {
    if (!session?.user || isSaving.current) return;
    isSaving.current = true;

    try {
      // Selalu ambil state terbaru langsung dari store agar reset/perubahan
      // yang baru saja terjadi (mis. "Main Lagi") tidak tertinggal save lama.
      const s = useGameStore.getState();
      const gameState = {
        game: s.game, staff: s.staff, rates: s.rates, loanPortfolio: s.loanPortfolio,
        savingsPortfolio: s.savingsPortfolio, investments: s.investments,
        activeProducts: s.activeProducts, branches: s.branches, acquired: s.acquired,
        lpsEnabled: s.lpsEnabled, achievements: s.achievements, competitors: s.competitors,
        profitHistory: s.profitHistory, weeklyReports: s.weeklyReports, eventLog: s.eventLog,
      };

      await fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot,
          gameState,
          day: s.game.day,
          totalProfit: s.game.totalProfit,
          level: s.game.level,
          difficulty: s.game.difficulty,
        }),
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      isSaving.current = false;
    }
  }, [session, slot]);

  return { save };
}

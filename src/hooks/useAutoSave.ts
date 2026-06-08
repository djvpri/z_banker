// src/hooks/useAutoSave.ts
"use client";
import { useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useGameStore } from "@/store/gameStore";

export function useAutoSave(slot = 1) {
  const { data: session } = useSession();
  const isSaving = useRef(false);
  const game = useGameStore((s) => s.game);
  const staff = useGameStore((s) => s.staff);
  const loanPortfolio = useGameStore((s) => s.loanPortfolio);
  const savingsPortfolio = useGameStore((s) => s.savingsPortfolio);
  const investments = useGameStore((s) => s.investments);
  const activeProducts = useGameStore((s) => s.activeProducts);
  const branches = useGameStore((s) => s.branches);
  const acquired = useGameStore((s) => s.acquired);
  const lpsEnabled = useGameStore((s) => s.lpsEnabled);
  const achievements = useGameStore((s) => s.achievements);
  const rates = useGameStore((s) => s.rates);

  const save = useCallback(async () => {
    if (!session?.user || isSaving.current) return;
    isSaving.current = true;

    try {
      const gameState = {
        game, staff, rates, loanPortfolio, savingsPortfolio,
        investments, activeProducts, branches, acquired,
        lpsEnabled, achievements,
      };

      await fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot,
          gameState,
          day: game.day,
          totalProfit: game.totalProfit,
          level: game.level,
          difficulty: game.difficulty,
        }),
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      isSaving.current = false;
    }
  }, [session, game, staff, rates, loanPortfolio, savingsPortfolio,
      investments, activeProducts, branches, acquired, lpsEnabled, achievements, slot]);

  return { save };
}

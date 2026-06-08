// src/lib/camels.ts
// Dipakai CamelsTab — rating kesehatan bank ala OJK (Capital, Asset, Management, Earnings, Liquidity, Sensitivity)
import { GameState, Staff } from "@/types/game";

export interface CamelsResult {
  C: number; A: number; M: number; E: number; L: number; S: number;
  avg: number;
  label: string;
  color: string;
}

export function calcCAMELS(game: GameState, staff: Staff[]): CamelsResult {
  const C = game.car >= 20 ? 5 : game.car >= 15 ? 4 : game.car >= 12 ? 3 : game.car >= 10 ? 2 : 1;
  const A = game.npl <= 1 ? 5 : game.npl <= 2 ? 4 : game.npl <= 5 ? 3 : game.npl <= 8 ? 2 : 1;
  const active = staff.filter((s) => s.status === "aktif");
  const avgSkill = active.length ? active.reduce((a, s) => a + s.skill, 0) / active.length : 3;
  const M = avgSkill >= 8 ? 5 : avgSkill >= 6 ? 4 : avgSkill >= 5 ? 3 : avgSkill >= 3 ? 2 : 1;
  const E = game.nim >= 4 ? 5 : game.nim >= 3 ? 4 : game.nim >= 2 ? 3 : game.nim >= 1 ? 2 : 1;
  const L = game.ldr >= 80 && game.ldr <= 92 ? 5 : game.ldr >= 70 && game.ldr <= 100 ? 4 : game.ldr >= 60 ? 3 : game.ldr >= 50 ? 2 : 1;
  const S = game.reputation >= 80 ? 5 : game.reputation >= 65 ? 4 : game.reputation >= 50 ? 3 : game.reputation >= 35 ? 2 : 1;
  const avg = parseFloat(((C + A + M + E + L + S) / 6).toFixed(2));
  const label = avg >= 4.5 ? "Sangat Sehat" : avg >= 3.5 ? "Sehat" : avg >= 2.5 ? "Cukup Sehat" : avg >= 1.5 ? "Kurang Sehat" : "Tidak Sehat";
  const color = avg >= 4.5 ? "#22c55e" : avg >= 3.5 ? "#60a5fa" : avg >= 2.5 ? "#f59e0b" : avg >= 1.5 ? "#f97316" : "#ef4444";
  return { C, A, M, E, L, S, avg, label, color };
}

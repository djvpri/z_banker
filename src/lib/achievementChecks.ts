// src/lib/achievementChecks.ts
// Logika unlock ACHIEVEMENTS — dipindahkan dari fungsi `check` tiap entri ACHIEVEMENTS
// di artifact bank-manager-simulator.jsx (dipakai useAdvanceDay)
import { GameState, Staff, LoanPortfolioItem } from "@/types/game";
import { B } from "./gameFormat";

export function checkAchievement(id: string, g: GameState, s: Staff[], lp: LoanPortfolioItem[]): boolean {
  switch (id) {
    case "first_profit": return g.profit > 0;
    case "zero_npl": return g.npl < 1;
    case "bank_terpercaya": return g.reputation >= 80;
    case "raja_kredit": return g.loans >= 1 * B;
    case "tim_solid": return s.filter((x) => x.status === "aktif").length >= 6;
    case "ekspansi": return g.branch >= 1;
    case "kantor_pusat": return g.branch >= 2;
    case "miliarder": return g.totalProfit >= 1 * B;
    case "anti_fraud": return g.day >= 30;
    case "pasar_dominan": return false; // dihitung dinamis di tempat lain
    case "kredit_lunas": return lp.filter((l) => l.status === "lunas").length >= 5;
    case "loyalis": return s.some((x) => x.loyalty === 10);
    case "veteran": return s.some((x) => x.daysWorked >= 60);
    case "aman_ojk": return g.car > 15 && g.npl < 2;
    case "empire": return g.totalProfit >= 10 * B;
    default: return false;
  }
}

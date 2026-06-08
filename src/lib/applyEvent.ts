// src/lib/applyEvent.ts
// Efek event acak terhadap GameState — dipindahkan dari applyEvent di artifact
// bank-manager-simulator.jsx (dipakai useAdvanceDay untuk event tanpa handler khusus)
import { GameState, GameEvent, Staff } from "@/types/game";
import { clamp, rnd, M } from "./gameFormat";

export function applyEvent(ev: GameEvent, prev: GameState, staffList: Staff[]): Partial<GameState> {
  void staffList;
  switch (ev.id) {
    case "ojk": return prev.car < 12 || prev.npl > 5
      ? { cash: prev.cash - 50 * M, reputation: clamp(prev.reputation - 20, 0, 100) }
      : { reputation: clamp(prev.reputation + 12, 0, 100) };
    case "bankrun": return { cash: prev.cash * 0.75, deposits: prev.deposits * 0.75 };
    case "boom": return { reputation: clamp(prev.reputation + 15, 0, 100), deposits: prev.deposits * 1.12 };
    case "fintech": return { reputation: clamp(prev.reputation - 12, 0, 100), deposits: prev.deposits * 0.94 };
    case "startup": return { deposits: prev.deposits + 500 * M, reputation: clamp(prev.reputation + 8, 0, 100) };
    case "fraud": return {};
    case "award": return { reputation: clamp(prev.reputation + 25, 0, 100) };
    case "krisis": return { npl: clamp(prev.npl + 1.5, 0.5, 15), deposits: prev.deposits * 0.85 };
    case "bonus": return { loans: prev.loans * 1.1 };
    case "training_gov": return {};
    case "mogok": return {};
    case "rekrut_baru": return {};
    case "sakit_massal": return {};
    case "kenaikan_gaji": return {};
    case "beasiswa": return {};
    case "nasabah_vip": return { deposits: prev.deposits + rnd(200, 800) * M, reputation: clamp(prev.reputation + 5, 0, 100) };
    case "kredit_macet": return { npl: clamp(prev.npl + rnd(1, 3) * 0.5, 0.5, 15), loans: prev.loans * 0.95 };
    case "viral": return { reputation: clamp(prev.reputation + 20, 0, 100), deposits: prev.deposits * 1.08 };
    case "gosip": return { reputation: clamp(prev.reputation - 15, 0, 100), deposits: prev.deposits * 0.96 };
    case "inflasi": return { deposits: prev.deposits * 0.88, npl: clamp(prev.npl + 0.5, 0.5, 15) };
    case "haji": return { deposits: prev.deposits * 0.92, cash: prev.cash * 0.9 };
    case "lebaran": return { reputation: clamp(prev.reputation + 10, 0, 100), cash: prev.cash * 1.05 };
    case "pemilu": return { deposits: prev.deposits * 0.93, reputation: clamp(prev.reputation - 5, 0, 100) };
    case "sistem_down": return { reputation: clamp(prev.reputation - 18, 0, 100), cash: prev.cash - 15 * M };
    case "banjir": return { cash: prev.cash - 30 * M, reputation: clamp(prev.reputation - 10, 0, 100) };
    case "merger_offer": return { deposits: prev.deposits + 300 * M, cash: prev.cash - 20 * M };
    case "gedung_baru": return { reputation: clamp(prev.reputation + 12, 0, 100) };
    case "audit_eksternal": return prev.npl <= 3
      ? { reputation: clamp(prev.reputation + 18, 0, 100), cash: prev.cash + 10 * M }
      : { reputation: clamp(prev.reputation - 10, 0, 100), cash: prev.cash - 10 * M };
    default: return {};
  }
}

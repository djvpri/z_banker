// src/lib/teamStats.ts
// Dipakai TimTab (ringkasan efek tim) dan nantinya useAdvanceDay (kalkulasi NPL/reputasi harian)
import { Staff } from "@/types/game";

export interface TeamStats {
  nplMod: number;
  repMod: number;
  avgSkill: number;
  avgMorale: number;
  hasMgr: boolean;
  mgrSkill: number;
  mgrCount: number;
}

export function teamStats(staffList: Staff[]): TeamStats {
  const active = staffList.filter((s) => s.status === "aktif");
  if (!active.length) return { nplMod: 0, repMod: 0, avgSkill: 5, avgMorale: 50, hasMgr: false, mgrSkill: 0, mgrCount: 0 };

  const analysts = active.filter((s) => s.role === "analis");
  const cs = active.filter((s) => s.role === "cs");
  const managers = active.filter((s) => s.role === "manajer");
  const hasMgr = managers.length > 0;
  const mgrSkill = hasMgr ? managers.reduce((a, s) => a + s.skill, 0) / managers.length : 0;
  const mgrCount = managers.length;

  const mgrBoost = hasMgr ? 2 : 0;
  const nplMod = analysts.reduce((a, s) => a + (s.skill + mgrBoost - 5) * 0.05, 0);
  const repMod = cs.reduce((a, s) => a + (s.skill + mgrBoost - 5) * 0.3, 0);
  const avgSkill = active.reduce((a, s) => a + s.skill, 0) / active.length;
  const avgMorale = active.reduce((a, s) => a + s.morale, 0) / active.length;

  return { nplMod, repMod, avgSkill, avgMorale, hasMgr, mgrSkill, mgrCount };
}

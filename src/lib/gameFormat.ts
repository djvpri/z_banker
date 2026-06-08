// src/lib/gameFormat.ts
export const M = 1_000_000;
export const B = 1_000_000_000;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const rnd = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const fmt = (n: number) => {
  if (!n && n !== 0) return "Rp 0";
  const s = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1e12) return s + "Rp " + (a / 1e12).toFixed(2) + "T";
  if (a >= 1e9) return s + "Rp " + (a / 1e9).toFixed(1) + "M";
  if (a >= 1e6) return s + "Rp " + (a / 1e6).toFixed(0) + "jt";
  return s + "Rp " + a.toLocaleString();
};

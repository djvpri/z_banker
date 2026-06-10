// src/lib/gameGenerators.ts
// Generator nasabah/prospek/kompetitor — dipindahkan dari genProspect/genLoanCustomer/genCompetitor
// di artifact bank-manager-simulator.jsx (dipakai useAdvanceDay)
import { Customer, Prospect, Competitor } from "@/types/game";
import { rnd, pick, M } from "./gameFormat";
import {
  PROSPECT_NAMES, PROSPECT_SECTORS, PROSPECT_PRODUCTS,
  CUST_NAMES, CUST_TYPES, COLLATERAL_TYPES,
  BANK_NAMES, BANK_SPECIALITIES, BANK_STRATEGIES,
} from "./gameConstants";

export function genProspect(): Prospect {
  const product = pick(PROSPECT_PRODUCTS);
  const isLoan = product.includes("Kredit") || product.includes("Pinjaman") || product.includes("KPR") || product.includes("KTA");
  const potential = isLoan ? rnd(50, 800) * M : rnd(20, 300) * M;
  return {
    id: Date.now() + Math.random(),
    name: pick(PROSPECT_NAMES),
    sector: pick(PROSPECT_SECTORS),
    product,
    isLoan,
    potential,
    interest: rnd(30, 65),
    score: rnd(400, 820),
    contacted: false,
    approached: 0,
    daysLeft: rnd(3, 10),
    lastApproachDay: -1,
  };
}

export function genLoanCustomer(day: number, branch: number): Customer {
  const name = pick(CUST_NAMES);
  const typePool = branch >= 2 ? CUST_TYPES : CUST_TYPES.filter((t) => t !== "Deposito Korporat");
  const type = pick(typePool);
  const isLoan = ["Deposito", "Buka Rekening", "Deposito Korporat"].indexOf(type) < 0;
  const amount = type === "Deposito Korporat" ? rnd(100, 600) * 10 * M
    : type === "Deposito" ? rnd(10, 60) * M
    : type === "Buka Rekening" ? rnd(1, 5) * M
    : type === "Pinjaman KPR" ? rnd(100, 500) * M
    : rnd(20, 200) * M;
  const score = rnd(400, 820);
  const risk = rnd(0, 100);
  const needsCollateral = isLoan && (score < 550 || risk > 60);
  const collateral = needsCollateral ? pick(COLLATERAL_TYPES) : null;
  const collateralValue = needsCollateral ? Math.floor(amount * (1.1 + Math.random() * 0.5)) : 0;
  const wantsNegotiate = isLoan && Math.random() < 0.35;
  const counterRateDiscount = wantsNegotiate ? parseFloat((0.5 + Math.random() * 1.5).toFixed(1)) : 0;
  const processDays = isLoan ? (score < 500 ? 3 : score < 650 ? 2 : 1) : 0;
  return {
    id: Date.now() + Math.random(),
    name, type, amount, score, risk, day, isLoan,
    needsCollateral, collateral, collateralValue,
    wantsNegotiate, counterRateDiscount,
    negotiationRound: 0,
    processDays,
    inPipeline: false,
  };
}

export function genCompetitor(day: number): Competitor {
  const spec = pick(BANK_SPECIALITIES);
  const strat = pick(BANK_STRATEGIES);
  const startRep = rnd(35, 70);
  const startDep = rnd(100, 400) * M;
  return {
    id: Date.now() + Math.random(),
    name: pick(BANK_NAMES),
    speciality: spec,
    strategy: strat,
    reputation: startRep,
    deposits: startDep,
    loans: startDep * (0.5 + Math.random() * 0.4),
    age: 0,
    lifespan: rnd(20, 60),
    enteredDay: day,
    exitWarning: false,
  };
}

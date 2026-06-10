// src/hooks/useGameActions.ts
// Handler-handler interaktif (antrian nasabah, negosiasi kredit) — dipindahkan
// dari handleCustomer/handleNegotiation* di artifact bank-manager-simulator.jsx
"use client";
import { useCallback } from "react";
import { useGameStore, genStaff } from "@/store/gameStore";
import { Customer, StaffRole, Staff } from "@/types/game";
import { clamp, fmt, rnd, pick, M } from "@/lib/gameFormat";
import {
  STAFF_ROLES, PROMO_PATHS, INVESTMENT_OPTIONS, BRANCHES,
  CITIES, ACQUISITION_TARGETS, ALL_PRODUCTS, STRESS_SCENARIOS, LPS_PREMIUM_RATE,
  BRANCH_CONSTRUCTION_DAYS, PRODUCT_INSTALL_DAYS,
} from "@/lib/gameConstants";

const isDepositType = (type: string) => ["Deposito", "Buka Rekening", "Deposito Korporat"].indexOf(type) >= 0;

export function useGameActions() {
  const addNotif = useGameStore((s) => s.addNotif);

  const handleCustomer = useCallback((c: Customer, action: "accept" | "reject") => {
    const { staff, rates, game } = useGameStore.getState();
    const { setCustomers, setGame, setStaff, setCreditPipeline, setNegotiation, setSavingsPortfolio } = useGameStore.getState();

    setCustomers((p) => p.filter((x) => x.id !== c.id));
    const isDeposit = isDepositType(c.type);

    if (action === "reject") {
      addNotif("❌ " + c.name + " ditolak.", "warning");
      setGame((g) => ({ ...g, reputation: clamp(g.reputation - 1, 0, 100) }));
      return;
    }

    const activeStaff = staff.filter((s) => s.status === "aktif");
    if (activeStaff.length === 0) {
      addNotif("🔒 Semua staf istirahat — tidak bisa memproses transaksi!", "danger");
      setCustomers((p) => p.concat([c]));
      return;
    }

    if (isDeposit) {
      const activeTellers = staff.filter((s) => s.role === "teller" && s.status === "aktif");
      if (activeTellers.length === 0) {
        addNotif("🔒 Teller sedang istirahat — deposito tidak bisa diproses!", "danger");
        setCustomers((p) => p.concat([c]));
        return;
      }
      setGame((g) => ({ ...g, deposits: g.deposits + c.amount, reputation: clamp(g.reputation + 2, 0, 100) }));
      addNotif("✅ " + c.name + " menyetor " + fmt(c.amount), "success");
      setStaff((s) => {
        const tellers = s.filter((x) => x.role === "teller" && x.status === "aktif");
        const teller = tellers.reduce((best, x) => (x.workload < best.workload ? x : best), tellers[0]);
        return s.map((x) => (x.id === teller.id ? { ...x, workload: clamp(x.workload + 10, 0, 100) } : x));
      });
      const isDeposito = c.type === "Deposito" || c.type === "Deposito Korporat";
      setSavingsPortfolio((sp) => sp.concat([{
        id: Date.now() + Math.random(),
        holder: c.name,
        type: c.type === "Buka Rekening" ? "Tabungan Reguler" : c.type,
        amount: c.amount,
        rate: rates.savings,
        maturity: isDeposito ? rnd(90, 365) : 0,
        daysLeft: isDeposito ? rnd(60, 300) : 0,
      }]));
    } else {
      const analysts = staff.filter((s) => s.role === "analis" && s.status === "aktif");
      if (analysts.length === 0) {
        addNotif("🔒 Analis Kredit sedang istirahat — kredit tidak bisa diproses!", "danger");
        setCustomers((p) => p.concat([c]));
        return;
      }
      const analyst = analysts.reduce((best, s) => (s.workload < best.workload ? s : best), analysts[0]);

      if (c.wantsNegotiate && c.negotiationRound === 0) {
        setNegotiation({ customer: c, proposedRate: parseFloat((rates.loan - c.counterRateDiscount).toFixed(1)) });
        setCustomers((p) => p.filter((x) => x.id !== c.id));
        return;
      }

      if (c.needsCollateral && !c.collateral) {
        addNotif("⚠️ Kredit " + c.name + " tanpa kolateral — risiko tinggi!", "warning");
      }

      const agreedRate = rates.loan;
      setCreditPipeline((pl) => pl.concat([{
        id: Date.now(),
        customer: c,
        analystId: analyst.id,
        startDay: game.day,
        processDays: c.processDays,
        agreedRate,
        daysLeft: c.processDays,
      }]));

      addNotif("📋 Kredit " + c.name + " masuk pipeline — proses " + c.processDays + " hari.", "info");

      setStaff((s) => {
        let updated = s.map((x) => (x.id === analyst.id ? { ...x, workload: clamp(x.workload + 25, 0, 100) } : x));
        const tellers = updated.filter((x) => x.role === "teller" && x.status === "aktif");
        if (tellers.length) {
          const teller = tellers.reduce((best, x) => (x.workload < best.workload ? x : best), tellers[0]);
          updated = updated.map((x) => (x.id === teller.id ? { ...x, workload: clamp(x.workload + 10, 0, 100) } : x));
        }
        return updated;
      });
    }
  }, [addNotif]);

  const handleNegotiationAccept = useCallback((agreedRate: number) => {
    const { negotiation, staff, game } = useGameStore.getState();
    const { setCreditPipeline, setStaff, setNegotiation } = useGameStore.getState();
    if (!negotiation) return;
    const c: Customer = { ...negotiation.customer, wantsNegotiate: false, negotiationRound: 1 };
    addNotif("🤝 Deal! " + c.name + " setuju bunga " + agreedRate + "%.", "success");
    const analysts = staff.filter((s) => s.role === "analis" && s.status === "aktif");
    const analyst = analysts.length ? analysts.reduce((b, s) => (s.workload < b.workload ? s : b), analysts[0]) : null;
    setCreditPipeline((pl) => pl.concat([{
      id: Date.now(), customer: c, analystId: analyst ? analyst.id : 0,
      startDay: game.day, processDays: c.processDays, agreedRate, daysLeft: c.processDays,
    }]));
    if (analyst) {
      const analystId = analyst.id;
      setStaff((s) => s.map((x) => (x.id === analystId ? { ...x, workload: clamp(x.workload + 25, 0, 100) } : x)));
    }
    setNegotiation(null);
  }, [addNotif]);

  const handleNegotiationReject = useCallback(() => {
    const { negotiation } = useGameStore.getState();
    const { setGame, setNegotiation } = useGameStore.getState();
    if (!negotiation) return;
    addNotif("❌ Negosiasi gagal — " + negotiation.customer.name + " pergi.", "warning");
    setGame((g) => ({ ...g, reputation: clamp(g.reputation - 2, 0, 100) }));
    setNegotiation(null);
  }, [addNotif]);

  const handleNegotiationCounter = useCallback((counterRate: number) => {
    const { negotiation, rates } = useGameStore.getState();
    const { setNegotiation } = useGameStore.getState();
    if (!negotiation) return;
    const c = negotiation.customer;
    const minRate = rates.loan - c.counterRateDiscount;
    if (counterRate <= minRate + 0.5) {
      handleNegotiationAccept(counterRate);
    } else if (c.negotiationRound >= 2) {
      addNotif("😤 " + c.name + " tidak mau tawar lagi — pergi!", "danger");
      setNegotiation(null);
    } else {
      const newCounter = parseFloat((minRate + Math.random() * 0.3).toFixed(1));
      addNotif("💬 " + c.name + " balas: minta bunga " + newCounter + "%.", "info");
      setNegotiation({
        customer: { ...c, negotiationRound: (c.negotiationRound || 0) + 1 },
        proposedRate: newCounter,
      });
    }
  }, [addNotif, handleNegotiationAccept]);

  const processEarlyRepay = useCallback((loanId: number) => {
    const { loanPortfolio } = useGameStore.getState();
    const { setLoanPortfolio, setGame } = useGameStore.getState();
    const loan = loanPortfolio.find((l) => l.id === loanId);
    if (!loan) return;
    const remainingMonths = loan.tenor - loan.paidMonths;
    const remainingPrincipal = Math.floor(loan.amount * (remainingMonths / loan.tenor));
    const monthlyRate = loan.rate / 100 / 12;
    const lostInterest = Math.floor(remainingPrincipal * monthlyRate * remainingMonths);
    const penaltyRate = remainingMonths / loan.tenor > 0.5 ? 0.03 : 0.015;
    const penalty = Math.floor(remainingPrincipal * penaltyRate);
    const cashReceived = remainingPrincipal + penalty;
    const netLoss = lostInterest - penalty;
    setLoanPortfolio((lp) => lp.filter((l) => l.id !== loanId));
    setGame((g) => ({ ...g, cash: g.cash + cashReceived, loans: Math.max(0, g.loans - remainingPrincipal) }));
    addNotif(
      "💰 " + loan.debtor + " lunasi awal. Kas +" + fmt(cashReceived) +
      " | Penalti +" + fmt(penalty) +
      (netLoss > 0 ? " | ⚠️ Bunga hilang -" + fmt(netLoss) : " | ✅ Penalti > bunga hilang"),
      netLoss > penalty ? "warning" : "success"
    );
  }, [addNotif]);

  const handleSendOffer = useCallback((loanId: number) => {
    const { earlyRepayOffers, earlyRepayRequests, game } = useGameStore.getState();
    const { setEarlyRepayOffers, setEarlyRepayRequests } = useGameStore.getState();
    if (earlyRepayOffers.some((o) => o.loanId === loanId)) {
      addNotif("⏳ Penawaran sudah dikirim, tunggu jawaban debitur.", "info");
      return;
    }
    if (earlyRepayRequests.some((r) => r.loanId === loanId)) {
      processEarlyRepay(loanId);
      setEarlyRepayRequests((r) => r.filter((x) => x.loanId !== loanId));
      return;
    }
    setEarlyRepayOffers((o) => o.concat([{ loanId, sentDay: game.day }]));
    addNotif("📨 Penawaran pelunasan awal dikirim ke debitur. Jawaban esok hari.", "info");
  }, [addNotif, processEarlyRepay]);

  const handleAcceptRequest = useCallback((loanId: number) => {
    const { setEarlyRepayRequests } = useGameStore.getState();
    processEarlyRepay(loanId);
    setEarlyRepayRequests((r) => r.filter((x) => x.loanId !== loanId));
  }, [processEarlyRepay]);

  const handleRejectRequest = useCallback((loanId: number) => {
    const { loanPortfolio, earlyRepayRequests } = useGameStore.getState();
    const { setEarlyRepayRequests } = useGameStore.getState();
    const req = earlyRepayRequests.find((r) => r.loanId === loanId);
    const loan = loanPortfolio.find((l) => l.id === loanId);
    if (req && loan) addNotif("❌ Permintaan pelunasan " + loan.debtor + " ditolak.", "warning");
    setEarlyRepayRequests((r) => r.filter((x) => x.loanId !== loanId));
  }, [addNotif]);

  const handleSeizeCollateral = useCallback((loanId: number) => {
    const { loanPortfolio } = useGameStore.getState();
    const { setLoanPortfolio, setGame } = useGameStore.getState();
    const loan = loanPortfolio.find((l) => l.id === loanId);
    if (!loan || loan.status !== "perhatian" || !loan.collateral) {
      addNotif("❌ Tidak bisa sita — tidak ada kolateral atau kredit masih lancar.", "danger");
      return;
    }
    const recovery = Math.floor(loan.collateralValue * 0.7);
    setLoanPortfolio((lp) => lp.filter((l) => l.id !== loanId));
    setGame((g) => ({ ...g, cash: g.cash + recovery, loans: Math.max(0, g.loans - loan.amount), npl: clamp(g.npl - 0.3, 0.5, 15) }));
    addNotif("🏠 Kolateral " + loan.debtor + " disita! Recovery " + fmt(recovery) + " dari " + fmt(loan.collateralValue), "warning");
  }, [addNotif]);

  const handleApproach = useCallback((pid: number) => {
    const { staff, game, prospects } = useGameStore.getState();
    const { setStaff, setProspects } = useGameStore.getState();
    const target = prospects.find((p) => p.id === pid);
    if (target && target.lastApproachDay === game.day) {
      addNotif("⏳ " + target.name + " sudah di-approach hari ini. Coba lagi besok.", "warning");
      return;
    }
    const csActive = staff.filter((s) => (s.role === "cs" || s.role === "teller") && s.status === "aktif");
    if (csActive.length === 0) { addNotif("❌ Tidak ada staf CS/Teller aktif!", "danger"); return; }
    const csStaff = csActive.reduce((best, s) => (s.workload < best.workload ? s : best), csActive[0]);
    const overloaded = csStaff.workload >= 80;
    setStaff((s) => s.map((x) => (x.id === csStaff.id ? { ...x, workload: clamp(x.workload + 20, 0, 100) } : x)));
    setProspects((prev) => prev.map((p) => {
      if (p.id !== pid) return p;
      const ni = clamp(p.interest + rnd(5, 20), 10, 99);
      addNotif((overloaded ? "⚠️ " : "📞 ") + csStaff.name + " (beban " + csStaff.workload + "%) menghubungi " + p.name + ". Ketertarikan: " + ni + "%", overloaded ? "warning" : "info");
      return { ...p, contacted: true, approached: p.approached + 1, interest: ni, lastApproachDay: game.day };
    }));
  }, [addNotif]);

  const handleConvert = useCallback((pid: number) => {
    const { prospects, game, rates } = useGameStore.getState();
    const { setLoanPortfolio, setSavingsPortfolio, setGame, setProspects } = useGameStore.getState();
    const prospect = prospects.find((p) => p.id === pid);
    if (!prospect) return;
    const chance = (prospect.interest / 100) * 0.6 + (game.reputation / 100) * 0.4;
    if (Math.random() < chance) {
      if (prospect.isLoan) {
        const nl = {
          id: Date.now(), debtor: prospect.name, type: prospect.product, amount: prospect.potential,
          rate: rates.loan, tenor: rnd(12, 60), paidMonths: 0,
          risk: (prospect.score >= 650 ? "low" : prospect.score >= 550 ? "medium" : "high") as "low" | "medium" | "high",
          status: "lancar" as const, collateral: null, collateralValue: 0,
        };
        setLoanPortfolio((p) => p.concat([nl]));
        setGame((g) => ({ ...g, loans: g.loans + prospect.potential }));
        addNotif("🎉 " + prospect.name + " dikonversi! Kredit " + fmt(prospect.potential) + " masuk portofolio.", "success");
      } else {
        const isDeposito = prospect.product.indexOf("Deposito") >= 0;
        const ns = {
          id: Date.now(), holder: prospect.name, type: prospect.product, amount: prospect.potential,
          rate: rates.savings, maturity: isDeposito ? rnd(90, 365) : 0, daysLeft: isDeposito ? rnd(60, 300) : 0,
        };
        setSavingsPortfolio((p) => p.concat([ns]));
        setGame((g) => ({ ...g, deposits: g.deposits + prospect.potential }));
        addNotif("🎉 " + prospect.name + " dikonversi! Dana " + fmt(prospect.potential) + " masuk.", "success");
      }
      setProspects((p) => p.filter((x) => x.id !== pid));
    } else {
      addNotif("❌ " + prospect.name + " belum tertarik. Coba approach lagi.", "warning");
      setProspects((prev) => prev.map((p) => (p.id === pid ? { ...p, interest: clamp(p.interest - 5, 10, 99) } : p)));
    }
  }, [addNotif]);

  const handleDismissProspect = useCallback((pid: number) => {
    const { setProspects } = useGameStore.getState();
    setProspects((prev) => prev.filter((x) => x.id !== pid));
  }, []);

  const handleInvest = useCallback((instrumentId: string, amount: number) => {
    const { game } = useGameStore.getState();
    const { setGame, setInvestments } = useGameStore.getState();
    const opt = INVESTMENT_OPTIONS.find((o) => o.id === instrumentId);
    if (!opt) return;
    if (!amount || amount < opt.minAmount) { addNotif("❌ Minimal investasi " + fmt(opt.minAmount), "danger"); return; }
    if (game.cash < amount) { addNotif("❌ Kas tidak cukup!", "danger"); return; }
    setGame((g) => ({ ...g, cash: g.cash - amount }));
    setInvestments((inv) => inv.concat([{ id: String(Date.now()), instrument: instrumentId, amount, startDay: game.day }]));
    addNotif("📈 Investasi " + fmt(amount) + " ke " + opt.name + " berhasil!", "success");
  }, [addNotif]);

  const handleWithdrawInvest = useCallback((invId: string) => {
    const { investments, game } = useGameStore.getState();
    const { setGame, setInvestments } = useGameStore.getState();
    const inv = investments.find((i) => String(i.id) === invId);
    if (!inv) { addNotif("⚠️ Data investasi tidak ditemukan", "danger"); return; }
    const opt = INVESTMENT_OPTIONS.find((o) => o.id === inv.instrument);
    if (!opt) return;
    const daysHeld = game.day - inv.startDay;
    const earned = Math.floor((inv.amount * (opt.rateAnnual / 100) / 365) * daysHeld);
    const returned = inv.amount + earned;
    setGame((g) => ({ ...g, cash: g.cash + returned }));
    setInvestments((i) => i.filter((x) => String(x.id) !== invId));
    addNotif("💰 Investasi dicairkan: " + fmt(returned) + " (return " + fmt(earned) + ")", "success");
  }, [addNotif]);

  const handleTrain = useCallback((id: number) => {
    const { game } = useGameStore.getState();
    const { setGame, setStaff } = useGameStore.getState();
    if (game.cash < 2 * M) { addNotif("❌ Kas tidak cukup untuk training!", "danger"); return; }
    setGame((g) => ({ ...g, cash: g.cash - 2 * M }));
    setStaff((s) => s.map((x) => (x.id === id ? { ...x, skill: clamp(x.skill + 1, 1, 10), morale: clamp(x.morale + 10, 0, 100) } : x)));
    addNotif("📚 Training selesai! Skill +1, Moral +10", "success");
  }, [addNotif]);

  const handlePromote = useCallback((id: number) => {
    const { staff, game } = useGameStore.getState();
    const { setGame, setStaff } = useGameStore.getState();
    const s = staff.find((x) => x.id === id);
    if (!s) return;
    const path = PROMO_PATHS[s.role];
    if (!path) { addNotif("❌ Tidak ada jalur promosi dari role ini.", "danger"); return; }
    if (s.exp < path.expNeeded) { addNotif("❌ Exp kurang. Butuh " + path.expNeeded + " hari exp.", "danger"); return; }
    if (game.cash < path.cost) { addNotif("❌ Kas tidak cukup untuk promosi (" + fmt(path.cost) + ").", "danger"); return; }
    setGame((g) => ({ ...g, cash: g.cash - path.cost }));
    setStaff((prev) => prev.map((x) => {
      if (x.id !== id) return x;
      const newRole = path.to;
      const oldSalary = x.salary ?? STAFF_ROLES[x.role].salary;
      const newSalary = Math.round(oldSalary * (STAFF_ROLES[newRole].salary / STAFF_ROLES[x.role].salary));
      addNotif("🎉 " + x.name + " dipromosikan menjadi " + STAFF_ROLES[newRole].label + "!", "success");
      return { ...x, role: newRole, salary: newSalary, skill: clamp(x.skill + 1, 1, 10), morale: clamp(x.morale + 15, 0, 100), warningCount: 0 };
    }));
  }, [addNotif]);

  const handleRest = useCallback((id: number) => {
    const { game } = useGameStore.getState();
    const { setStaff } = useGameStore.getState();
    setStaff((s) => s.map((x) => {
      if (x.id !== id) return x;
      if (x.status === "aktif") {
        return { ...x, status: "istirahat", workload: 0, restDay: game.day };
      }
      return x;
    }));
  }, []);

  const handleFire = useCallback((id: number) => {
    const { staff } = useGameStore.getState();
    const { setStaff, setGame } = useGameStore.getState();
    const s = staff.find((x) => x.id === id);
    if (!s) return;
    if (staff.length <= 1) { addNotif("❌ Minimal 1 staf!", "danger"); return; }
    setStaff((prev) => prev.filter((x) => x.id !== id));
    addNotif("🚪 " + s.name + " di-PHK. Pesangon Rp10jt.", "warning");
    setGame((g) => ({ ...g, cash: g.cash - 10 * M }));
  }, [addNotif]);

  const handleFraud = useCallback((choice: "pecat" | "investigasi" | "tutup") => {
    const { fraudEvent } = useGameStore.getState();
    const { setFraudEvent, setStaff, setGame } = useGameStore.getState();
    if (!fraudEvent) return;
    const { suspect, amount, evidence } = fraudEvent;
    setFraudEvent(null);
    if (choice === "pecat") {
      const recovered = Math.floor(amount * (evidence / 3) * 0.6);
      setStaff((s) => s.filter((x) => x.id !== suspect.id));
      setGame((g) => ({ ...g, cash: g.cash - amount + recovered, reputation: clamp(g.reputation - 8, 0, 100) }));
      addNotif("🚪 " + suspect.name + " dipecat. Dana terselamatkan: " + fmt(recovered), "warning");
    } else if (choice === "investigasi") {
      const cost = 20 * M;
      if (evidence >= 2) {
        setStaff((s) => s.filter((x) => x.id !== suspect.id));
        setGame((g) => ({ ...g, cash: g.cash - cost, reputation: clamp(g.reputation + 5, 0, 100) }));
        addNotif("🔍 " + suspect.name + " terbukti bersalah & dipecat. Reputasi naik!", "success");
      } else {
        setStaff((s) => s.map((x) => ({ ...x, morale: clamp(x.morale - 10, 0, 100) })));
        setGame((g) => ({ ...g, cash: g.cash - cost - amount, reputation: clamp(g.reputation - 15, 0, 100) }));
        addNotif("🔍 " + suspect.name + " tidak terbukti! Moral tim turun.", "danger");
      }
    } else {
      if (Math.random() < 0.4) {
        setGame((g) => ({ ...g, cash: g.cash - amount - 50 * M, reputation: clamp(g.reputation - 30, 0, 100) }));
        addNotif("💥 Bocor ke media! Denda besar + reputasi terjun.", "danger");
      } else {
        setGame((g) => ({ ...g, cash: g.cash - amount }));
        addNotif("🤫 Kasus ditutupi. Kehilangan " + fmt(amount) + " diam-diam.", "warning");
      }
    }
  }, [addNotif]);

  const handleHire = useCallback((candidate: Staff, salary: number) => {
    const { game, staff } = useGameStore.getState();
    const { setGame, setStaff, setShowHire } = useGameStore.getState();
    const maxStaff = BRANCHES[game.branch]?.maxStaff ?? 5;
    if (staff.length >= maxStaff) {
      addNotif("❌ Kapasitas staf penuh (" + maxStaff + " maks untuk " + BRANCHES[game.branch].name + "). Upgrade cabang dulu!", "danger");
      return;
    }
    if (game.cash < 5 * M) { addNotif("❌ Kas tidak cukup!", "danger"); return; }
    const { expectedSalary, ...staffFields } = candidate as any;
    const ns: Staff = { ...staffFields, salary };
    setStaff((s) => s.concat([ns]));
    setGame((g) => ({ ...g, cash: g.cash - 5 * M }));
    addNotif("✅ " + ns.name + " bergabung sebagai " + STAFF_ROLES[ns.role].label + " dengan gaji " + fmt(salary) + "/hari! (" + (staff.length + 1) + "/" + maxStaff + ")", "success");
    setShowHire(false);
  }, [addNotif]);

  const handleExpand = useCallback((cityId: string) => {
    const { game, branches } = useGameStore.getState();
    const { setGame, setBranches } = useGameStore.getState();
    const city = CITIES.find((c) => c.id === cityId);
    if (!city) return;
    if (game.branch < 2) { addNotif("❌ Perlu Kantor Pusat untuk ekspansi kota baru!", "danger"); return; }
    if (game.cash < city.cost) { addNotif("❌ Kas tidak cukup untuk buka cabang di " + city.name + "!", "danger"); return; }
    if (branches.find((b) => b.cityId === cityId)) { addNotif("❌ Cabang " + city.name + " sudah ada!", "danger"); return; }
    setGame((g) => ({ ...g, cash: g.cash - city.cost }));
    setBranches((b) => b.concat([{
      cityId, openDay: game.day, activeDay: game.day + BRANCH_CONSTRUCTION_DAYS,
      status: "building", deposits: 0, loans: 0,
    }]));
    addNotif("🏗️ Pembangunan cabang " + city.name + " dimulai! Akan aktif dalam " + BRANCH_CONSTRUCTION_DAYS + " hari.", "info");
  }, [addNotif]);

  const handleAcquire = useCallback((targetId: string) => {
    const { game, acquired } = useGameStore.getState();
    const { setGame, setStaff, setAcquired, setLoanPortfolio } = useGameStore.getState();
    const target = ACQUISITION_TARGETS.find((t) => t.id === targetId);
    if (!target) return;
    if (game.cash < target.price) { addNotif("❌ Kas tidak cukup untuk akuisisi!", "danger"); return; }
    if (acquired.indexOf(targetId) >= 0) { addNotif("❌ Sudah diakuisisi!", "danger"); return; }
    setGame((g) => ({
      ...g,
      cash: g.cash - target.price,
      deposits: g.deposits + target.deposits,
      loans: g.loans + target.loans,
      npl: clamp((g.npl * g.loans + target.npl * target.loans) / (g.loans + target.loans), 0.5, 15),
      reputation: clamp(g.reputation + 10, 0, 100),
    }));
    const newStaffs = Array(target.staff).fill(null).map(() => genStaff(pick(["teller", "cs", "analis"] as const)));
    setStaff((s) => s.concat(newStaffs));
    setAcquired((a) => a.concat([targetId]));
    addNotif("🤝 " + target.name + " berhasil diakuisisi! Deposito +" + fmt(target.deposits) + ", " + target.staff + " staf baru.", "success");
    setLoanPortfolio((lp) => {
      const newLoans = Array(Math.ceil(target.staff)).fill(null).map((_, i) => ({
        id: Date.now() + i,
        debtor: "Nasabah " + target.name + " #" + (i + 1),
        type: "Pinjaman Usaha",
        amount: target.loans / Math.ceil(target.staff),
        rate: 10 + Math.random() * 4,
        tenor: rnd(12, 48),
        paidMonths: rnd(1, 12),
        risk: (target.npl > 5 ? "high" : "medium") as "low" | "medium" | "high",
        status: (target.npl > 6 ? "perhatian" : "lancar") as "lancar" | "perhatian" | "macet",
        collateral: null,
        collateralValue: 0,
      }));
      return lp.concat(newLoans);
    });
  }, [addNotif]);

  const handleStressTest = useCallback((scenarioId: string) => {
    const { game } = useGameStore.getState();
    const { setStressResult } = useGameStore.getState();
    const sc = STRESS_SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return;
    const simNpl = clamp(game.npl + sc.nplShock, 0.5, 20);
    const simDep = game.deposits * (1 + sc.depShock);
    const simCash = game.cash * (1 + sc.cashShock);
    const simCar = clamp(game.car + sc.carShock, 0, 30);
    const survives = simCash > 0 && simNpl < 10 && simCar >= 8;
    setStressResult({
      scenario: sc, simNpl, simDep, simCash, simCar, survives,
      ldrSim: simDep > 0 ? Math.round((game.loans / simDep) * 100) : 999,
    });
  }, []);

  const handleToggleLps = useCallback(() => {
    const { lpsEnabled, game } = useGameStore.getState();
    const { setLpsEnabled, setGame } = useGameStore.getState();
    const newState = !lpsEnabled;
    setLpsEnabled(newState);
    addNotif(
      newState
        ? "🛡️ LPS diaktifkan — nasabah lebih percaya, deposito +5%. Premi " + fmt(Math.floor(game.deposits * LPS_PREMIUM_RATE / 365)) + "/hari."
        : "⚠️ LPS dinonaktifkan — tidak ada jaminan simpanan.",
      newState ? "success" : "warning"
    );
    if (newState) setGame((g) => ({ ...g, deposits: g.deposits * 1.05, reputation: clamp(g.reputation + 5, 0, 100) }));
  }, [addNotif]);

  const handleBmpkCheck = useCallback(() => {
    const { game, loanPortfolio, bmpkLog } = useGameStore.getState();
    const { setBmpkLog } = useGameStore.getState();
    const capital = game.cash * (game.car / 100);
    const bmpkLimit = capital * 0.2;
    const violations = loanPortfolio.filter((l) => l.amount > bmpkLimit);
    if (violations.length === 0) {
      addNotif("✅ Semua kredit dalam batas BMPK (maks " + fmt(bmpkLimit) + " per debitur).", "success");
      setBmpkLog((log) => [{ day: game.day, status: "aman", violations: 0 }].concat(log).slice(0, 10));
    } else {
      addNotif("🚨 " + violations.length + " kredit melanggar BMPK! Batas: " + fmt(bmpkLimit), "danger");
      setBmpkLog((log) => [{ day: game.day, status: "pelanggaran", violations: violations.length }].concat(log).slice(0, 10));
    }
  }, [addNotif]);

  const handleUnlockProduct = useCallback((productId: string) => {
    const { game, activeProducts, pendingProducts } = useGameStore.getState();
    const { setGame, setPendingProducts } = useGameStore.getState();
    const prod = ALL_PRODUCTS.find((p) => p.id === productId);
    if (!prod || prod.fee === 0) return;
    if (activeProducts.indexOf(productId) >= 0 || pendingProducts.find((pp) => pp.id === productId)) return;
    if (game.cash < prod.fee) { addNotif("❌ Kas tidak cukup untuk unlock produk!", "danger"); return; }
    if (game.branch < prod.unlockBranch) { addNotif("❌ Perlu upgrade cabang lebih dulu!", "danger"); return; }
    if (game.day < prod.unlockDay) { addNotif("❌ Belum tersedia. Perlu hari ke-" + prod.unlockDay + ".", "danger"); return; }
    setGame((g) => ({ ...g, cash: g.cash - prod.fee }));
    setPendingProducts((pp) => pp.concat([{ id: productId, readyDay: game.day + PRODUCT_INSTALL_DAYS }]));
    addNotif("🛠️ Produk " + prod.name + " sedang dipersiapkan, aktif dalam " + PRODUCT_INSTALL_DAYS + " hari.", "info");
  }, [addNotif]);

  const handleUpgradeBranch = useCallback(() => {
    const { game } = useGameStore.getState();
    const { setGame } = useGameStore.getState();
    const next = game.branch + 1;
    if (next >= BRANCHES.length) return;
    const cost = BRANCHES[next].cost;
    if (game.cash < cost) { addNotif("❌ Kas tidak cukup!", "danger"); return; }
    setGame((g) => ({ ...g, branch: next, cash: g.cash - cost, reputation: clamp(g.reputation + BRANCHES[next].repBonus, 0, 100) }));
    addNotif("🎉 Upgrade ke " + BRANCHES[next].name + " berhasil!", "success");
  }, [addNotif]);

  return {
    handleCustomer, handleNegotiationAccept, handleNegotiationReject, handleNegotiationCounter,
    handleSendOffer, handleAcceptRequest, handleRejectRequest, handleSeizeCollateral,
    handleTrain, handlePromote, handleRest, handleFire, handleFraud, handleHire,
    handleApproach, handleConvert, handleDismissProspect,
    handleInvest, handleWithdrawInvest,
    handleUpgradeBranch, handleExpand, handleAcquire,
    handleStressTest, handleToggleLps, handleBmpkCheck, handleUnlockProduct,
  };
}

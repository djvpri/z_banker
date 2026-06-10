// src/hooks/useAdvanceDay.ts
// Logika utama progres hari — dipindahkan dari advanceDay di artifact
// bank-manager-simulator.jsx (~line 982-1466). Ini adalah jantung game loop:
// update staf, kredit, deposito, kompetitor, nasabah baru, event acak, prospek, analitik.
"use client";
import { useCallback, useRef } from "react";
import { useGameStore, genStaff } from "@/store/gameStore";
import { teamStats } from "@/lib/teamStats";
import { clamp, rnd, pick, fmt, M, B } from "@/lib/gameFormat";
import {
  STAFF_ROLES, BRANCHES, ALL_PRODUCTS, EVENTS, ACHIEVEMENTS,
  INVESTMENT_OPTIONS, LPS_PREMIUM_RATE, LPS_MAX_COVERAGE, CITIES,
} from "@/lib/gameConstants";
import { genProspect, genLoanCustomer, genCompetitor } from "@/lib/gameGenerators";
import { applyEvent } from "@/lib/applyEvent";
import { checkAchievement } from "@/lib/achievementChecks";
import { GameState, ReviewResult, WeeklyReport, PredictiveWarning, EventLogEntry, StaffRole, LoanStatus } from "@/types/game";

export function useAdvanceDay() {
  const addNotif = useGameStore((s) => s.addNotif);
  const weeklySnapshotRef = useRef({ totalProfit: 0, npl: 2.1, reputation: 60, deposits: 200 * M });

  const advanceDay = useCallback(() => {
    const {
      game, staff, customers, rates, activeProducts, investments, branches, lpsEnabled,
      loanPortfolio, savingsPortfolio, earlyRepayRequests, earlyRepayOffers,
    } = useGameStore.getState();
    const {
      setStaff, setLoanPortfolio, setCreditPipeline, setSavingsPortfolio, setGame,
      setProfitHistory, setWeeklyReports, setShowWeeklyReport, setAchievements,
      setPredictiveWarnings, setReviewModal, setCompetitors, setCustomers,
      setEventLog, setActiveEvent, setFraudEvent, setProspects, setAnalyticsData,
      setEarlyRepayRequests, setEarlyRepayOffers, setBranches, setActiveProducts, setPendingProducts,
    } = useGameStore.getState();

    const currentDay = game.day;
    let localStaff = staff.slice();
    const ts = teamStats(localStaff);
    const { hasMgr, mgrSkill } = ts;

    // Effect 2: Manager redistributes workload daily (-5..-10 for all active staff)
    const mgrWorkloadRelief = hasMgr ? Math.round(5 + mgrSkill * 0.5) : 0;
    // Effect 3: Manager raises auto-rest threshold 90% -> 95%
    const autoRestThreshold = hasMgr ? 95 : 90;

    // Role-based load: teller handles deposits, analis handles loans, CS handles all
    const depositCusts = customers.filter((c) => ["Deposito","Buka Rekening","Deposito Korporat"].indexOf(c.type) >= 0).length;
    const loanCusts = customers.filter((c) => ["Pinjaman KPR","Pinjaman Usaha","Pinjaman KTA"].indexOf(c.type) >= 0).length;
    const activeTellers = localStaff.filter((s) => s.role === "teller" && s.status === "aktif").length || 1;
    const activeAnalysts = localStaff.filter((s) => s.role === "analis" && s.status === "aktif").length || 1;
    const activeCS = localStaff.filter((s) => s.role === "cs" && s.status === "aktif").length || 1;
    const activeOthers = localStaff.filter((s) => !["teller","analis","cs"].includes(s.role) && s.status === "aktif").length || 1;

    const loadForRole = (role: string) => {
      if (role === "teller")
        return depositCusts === 0
          ? rnd(0, 2)
          : Math.min(70, Math.round((depositCusts / activeTellers) * 12 + rnd(1, 5)));
      if (role === "analis")
        return loanCusts === 0
          ? rnd(0, 2)
          : Math.min(70, Math.round((loanCusts / activeAnalysts) * 15 + rnd(1, 5)));
      if (role === "cs")
        return customers.length === 0
          ? rnd(0, 2)
          : Math.min(70, Math.round((customers.length / activeCS) * 8 + rnd(1, 5)));
      return rnd(0, 2);
    };

    localStaff = localStaff.map((s) => {
      if (s.status === "istirahat") {
        // Effect 4: Manager speeds up recovery
        const wlRecovery = hasMgr ? 50 : 40;
        const morRecover = hasMgr ? 20 : 15;
        addNotif(s.name + " kembali aktif!" + (hasMgr ? " (recovery dipercepat manajer)" : ""), "info");
        return { ...s, workload: clamp(s.workload - wlRecovery, 0, 100), morale: clamp(s.morale + morRecover, 0, 100), exp: s.exp + 1, daysWorked: s.daysWorked + 1, status: "aktif" as const, restDay: -1 };
      }

      const roleLoad = loadForRole(s.role);
      // Slight recovery bias: avg rnd(-5,3) = -1 so idle staff gradually cool down
      const newWl = clamp(s.workload + roleLoad + rnd(-5, 3) - mgrWorkloadRelief, 0, 100);
      const md = newWl > 80 ? -rnd(3, 8) : newWl < 50 ? rnd(1, 4) : rnd(-1, 2);
      const newMorale = clamp(s.morale + md, 0, 100);

      if (newWl >= autoRestThreshold && s.status === "aktif") {
        addNotif("😩 " + s.name + " kelelahan (beban " + newWl + "%) — otomatis istirahat besok!" + (hasMgr ? " (manajer sudah coba tahan)" : ""), "warning");
        const newSkill2 = s.exp > 0 && s.exp % 30 === 0 && s.skill < 10 ? s.skill + 1 : s.skill;
        return { ...s, workload: newWl, morale: newMorale, status: "istirahat" as const, restDay: currentDay, exp: s.exp + 1, daysWorked: s.daysWorked + 1, skill: newSkill2 };
      }

      const newStatus = newWl >= 100 && newMorale < 25 ? ("burnout" as const) : s.status;
      const newSkill = s.exp > 0 && s.exp % 30 === 0 && s.skill < 10 ? s.skill + 1 : s.skill;
      return { ...s, workload: newWl, morale: newMorale, status: newStatus, exp: s.exp + 1, daysWorked: s.daysWorked + 1, skill: newSkill };
    });

    // ── Performance review every 30 days ────────────────────────────────────
    if (currentDay > 0 && currentDay % 30 === 0) {
      const reviewResults: ReviewResult[] = localStaff.map((s) => {
        const perf = Math.round((s.skill * 0.4 + s.speed * 0.3 + (s.morale / 10) * 0.3) * 10);
        const verdict: ReviewResult["verdict"] = perf >= 70 ? "baik" : perf >= 45 ? "cukup" : "buruk";
        const newWarnings = verdict === "buruk" ? s.warningCount + 1 : Math.max(0, s.warningCount - 1);
        return { id: s.id, name: s.name, role: s.role, perf, verdict, warnings: newWarnings };
      });
      setReviewModal({ results: reviewResults, day: currentDay });

      localStaff = localStaff
        .map((s) => {
          const res = reviewResults.find((r) => r.id === s.id);
          if (!res) return s;
          if (res.warnings >= 3) {
            addNotif("🚪 " + s.name + " dipecat karena 3x performa buruk!", "danger");
            return null;
          }
          if (res.verdict === "baik") {
            return { ...s, warningCount: res.warnings, morale: clamp(s.morale + 10, 0, 100), loyalty: clamp(s.loyalty + 1, 1, 10), lastReviewDay: currentDay };
          }
          return { ...s, warningCount: res.warnings, morale: res.verdict === "buruk" ? clamp(s.morale - 15, 0, 100) : s.morale, lastReviewDay: currentDay };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);
    }

    localStaff = localStaff.filter((s) => {
      // Effect 5: Manager raises effective loyalty by +2 -> lower resign chance
      const effectiveLoyalty = hasMgr ? Math.min(10, s.loyalty + 2) : s.loyalty;
      const resignChance = (10 - effectiveLoyalty) * 0.02 + (s.morale < 30 ? 0.15 : 0);
      if (Math.random() < resignChance) {
        addNotif("👋 " + s.name + " (" + STAFF_ROLES[s.role].label + ") mengundurkan diri!", "danger");
        return false;
      }
      return true;
    });

    setStaff(() => localStaff);

    // ── Resolve bank offers (sent yesterday) ───────────────────────────────
    const currentLoanPortfolio = useGameStore.getState().loanPortfolio;
    const resolvedOfferIds: number[] = [];
    earlyRepayOffers.forEach((offer) => {
      if (offer.sentDay >= game.day) return; // sent today, resolve tomorrow
      const loan = currentLoanPortfolio.find((l) => l.id === offer.loanId);
      if (!loan) { resolvedOfferIds.push(offer.loanId); return; }
      const baseRate = 0.30;
      const repBonus = game.reputation >= 70 ? 0.15 : game.reputation >= 50 ? 0.08 : 0;
      const riskBonus = loan.risk === "high" ? 0.20 : loan.risk === "medium" ? 0.10 : 0;
      const macetBonus = loan.status === "macet" ? 0.15 : loan.status === "perhatian" ? 0.08 : 0;
      const successRate = baseRate + repBonus + riskBonus + macetBonus;
      const accepted = Math.random() < successRate;
      if (accepted) {
        const remainingMonths = loan.tenor - loan.paidMonths;
        const remainingPrincipal = Math.floor(loan.amount * (remainingMonths / loan.tenor));
        const monthlyRate = loan.rate / 100 / 12;
        const lostInterest = Math.floor(remainingPrincipal * monthlyRate * remainingMonths);
        const penaltyRate = remainingMonths / loan.tenor > 0.5 ? 0.03 : 0.015;
        const penalty = Math.floor(remainingPrincipal * penaltyRate);
        const cashReceived = remainingPrincipal + penalty;
        const netLoss = lostInterest - penalty;
        setLoanPortfolio((lp) => lp.filter((l) => l.id !== loan.id));
        setGame((g) => ({ ...g, cash: g.cash + cashReceived, loans: Math.max(0, g.loans - remainingPrincipal) }));
        addNotif(
          "💰 " + loan.debtor + " setuju lunasi awal! Kas +" + fmt(cashReceived) +
          (netLoss > 0 ? " | ⚠️ Bunga hilang -" + fmt(netLoss) : " | ✅ Penalti > bunga hilang"),
          netLoss > penalty ? "warning" : "success"
        );
      } else {
        addNotif("❌ " + loan.debtor + " menolak penawaran pelunasan awal.", "danger");
      }
      resolvedOfferIds.push(offer.loanId);
    });
    if (resolvedOfferIds.length > 0) {
      setEarlyRepayOffers((o) => o.filter((x) => !resolvedOfferIds.includes(x.loanId)));
    }

    // ── Generate debtor-initiated early repay requests ──────────────────────
    const existingRequestIds = new Set(earlyRepayRequests.map((r) => r.loanId));
    const existingOfferIds = new Set(earlyRepayOffers.map((o) => o.loanId));
    const freshLoanPortfolio = useGameStore.getState().loanPortfolio;
    const newRequests: typeof earlyRepayRequests = [];
    freshLoanPortfolio.forEach((loan) => {
      if (existingRequestIds.has(loan.id) || existingOfferIds.has(loan.id)) return;
      const chanceMap: Record<string, number> = { macet: 0.12, perhatian: 0.06, lancar: 0.015 };
      const chance = chanceMap[loan.status] ?? 0;
      if (Math.random() < chance) {
        newRequests.push({ loanId: loan.id, debtorName: loan.debtor, loanType: loan.type, day: game.day });
        addNotif("📩 " + loan.debtor + " ingin melunasi kredit lebih awal!", "info");
      }
    });
    if (newRequests.length > 0) {
      setEarlyRepayRequests((r) => r.concat(newRequests));
    }

    // ── Loan Lifecycle: advance paidMonths, check macet/lunas ───────────────
    setLoanPortfolio((lp) =>
      lp
        .map((loan) => {
          if (loan.status === "lunas") return loan;
          const newPaid = loan.paidMonths + 1;
          const hasCollateral = !!loan.collateral && loan.collateralValue > 0;
          const collateralMod = hasCollateral ? 0.5 : 1.0;
          // defaultRisk berkurang 50% jika ada kolateral
          const baseDefault = loan.risk === "high" ? 0.05 : loan.risk === "medium" ? 0.02 : 0.006;
          const defaultRisk = baseDefault * collateralMod;
          const goesDefault   = loan.status === "lancar"    && Math.random() < defaultRisk;
          const worsens       = loan.status === "perhatian" && Math.random() < 0.15 * collateralMod;
          const recovers      = loan.status === "perhatian" && !worsens && Math.random() < 0.12;
          const macetRecovers = loan.status === "macet"     && Math.random() < (hasCollateral ? 0.06 : 0.02);
          const newStatus: LoanStatus = newPaid >= loan.tenor ? "lunas"
            : goesDefault   ? "perhatian"
            : worsens       ? "macet"
            : recovers      ? "lancar"
            : macetRecovers ? "perhatian"
            : loan.status;
          if (newStatus === "lunas") addNotif("✅ Kredit " + loan.debtor + " telah lunas!", "success");
          if (goesDefault) addNotif("⚠️ " + loan.debtor + " mulai bermasalah — kredit masuk perhatian.", "warning");
          if (worsens) addNotif("🔴 " + loan.debtor + " gagal bayar! Kredit macet." + (hasCollateral ? " (kolateral siap disita)" : ""), "danger");
          if (macetRecovers) addNotif("📈 " + loan.debtor + " mulai bayar kembali — dari macet ke perhatian.", "info");
          return { ...loan, paidMonths: newPaid, status: newStatus };
        })
        .filter((loan) => {
          if (loan.status === "lunas") {
            setGame((g) => ({ ...g, loans: Math.max(0, g.loans - loan.amount) }));
            return false;
          }
          return true;
        })
    );

    // ── Credit Pipeline: advance processing days ────────────────────────────
    setCreditPipeline((pipeline) => {
      const readyToDisburse: typeof pipeline = [];
      const stillProcessing = pipeline
        .map((p) => {
          const daysLeft = p.processDays - (currentDay - p.startDay);
          if (daysLeft <= 0) {
            readyToDisburse.push(p);
            return null;
          }
          return { ...p, daysLeft };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      readyToDisburse.forEach((p) => {
        const c = p.customer;
        setGame((g) => ({
          ...g,
          loans: g.loans + c.amount,
          cash: g.cash + c.amount,
        }));
        setLoanPortfolio((lp) => lp.concat([{
          id: Date.now() + Math.random(),
          debtor: c.name, type: c.type, amount: c.amount,
          rate: p.agreedRate, tenor: rnd(12, 60), paidMonths: 0,
          risk: c.score >= 650 ? "low" : c.score >= 550 ? "medium" : "high",
          status: "lancar",
          collateral: c.collateral || null,
          collateralValue: c.collateralValue || 0,
        }]));
        addNotif("💸 Kredit " + c.name + " cair " + fmt(c.amount) + " @ " + p.agreedRate + "%!", "success");
      });

      return stillProcessing;
    });

    // ── Savings maturity countdown ───────────────────────────────────────────
    setSavingsPortfolio((sp) =>
      sp.map((sav) => {
        if (sav.maturity === 0 || sav.daysLeft <= 0) return sav;
        const newDaysLeft = sav.daysLeft - 1;
        if (newDaysLeft === 0) addNotif("⏰ Deposito " + sav.holder + " jatuh tempo hari ini!", "warning");
        return { ...sav, daysLeft: newDaysLeft };
      })
    );

    // ── Main daily financial tick ────────────────────────────────────────────
    setGame((prev) => {
      if (prev.gameOver || prev.gameWon) return prev;
      const totalSalary = localStaff.reduce((a, s) => a + (s.salary ?? STAFF_ROLES[s.role].salary), 0);

      // Service passive income (ATM, Mobile Banking, Safe Deposit Box, dst)
      const serviceIncome = activeProducts.reduce((sum, pid) => {
        const prod = ALL_PRODUCTS.find((p) => p.id === pid);
        if (!prod || !prod.passiveIncome) return sum;
        const maint = prod.maintenanceCost || 0;
        return sum + prod.passiveIncome - maint;
      }, 0);

      // Payroll service: inject deposit every 30 days
      let payrollDeposit = 0;
      if (activeProducts.indexOf("payroll_service") >= 0 && prev.day > 0 && prev.day % 30 === 0) {
        const payProd = ALL_PRODUCTS.find((p) => p.id === "payroll_service");
        payrollDeposit = payProd ? payProd.payrollDeposit : 0;
        if (payrollDeposit > 0) addNotif("💼 Payroll Service: deposito Rp50jt dari klien korporat masuk!", "success");
      }

      const investIncome = investments.reduce((sum, inv) => {
        const opt = INVESTMENT_OPTIONS.find((o) => o.id === inv.instrument);
        if (!opt) return sum;
        let dailyReturn = Math.floor(inv.amount * (opt.rateAnnual / 100) / 365);
        if (opt.risk === "high") dailyReturn = Math.floor(dailyReturn * (0.5 + Math.random()));
        if (opt.risk === "medium") dailyReturn = Math.floor(dailyReturn * (0.8 + Math.random() * 0.4));
        return sum + dailyReturn;
      }, 0);

      // Active products NIM/dep bonus
      const productNimBonus = activeProducts.reduce((sum, pid) => {
        const prod = ALL_PRODUCTS.find((p) => p.id === pid);
        return prod ? sum + prod.nimBonus : sum;
      }, 0);

      const inc = (prev.loans * ((rates.loan + productNimBonus) / 100)) / 365;
      const exp = (prev.deposits * (rates.savings / 100)) / 365;
      const activeStaff = localStaff.filter((s) => s.status === "aktif");
      const avgPerf = activeStaff.length ? activeStaff.reduce((a, s) => a + s.skill, 0) / activeStaff.length : 5;
      const perfBonus = (avgPerf - 5) * 0.02;
      // LPS premium (0.2%/year of insured deposits)
      const lpsPremium = lpsEnabled ? Math.floor(Math.min(prev.deposits, LPS_MAX_COVERAGE * 100) * LPS_PREMIUM_RATE / 365) : 0;

      // Branch passive income (only branches that have finished construction generate income)
      const branchIncome = branches.filter((b) => b.status === "aktif").reduce((s, b) => s + Math.floor(b.deposits * (rates.loan / 100) / 365 * 0.3), 0);

      const dailyProfit = Math.floor((inc * (1 + perfBonus)) - exp - totalSalary + investIncome + serviceIncome + branchIncome - lpsPremium);
      const newCash = prev.cash + dailyProfit;
      const newDeposits = prev.deposits + payrollDeposit;

      // NPL derived from actual portfolio: macet 100% + perhatian 50%
      const currentLP = useGameStore.getState().loanPortfolio;
      const macetAmt = currentLP.filter((l) => l.status === "macet").reduce((s, l) => s + l.amount, 0);
      const perhatianAmt = currentLP.filter((l) => l.status === "perhatian").reduce((s, l) => s + l.amount, 0);
      const totalLoanAmt = Math.max(currentLP.reduce((s, l) => s + l.amount, 0), 1);
      const portfolioNpl = currentLP.length > 0
        ? (macetAmt + perhatianAmt * 0.5) / totalLoanAmt * 100
        : 0;
      // Trend toward portfolio NPL ±small noise, team modifier helps reduce it
      const target = Math.max(0.5, portfolioNpl);
      // Recovery (turun) lebih cepat dari kenaikan supaya semua-lancar terasa responsif
      const driftRate = target < prev.npl ? 0.65 : 0.35;
      const rawDrift = (target - prev.npl) * driftRate;
      // Cap perubahan harian — portofolio kecil bisa membuat target melompat drastis
      // (1 kredit macet = lonjakan besar % portofolio); batasi agar NPL naik/turun bertahap
      const maxStep = target < prev.npl ? 2.5 : 1.5;
      const drift = clamp(rawDrift, -maxStep, maxStep);
      const newNpl = clamp(prev.npl + drift + (Math.random() - 0.5) * 0.1 - ts.nplMod * 0.05, 0.5, 15);
      const newRep = clamp(prev.reputation + (Math.random() > 0.5 ? 1 : -1) + (ts.repMod > 0 ? 1 : 0), 0, 100);
      const newLdr = prev.deposits > 0 ? Math.round((prev.loans / prev.deposits) * 100) : 0;
      const newNim = Math.max(0, rates.loan + productNimBonus - rates.savings - 1.5);
      const newCar = clamp(prev.car + (Math.random() - 0.5) * 0.6, 8, 30);
      const newTP = prev.totalProfit + dailyProfit;
      const gameOver = newCash <= 0 || newNpl > 10 || newCar < 8 || localStaff.length === 0;
      const gameWon = newTP >= 10 * B;
      setProfitHistory((h) => h.concat([{ day: prev.day, profit: Math.floor(dailyProfit / M) }]).slice(-30));
      addNotif("📅 Hari " + prev.day + " selesai · Profit " + fmt(dailyProfit), "info");

      const nextState: GameState = {
        ...prev,
        day: prev.day + 1, cash: newCash, deposits: newDeposits, profit: dailyProfit,
        totalProfit: newTP, npl: parseFloat(newNpl.toFixed(1)), reputation: newRep, ldr: newLdr,
        nim: parseFloat(newNim.toFixed(1)), car: parseFloat(newCar.toFixed(1)), gameOver, gameWon,
        level: Math.floor(Math.max(0, newTP) / B) + 1,
      };

      // ── Weekly report every 7 days ─────────────────────────────────────────
      if (prev.day > 0 && prev.day % 7 === 0) {
        const snap = weeklySnapshotRef.current;
        const report: WeeklyReport = {
          week: Math.floor(prev.day / 7),
          day: prev.day,
          profit: newTP - snap.totalProfit,
          profitDaily: dailyProfit,
          npl: parseFloat(newNpl.toFixed(1)),
          nplDelta: parseFloat((newNpl - snap.npl).toFixed(1)),
          reputation: newRep,
          repDelta: newRep - snap.reputation,
          deposits: prev.deposits,
          depositsDelta: prev.deposits - snap.deposits,
          loans: prev.loans,
          car: parseFloat(newCar.toFixed(1)),
          staffCount: localStaff.length,
          rating: newNpl < 2 && newCar > 14 && newRep > 70 ? "Sehat" : newNpl < 5 && newCar > 12 ? "Cukup" : "Waspada",
        };
        weeklySnapshotRef.current = { totalProfit: newTP, npl: newNpl, reputation: newRep, deposits: prev.deposits };
        setWeeklyReports((wr) => [report].concat(wr).slice(0, 12));
        setShowWeeklyReport(report);
      }

      // ── Achievement check ──────────────────────────────────────────────────
      setAchievements((unlocked) => {
        const newUnlocks: string[] = [];
        ACHIEVEMENTS.forEach((ach) => {
          if (unlocked.indexOf(ach.id) >= 0) return;
          let earned = false;
          try { earned = checkAchievement(ach.id, nextState, localStaff, []); } catch { earned = false; }
          if (earned) {
            newUnlocks.push(ach.id);
            addNotif("🏅 Achievement unlocked: " + ach.icon + " " + ach.title + " — " + ach.reward + "!", "success");
            if (ach.id === "zero_npl") nextState.car = clamp(nextState.car + 1, 8, 30);
            if (ach.id === "bank_terpercaya") nextState.deposits = nextState.deposits * 1.1;
            if (ach.id === "miliarder") nextState.car = clamp(nextState.car + 2, 8, 30);
            if (ach.id === "aman_ojk") nextState.reputation = clamp(nextState.reputation + 12, 0, 100);
            if (ach.id === "kantor_pusat") nextState.reputation = clamp(nextState.reputation + 10, 0, 100);
          }
        });
        return newUnlocks.length > 0 ? unlocked.concat(newUnlocks) : unlocked;
      });

      // ── Predictive warnings ────────────────────────────────────────────────
      const warns: PredictiveWarning[] = [];
      if (newNpl >= 4) warns.push({ id: "npl_high", msg: "⚠️ NPL mendekati batas! (" + parseFloat(newNpl.toFixed(1)) + "%) — kurangi kredit berisiko.", type: "danger" });
      if (newCar <= 13) warns.push({ id: "car_low", msg: "⚠️ CAR hampir di batas minimum! (" + parseFloat(newCar.toFixed(1)) + "%) — jaga modal.", type: "danger" });
      if (newCash < 50 * M) warns.push({ id: "cash_low", msg: "⚠️ Kas kritis! (" + fmt(newCash) + ") — bank bisa kolaps.", type: "danger" });
      if (newRep <= 35) warns.push({ id: "rep_low", msg: "⚠️ Reputasi sangat rendah! Nasabah bisa kabur massal.", type: "warning" });
      setPredictiveWarnings(warns);

      return nextState;
    });

    // ── Branch construction completion ──────────────────────────────────────
    const advancingDay = currentDay + 1;
    setBranches((bs) => bs.map((b) => {
      if (b.status !== "building" || b.activeDay > advancingDay) return b;
      const city = CITIES.find((c) => c.id === b.cityId);
      const curDeposits = useGameStore.getState().game.deposits;
      const initDeposit = city ? Math.floor(curDeposits * city.depBonus * 0.1) : 0;
      setGame((g) => ({ ...g, deposits: g.deposits + initDeposit, reputation: clamp(g.reputation + 8, 0, 100) }));
      addNotif("🎉 Cabang " + (city ? city.name : b.cityId) + " resmi beroperasi! Ekspansi nasional berlanjut.", "success");
      return { ...b, status: "aktif", deposits: initDeposit };
    }));

    // ── Pending product activation ────────────────────────────────────────────
    setPendingProducts((pending) => pending.filter((pp) => {
      if (pp.readyDay > advancingDay) return true;
      const prod = ALL_PRODUCTS.find((p) => p.id === pp.id);
      setActiveProducts((ap) => ap.concat([pp.id]));
      addNotif("🎉 Produk " + (prod ? prod.name : pp.id) + " resmi aktif!", "success");
      return false;
    }));

    // ── Dynamic competitor simulation ───────────────────────────────────────
    setCompetitors((prev) => {
      const playerRep = useGameStore.getState().game.reputation;

      const survived = prev.map((b) => {
        const age = b.age + 1;

        let depGrowth: number;
        let repDelta: number;
        if (b.strategy === "agresif") {
          depGrowth = (Math.random() * 0.04 - 0.01) * b.deposits;
          repDelta = (Math.random() - 0.5) * 4;
        } else if (b.strategy === "ekspansif") {
          depGrowth = (Math.random() * 0.03) * b.deposits;
          repDelta = Math.random() * 2 - 0.5;
        } else if (b.strategy === "konservatif") {
          depGrowth = (Math.random() * 0.015 - 0.005) * b.deposits;
          repDelta = Math.random() * 1.5 - 0.3;
        } else {
          depGrowth = (Math.random() - 0.55) * 0.02 * b.deposits;
          repDelta = Math.random() * 1 - 0.5;
        }

        const stealFactor = b.reputation > playerRep ? 0.008 : 0;
        const stolen = stealFactor > 0 ? b.deposits * stealFactor : 0;

        const newDep = Math.max(30 * M, b.deposits + depGrowth + stolen);
        const newRep = clamp(b.reputation + repDelta, 15, 95);
        const exitWarning = age >= b.lifespan - 5;

        return { ...b, age, deposits: newDep, reputation: parseFloat(newRep.toFixed(1)), exitWarning };
      });

      const exited: typeof survived = [];
      const remaining = survived.filter((b) => {
        if (b.age >= b.lifespan) {
          exited.push(b);
          return false;
        }
        return true;
      });

      exited.forEach((b) => {
        addNotif("🚪 " + b.name + " keluar dari pasar! Nasabah mereka tersebar.", "warning");
      });

      const newEntrants: typeof survived = [];
      // Use currentDay+1 (deterministic) instead of getState() which can see stale state inside updater
      const advancedDay = currentDay + 1;
      const difficulty = game.difficulty;
      const spawnRate = difficulty === "hard" ? 0.35 : difficulty === "normal" ? 0.22 : 0.15;
      const maxCompetitors = difficulty === "hard" ? 6 : 5;
      const guaranteedDay = difficulty === "hard" ? 5 : 7;
      const guaranteedFirst = remaining.length === 0 && advancedDay >= guaranteedDay;
      const shouldEnter = exited.length > 0 || guaranteedFirst || (Math.random() < spawnRate && remaining.length < maxCompetitors);
      if (shouldEnter) {
        const nb = genCompetitor(advancedDay);
        newEntrants.push(nb);
        addNotif("🏦 " + nb.name + " baru masuk pasar! Strategi: " + nb.strategy + ".", "info");
      }

      return remaining.concat(newEntrants).slice(0, 5);
    });

    // ── New customers arrive ─────────────────────────────────────────────────
    {
      const { day: newDay, branch } = useGameStore.getState().game;
      const max = BRANCHES[branch].maxCustomers;
      const count = rnd(1, 3);
      const atmBonus = activeProducts.reduce((s, pid) => {
        const prod = ALL_PRODUCTS.find((p) => p.id === pid);
        return s + (prod && prod.custPerDay ? prod.custPerDay : 0);
      }, 0);
      const totalCount = Math.min(max, count + (Math.random() < 0.6 ? atmBonus : 0));
      setCustomers((c) => {
        const newCusts = Array(totalCount).fill(null).map(() => genLoanCustomer(newDay, branch));
        return newCusts.concat(c).slice(0, max);
      });
    }

    // ── Random event (28% chance) ────────────────────────────────────────────
    if (Math.random() < 0.28) {
      const ev = pick(EVENTS);
      const logEntry: EventLogEntry = { day: currentDay, title: ev.title, type: ev.type as EventLogEntry["type"] };
      setEventLog((el) => [logEntry].concat(el).slice(0, 50));

      if (ev.id === "resign" && localStaff.length > 1) {
        const victim = pick(localStaff);
        setStaff((s) => s.filter((x) => x.id !== victim.id));
        addNotif("👋 " + victim.name + " tidak tahan dan resign!", "danger");

      } else if (ev.id === "fraud" && localStaff.length > 0) {
        const suspect = pick(localStaff);
        setFraudEvent({ suspect, amount: rnd(15, 80) * M, evidence: rnd(1, 3) });

      } else if (ev.id === "training_gov") {
        setStaff((s) => s.map((x) => ({ ...x, skill: clamp(x.skill + 1, 1, 10) })));
        addNotif("🎓 Pelatihan BI selesai! Skill semua staf +1.", "success");
        setActiveEvent(ev);

      } else if (ev.id === "mogok") {
        setStaff((s) => s.map((x) => ({ ...x, morale: clamp(x.morale - 25, 0, 100) })));
        addNotif("✊ Staf mogok! Moral seluruh tim -25.", "danger");
        setActiveEvent(ev);

      } else if (ev.id === "rekrut_baru") {
        const freeStaff = genStaff(pick(["teller", "cs", "analis"]) as StaffRole);
        freeStaff.skill = clamp(freeStaff.skill + 2, 1, 10);
        setStaff((s) => s.concat([freeStaff]));
        addNotif("👤 " + freeStaff.name + " bergabung gratis sebagai " + STAFF_ROLES[freeStaff.role].label + "!", "success");
        setActiveEvent(ev);

      } else if (ev.id === "sakit_massal") {
        setStaff((s) => {
          const aktif = s.filter((x) => x.status === "aktif");
          const halfIds = aktif.slice(0, Math.ceil(aktif.length / 2)).map((x) => x.id);
          return s.map((x) => halfIds.indexOf(x.id) >= 0 ? { ...x, status: "istirahat" as const, workload: 0, restDay: currentDay } : x);
        });
        addNotif("🤒 Flu massal! Setengah staf terpaksa istirahat hari ini.", "danger");
        setActiveEvent(ev);

      } else if (ev.id === "kenaikan_gaji") {
        // Choice: pay bonus or lose morale — handled via activeEvent modal
        setActiveEvent(ev);

      } else if (ev.id === "beasiswa") {
        if (localStaff.length > 0) {
          const lucky = pick(localStaff);
          setStaff((s) => s.map((x) => x.id === lucky.id ? { ...x, skill: clamp(x.skill + 2, 1, 10) } : x));
          addNotif("📚 " + lucky.name + " dapat beasiswa! Skill +2.", "success");
          setActiveEvent(ev);
        }

      } else if (ev.id === "gedung_baru") {
        setGame((prevG) => ({ ...prevG, ...applyEvent(ev, prevG, localStaff) }));
        setStaff((s) => s.map((x) => ({ ...x, morale: clamp(x.morale + 10, 0, 100) })));
        addNotif("🏢 Gedung baru selesai! Reputasi naik, moral seluruh staf +10.", "success");
        setActiveEvent(ev);

      } else if (ev.id === "banjir") {
        setGame((prevG) => ({ ...prevG, ...applyEvent(ev, prevG, localStaff) }));
        setStaff((s) => s.map((x) => x.status === "aktif" ? { ...x, workload: clamp(x.workload + 15, 0, 100) } : x));
        addNotif("🌊 Banjir melanda kantor! Biaya perbaikan besar, staf WFH dan beban kerja meningkat.", "danger");
        setActiveEvent(ev);

      } else if (ev.id === "viral") {
        setGame((prevG) => ({ ...prevG, ...applyEvent(ev, prevG, localStaff) }));
        {
          const { branch: viralBranch, day: viralDay } = useGameStore.getState().game;
          const max = BRANCHES[viralBranch].maxCustomers;
          const extra = rnd(2, 4);
          setCustomers((c) => {
            const newCusts = Array(extra).fill(null).map(() => genLoanCustomer(viralDay, viralBranch));
            return newCusts.concat(c).slice(0, max);
          });
        }
        addNotif("🔥 Bank viral di medsos! Reputasi melonjak, antrian nasabah bertambah.", "success");
        setActiveEvent(ev);

      } else if (["resign", "fraud", "training_gov", "mogok", "rekrut_baru", "sakit_massal", "beasiswa", "gedung_baru", "banjir", "viral"].indexOf(ev.id) < 0) {
        setGame((prevG) => {
          const changes = applyEvent(ev, prevG, localStaff);
          return { ...prevG, ...changes };
        });
        setActiveEvent(ev);
      }
    }

    // ── Prospects aging + new arrivals ───────────────────────────────────────
    setProspects((prev) => {
      const aged = prev
        .map((p) => ({ ...p, daysLeft: p.daysLeft - 1, interest: clamp(p.interest + (Math.random() > 0.6 ? -3 : 1), 10, 99) }))
        .filter((p) => p.daysLeft > 0);
      const newOnes = Math.random() < 0.4 ? [genProspect()] : [];
      return newOnes.concat(aged).slice(0, 12);
    });

    // ── Analytics tracking ───────────────────────────────────────────────────
    setAnalyticsData((prev) => {
      const retailTypes = ["Pinjaman KTA", "KTA Multiguna", "Tabungan Reguler", "Deposito", "Deposito Reguler", "Buka Rekening"];
      const umkmTypes = ["Pinjaman Usaha", "Tabungan Bisnis", "Kredit Modal Kerja"];
      const korporatTypes = ["Deposito Korporat", "Pinjaman KPR", "KPR Premium", "Kredit Investasi"];

      const retail = loanPortfolio.filter((l) => retailTypes.some((t) => l.type.includes(t))).length
        + savingsPortfolio.filter((s) => retailTypes.some((t) => s.type.includes(t))).length;
      const umkm = loanPortfolio.filter((l) => umkmTypes.some((t) => l.type.includes(t))).length
        + savingsPortfolio.filter((s) => umkmTypes.some((t) => s.type.includes(t))).length;
      const korporat = loanPortfolio.filter((l) => korporatTypes.some((t) => l.type.includes(t))).length
        + savingsPortfolio.filter((s) => korporatTypes.some((t) => s.type.includes(t))).length;

      const newSeg = prev.segmentHistory.concat([{ day: currentDay, retail, umkm, korporat }]).slice(-30);

      const dayOfWeek = currentDay % 7;
      const hourBucket = Math.floor(Math.random() * 4);
      const freshCustomers = useGameStore.getState().customers.length;
      const activityCount = Math.max(freshCustomers, rnd(1, 4));
      const newHeat = prev.heatmap.map((row, d) => {
        if (d !== dayOfWeek) return row;
        return row.map((v, h) => h === hourBucket ? v + activityCount : v);
      });

      const nplHistory = newSeg.slice(-7).map((s) => s.retail + s.umkm * 1.5 + s.korporat * 0.5);
      const trend = nplHistory.length >= 2 ? (nplHistory[nplHistory.length - 1] - nplHistory[0]) / nplHistory.length * 0.02 : 0;

      const newProd = { ...prev.staffProductivity };
      const activeNow = localStaff.filter((s) => s.status === "aktif");
      activeNow.forEach((s) => {
        if (!newProd[s.id]) newProd[s.id] = { name: s.name, role: s.role, totalHandled: 0, avgWorkload: 0, days: 0 };
        newProd[s.id] = {
          ...newProd[s.id],
          totalHandled: newProd[s.id].totalHandled + Math.floor(customers.length / Math.max(1, activeNow.length)),
          avgWorkload: Math.round((newProd[s.id].avgWorkload * newProd[s.id].days + s.workload) / (newProd[s.id].days + 1)),
          days: newProd[s.id].days + 1,
        };
      });

      return {
        ...prev,
        segmentHistory: newSeg,
        heatmap: newHeat,
        nplForecast: prev.nplForecast.concat([{ day: currentDay, trend: parseFloat(trend.toFixed(3)) }]).slice(-30),
        staffProductivity: newProd,
      };
    });
  }, [addNotif]);

  return { advanceDay };
}

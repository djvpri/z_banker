// src/store/gameStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  GameState, Staff, Candidate, Customer, LoanPortfolioItem, SavingsPortfolioItem,
  Prospect, Investment, CityBranch, CreditPipelineItem, WeeklyReport,
  EventLogEntry, Competitor, AnalyticsData, Difficulty, DIFFICULTY_CONFIG,
  Notif, Negotiation, FraudEvent, GameEvent, ReviewModalData, PredictiveWarning,
  EarlyRepayRequest, EarlyRepayOffer, PendingProduct, QuarterlyKpiResult,
} from "@/types/game";
import { STAFF_ROLES, SCENARIOS } from "@/lib/gameConstants";

const M = 1_000_000;
const B = 1_000_000_000;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rnd = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const STAFF_NAMES_FIRST = ["Budi","Dewi","Hendra","Siti","Agus","Rina","Joko","Maya","Doni","Lestari","Fajar","Intan","Rudi","Citra","Bagas"];
export const STAFF_NAMES_LAST  = ["S.","R.","K.","N.","P.","W.","H.","L.","F.","A."];

// Start from Date.now() so IDs never collide across page reloads; each ++_staffSeq is a unique integer
let _staffSeq = Date.now();

export function genStaff(role: Staff["role"]): Staff {
  return {
    id: ++_staffSeq,
    name: pick(STAFF_NAMES_FIRST) + " " + pick(STAFF_NAMES_LAST),
    role, skill: rnd(3,9), speed: rnd(3,9), loyalty: rnd(4,10),
    workload: 0, morale: rnd(60,90), exp: 0,
    status: "aktif", daysWorked: 0, restDay: -1, warningCount: 0, lastReviewDay: 0,
  };
}

export function initialStaff(): Staff[] {
  return [genStaff("teller"), genStaff("cs"), genStaff("analis")];
}

// Kandidat dengan atribut lebih bagus minta gaji lebih tinggi (0.7x - 1.4x gaji dasar role)
export function genCandidate(role: Staff["role"]): Candidate {
  const staff = genStaff(role);
  const base = STAFF_ROLES[role].salary;
  const avgAttr = (staff.skill + staff.speed + staff.loyalty) / 3;
  const qualityFactor = 0.65 + clamp((avgAttr - 3) / 7, 0, 1) * 0.75;
  const expectedSalary = Math.round((base * qualityFactor) / 1000) * 1000;
  return { ...staff, salary: expectedSalary, expectedSalary };
}

export function genCandidatePool(role: Staff["role"], count = 3): Candidate[] {
  return Array.from({ length: count }, () => genCandidate(role));
}

function makeInitGame(difficulty: Difficulty, scenarioId: string = "normal"): GameState {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const sc = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const deposits = Math.round(200 * M * sc.depositMult);
  const loans = Math.round(150 * M * sc.loanMult);
  return {
    day: 1, cash: Math.round(cfg.startCash * sc.cashMult), deposits, loans,
    reputation: clamp(60 + sc.reputationDelta, 0, 100), npl: sc.npl, car: sc.car,
    ldr: Math.round((loans / deposits) * 100), nim: 3.2,
    profit: 0, totalProfit: 0, gameOver: false, gameWon: false,
    branch: 0, level: 1, difficulty,
    tutorialStep: 0, tutorialDone: false,
    bankName: "Bank Nusantara",
    econPhase: sc.econPhase, econPhaseUntil: rnd(20, 35),
    scenarioId: sc.id,
  };
}

interface GameStore {
  // Core state
  game: GameState;
  staff: Staff[];
  rates: { savings: number; loan: number };
  customers: Customer[];
  loanPortfolio: LoanPortfolioItem[];
  savingsPortfolio: SavingsPortfolioItem[];
  prospects: Prospect[];
  competitors: Competitor[];

  // Transient UI/notifications
  notifs: Notif[];
  negotiation: Negotiation | null;
  fraudEvent: FraudEvent | null;
  earlyRepayRequests: EarlyRepayRequest[];
  earlyRepayOffers: EarlyRepayOffer[];
  showHire: boolean;
  showWeeklyReport: WeeklyReport | null;
  showQuarterlyReport: QuarterlyKpiResult | null;
  activeEvent: GameEvent | null;
  reviewModal: ReviewModalData | null;
  predictiveWarnings: PredictiveWarning[];

  // Features
  investments: Investment[];
  activeProducts: string[];
  pendingProducts: PendingProduct[];
  creditPipeline: CreditPipelineItem[];
  branches: CityBranch[];
  acquired: string[];
  lpsEnabled: boolean;
  bmpkLog: Array<{ day: number; status: string; violations: number }>;
  stressResult: any | null;
  achievements: string[];

  // New Game+ progression (persists across resetGame)
  careerWins: number;

  // Reports & analytics
  profitHistory: Array<{ day: number; profit: number }>;
  weeklyReports: WeeklyReport[];
  quarterlyReports: QuarterlyKpiResult[];
  eventLog: EventLogEntry[];
  analyticsData: AnalyticsData;

  // UI state
  activeTab: string;
  darkMode: boolean;
  showTutorial: boolean;
  tutorialStep: number;
  isMuted: boolean;

  // Actions
  setGame: (updater: (g: GameState) => GameState) => void;
  setStaff: (updater: (s: Staff[]) => Staff[]) => void;
  setRates: (r: { savings: number; loan: number }) => void;
  setNotifs: (updater: (n: Notif[]) => Notif[]) => void;
  addNotif: (msg: string, type?: Notif["type"]) => void;
  setNegotiation: (n: Negotiation | null) => void;
  setFraudEvent: (fe: FraudEvent | null) => void;
  setEarlyRepayRequests: (updater: (r: EarlyRepayRequest[]) => EarlyRepayRequest[]) => void;
  setEarlyRepayOffers: (updater: (o: EarlyRepayOffer[]) => EarlyRepayOffer[]) => void;
  setShowHire: (v: boolean) => void;
  setShowWeeklyReport: (r: WeeklyReport | null) => void;
  setShowQuarterlyReport: (r: QuarterlyKpiResult | null) => void;
  setActiveEvent: (e: GameEvent | null) => void;
  setReviewModal: (r: ReviewModalData | null) => void;
  setPredictiveWarnings: (w: PredictiveWarning[]) => void;
  setCustomers: (updater: (c: Customer[]) => Customer[]) => void;
  setLoanPortfolio: (updater: (lp: LoanPortfolioItem[]) => LoanPortfolioItem[]) => void;
  setSavingsPortfolio: (updater: (sp: SavingsPortfolioItem[]) => SavingsPortfolioItem[]) => void;
  setProspects: (updater: (p: Prospect[]) => Prospect[]) => void;
  setCompetitors: (updater: (c: Competitor[]) => Competitor[]) => void;
  setInvestments: (updater: (i: Investment[]) => Investment[]) => void;
  setActiveProducts: (updater: (ap: string[]) => string[]) => void;
  setPendingProducts: (updater: (pp: PendingProduct[]) => PendingProduct[]) => void;
  setCreditPipeline: (updater: (cp: CreditPipelineItem[]) => CreditPipelineItem[]) => void;
  setBranches: (updater: (b: CityBranch[]) => CityBranch[]) => void;
  setAcquired: (updater: (a: string[]) => string[]) => void;
  setLpsEnabled: (v: boolean) => void;
  setBmpkLog: (updater: (l: any[]) => any[]) => void;
  setStressResult: (r: any) => void;
  setAchievements: (updater: (a: string[]) => string[]) => void;
  setProfitHistory: (updater: (h: any[]) => any[]) => void;
  setWeeklyReports: (updater: (wr: WeeklyReport[]) => WeeklyReport[]) => void;
  setQuarterlyReports: (updater: (qr: QuarterlyKpiResult[]) => QuarterlyKpiResult[]) => void;
  setCareerWins: (updater: (c: number) => number) => void;
  setEventLog: (updater: (el: EventLogEntry[]) => EventLogEntry[]) => void;
  setAnalyticsData: (updater: (a: AnalyticsData) => AnalyticsData) => void;
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
  setShowTutorial: (v: boolean) => void;
  setTutorialStep: (step: number) => void;
  toggleMute: () => void;
  resetGame: (difficulty: Difficulty, scenarioId?: string) => void;
  loadGame: (gs: Record<string, any>) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: makeInitGame("normal"),
      staff: initialStaff(),
      rates: { savings: 4.5, loan: 9.0 },
      notifs: [],
      negotiation: null,
      fraudEvent: null,
      earlyRepayRequests: [],
      earlyRepayOffers: [],
      showHire: false,
      showWeeklyReport: null,
      showQuarterlyReport: null,
      activeEvent: null,
      reviewModal: null,
      predictiveWarnings: [],
      customers: [],
      loanPortfolio: [],
      savingsPortfolio: [],
      prospects: [],
      competitors: [],
      investments: [],
      activeProducts: ["tabungan_reguler", "kpr"],
      pendingProducts: [],
      creditPipeline: [],
      branches: [],
      acquired: [],
      lpsEnabled: false,
      bmpkLog: [],
      stressResult: null,
      achievements: [],
      careerWins: 0,
      profitHistory: [{ day: 1, profit: 0 }],
      weeklyReports: [],
      quarterlyReports: [],
      eventLog: [],
      analyticsData: {
        segmentHistory: [], nplForecast: [],
        heatmap: Array(7).fill(null).map(() => Array(4).fill(0)),
        staffProductivity: {},
      },
      activeTab: "dashboard",
      darkMode: true,
      showTutorial: false,
      tutorialStep: 0,
      isMuted: false,

      setGame: (updater) => set((s) => ({ game: updater(s.game) })),
      setStaff: (updater) => set((s) => ({ staff: updater(s.staff) })),
      setRates: (r) => set({ rates: r }),
      setNotifs: (updater) => set((s) => ({ notifs: updater(s.notifs) })),
      addNotif: (msg, type = "info") => {
        const id = Date.now() + Math.random();
        set((s) => ({ notifs: [{ id, msg, type }, ...s.notifs].slice(0, 6) }));
        setTimeout(() => set((s) => ({ notifs: s.notifs.filter((n) => n.id !== id) })), 5000);
      },
      setNegotiation: (n) => set({ negotiation: n }),
      setFraudEvent: (fe) => set({ fraudEvent: fe }),
      setEarlyRepayRequests: (updater) => set((s) => ({ earlyRepayRequests: updater(s.earlyRepayRequests) })),
      setEarlyRepayOffers: (updater) => set((s) => ({ earlyRepayOffers: updater(s.earlyRepayOffers) })),
      setShowHire: (v) => set({ showHire: v }),
      setShowWeeklyReport: (r) => set({ showWeeklyReport: r }),
      setShowQuarterlyReport: (r) => set({ showQuarterlyReport: r }),
      setActiveEvent: (e) => set({ activeEvent: e }),
      setReviewModal: (r) => set({ reviewModal: r }),
      setPredictiveWarnings: (w) => set({ predictiveWarnings: w }),
      setCustomers: (updater) => set((s) => ({ customers: updater(s.customers) })),
      setLoanPortfolio: (updater) => set((s) => ({ loanPortfolio: updater(s.loanPortfolio) })),
      setSavingsPortfolio: (updater) => set((s) => ({ savingsPortfolio: updater(s.savingsPortfolio) })),
      setProspects: (updater) => set((s) => ({ prospects: updater(s.prospects) })),
      setCompetitors: (updater) => set((s) => ({ competitors: updater(s.competitors) })),
      setInvestments: (updater) => set((s) => ({ investments: updater(s.investments) })),
      setActiveProducts: (updater) => set((s) => ({ activeProducts: updater(s.activeProducts) })),
      setPendingProducts: (updater) => set((s) => ({ pendingProducts: updater(s.pendingProducts) })),
      setCreditPipeline: (updater) => set((s) => ({ creditPipeline: updater(s.creditPipeline) })),
      setBranches: (updater) => set((s) => ({ branches: updater(s.branches) })),
      setAcquired: (updater) => set((s) => ({ acquired: updater(s.acquired) })),
      setLpsEnabled: (v) => set({ lpsEnabled: v }),
      setBmpkLog: (updater) => set((s) => ({ bmpkLog: updater(s.bmpkLog) })),
      setStressResult: (r) => set({ stressResult: r }),
      setAchievements: (updater) => set((s) => ({ achievements: updater(s.achievements) })),
      setProfitHistory: (updater) => set((s) => ({ profitHistory: updater(s.profitHistory) })),
      setWeeklyReports: (updater) => set((s) => ({ weeklyReports: updater(s.weeklyReports) })),
      setQuarterlyReports: (updater) => set((s) => ({ quarterlyReports: updater(s.quarterlyReports) })),
      setCareerWins: (updater) => set((s) => ({ careerWins: updater(s.careerWins) })),
      setEventLog: (updater) => set((s) => ({ eventLog: updater(s.eventLog) })),
      setAnalyticsData: (updater) => set((s) => ({ analyticsData: updater(s.analyticsData) })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setShowTutorial: (v) => set({ showTutorial: v }),
      setTutorialStep: (step) => set({ tutorialStep: step }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      loadGame: (gs) => set({
        game: gs.game ? {
          ...gs.game,
          econPhase: gs.game.econPhase ?? "normal",
          econPhaseUntil: gs.game.econPhaseUntil ?? (gs.game.day + 25),
        } : undefined,
        staff: gs.staff ?? undefined,
        rates: gs.rates ?? undefined,
        loanPortfolio: gs.loanPortfolio ?? [],
        savingsPortfolio: gs.savingsPortfolio ?? [],
        investments: gs.investments ?? [],
        activeProducts: gs.activeProducts ?? ["tabungan_reguler", "kpr"],
        pendingProducts: gs.pendingProducts ?? [],
        branches: gs.branches ?? [],
        acquired: gs.acquired ?? [],
        lpsEnabled: gs.lpsEnabled ?? false,
        achievements: gs.achievements ?? [],
        careerWins: gs.careerWins ?? 0,
        profitHistory: gs.profitHistory ?? [],
        weeklyReports: gs.weeklyReports ?? [],
        quarterlyReports: gs.quarterlyReports ?? [],
        eventLog: gs.eventLog ?? [],
        competitors: gs.competitors ?? [],
        notifs: [],
        negotiation: null,
        fraudEvent: null,
        earlyRepayRequests: [],
        earlyRepayOffers: [],
        showHire: false,
        showWeeklyReport: null,
        showQuarterlyReport: null,
        activeEvent: null,
        reviewModal: null,
        predictiveWarnings: [],
        customers: [],
        prospects: [],
        creditPipeline: [],
        stressResult: null,
        bmpkLog: [],
        tutorialStep: 0,
        showTutorial: false,
        activeTab: "dashboard",
      }),
      resetGame: (difficulty, scenarioId = "normal") => set({
        game: makeInitGame(difficulty, scenarioId),
        staff: initialStaff(),
        notifs: [],
        negotiation: null,
        fraudEvent: null,
        earlyRepayRequests: [],
        earlyRepayOffers: [],
        showHire: false,
        showWeeklyReport: null,
        showQuarterlyReport: null,
        activeEvent: null,
        reviewModal: null,
        predictiveWarnings: [],
        customers: [],
        loanPortfolio: [],
        savingsPortfolio: [],
        prospects: [],
        competitors: [],
        investments: [],
        activeProducts: ["tabungan_reguler", "kpr"],
        pendingProducts: [],
        creditPipeline: [],
        branches: [],
        acquired: [],
        lpsEnabled: false,
        bmpkLog: [],
        stressResult: null,
        achievements: [],
        profitHistory: [{ day: 1, profit: 0 }],
        weeklyReports: [],
        quarterlyReports: [],
        eventLog: [],
        analyticsData: {
          segmentHistory: [], nplForecast: [],
          heatmap: Array(7).fill(null).map(() => Array(4).fill(0)),
          staffProductivity: {},
        },
        activeTab: "dashboard",
        tutorialStep: 0,
        showTutorial: true,
      }),
    }),
    {
      name: "z-banker-game",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist game data, not UI state
        game: state.game,
        staff: state.staff,
        rates: state.rates,
        loanPortfolio: state.loanPortfolio,
        savingsPortfolio: state.savingsPortfolio,
        investments: state.investments,
        activeProducts: state.activeProducts,
        pendingProducts: state.pendingProducts,
        branches: state.branches,
        acquired: state.acquired,
        lpsEnabled: state.lpsEnabled,
        achievements: state.achievements,
        careerWins: state.careerWins,
        profitHistory: state.profitHistory,
        weeklyReports: state.weeklyReports,
        quarterlyReports: state.quarterlyReports,
        eventLog: state.eventLog,
        darkMode: state.darkMode,
        isMuted: state.isMuted,
      }),
    }
  )
);

// src/store/gameStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  GameState, Staff, Customer, LoanPortfolioItem, SavingsPortfolioItem,
  Prospect, Investment, CityBranch, CreditPipelineItem, WeeklyReport,
  EventLogEntry, Competitor, AnalyticsData, Difficulty, DIFFICULTY_CONFIG,
  Notif, Negotiation, FraudEvent, GameEvent, ReviewModalData, PredictiveWarning,
  EarlyRepayRequest, EarlyRepayOffer,
} from "@/types/game";

const M = 1_000_000;
const B = 1_000_000_000;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rnd = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const STAFF_NAMES_FIRST = ["Budi","Dewi","Hendra","Siti","Agus","Rina","Joko","Maya","Doni","Lestari","Fajar","Intan","Rudi","Citra","Bagas"];
export const STAFF_NAMES_LAST  = ["S.","R.","K.","N.","P.","W.","H.","L.","F.","A."];

export function genStaff(role: Staff["role"]): Staff {
  return {
    id: Date.now() + Math.random(),
    name: pick(STAFF_NAMES_FIRST) + " " + pick(STAFF_NAMES_LAST),
    role, skill: rnd(3,9), speed: rnd(3,9), loyalty: rnd(4,10),
    workload: 0, morale: rnd(60,90), exp: 0,
    status: "aktif", daysWorked: 0, restDay: -1, warningCount: 0, lastReviewDay: 0,
  };
}

export function initialStaff(): Staff[] {
  return [genStaff("teller"), genStaff("cs"), genStaff("analis")];
}

function makeInitGame(difficulty: Difficulty): GameState {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  return {
    day: 1, cash: cfg.startCash, deposits: 200*M, loans: 150*M,
    reputation: 60, npl: 0.5, car: 18.5, ldr: 75, nim: 3.2,
    profit: 0, totalProfit: 0, gameOver: false, gameWon: false,
    branch: 0, level: 1, difficulty,
    tutorialStep: 0, tutorialDone: false,
    bankName: "Bank Nusantara",
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
  activeEvent: GameEvent | null;
  reviewModal: ReviewModalData | null;
  predictiveWarnings: PredictiveWarning[];

  // Features
  investments: Investment[];
  activeProducts: string[];
  creditPipeline: CreditPipelineItem[];
  branches: CityBranch[];
  acquired: string[];
  lpsEnabled: boolean;
  bmpkLog: Array<{ day: number; status: string; violations: number }>;
  stressResult: any | null;
  achievements: string[];

  // Reports & analytics
  profitHistory: Array<{ day: number; profit: number }>;
  weeklyReports: WeeklyReport[];
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
  setCreditPipeline: (updater: (cp: CreditPipelineItem[]) => CreditPipelineItem[]) => void;
  setBranches: (updater: (b: CityBranch[]) => CityBranch[]) => void;
  setAcquired: (updater: (a: string[]) => string[]) => void;
  setLpsEnabled: (v: boolean) => void;
  setBmpkLog: (updater: (l: any[]) => any[]) => void;
  setStressResult: (r: any) => void;
  setAchievements: (updater: (a: string[]) => string[]) => void;
  setProfitHistory: (updater: (h: any[]) => any[]) => void;
  setWeeklyReports: (updater: (wr: WeeklyReport[]) => WeeklyReport[]) => void;
  setEventLog: (updater: (el: EventLogEntry[]) => EventLogEntry[]) => void;
  setAnalyticsData: (updater: (a: AnalyticsData) => AnalyticsData) => void;
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
  setShowTutorial: (v: boolean) => void;
  setTutorialStep: (step: number) => void;
  toggleMute: () => void;
  resetGame: (difficulty: Difficulty) => void;
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
      creditPipeline: [],
      branches: [],
      acquired: [],
      lpsEnabled: false,
      bmpkLog: [],
      stressResult: null,
      achievements: [],
      profitHistory: [{ day: 1, profit: 0 }],
      weeklyReports: [],
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
      setCreditPipeline: (updater) => set((s) => ({ creditPipeline: updater(s.creditPipeline) })),
      setBranches: (updater) => set((s) => ({ branches: updater(s.branches) })),
      setAcquired: (updater) => set((s) => ({ acquired: updater(s.acquired) })),
      setLpsEnabled: (v) => set({ lpsEnabled: v }),
      setBmpkLog: (updater) => set((s) => ({ bmpkLog: updater(s.bmpkLog) })),
      setStressResult: (r) => set({ stressResult: r }),
      setAchievements: (updater) => set((s) => ({ achievements: updater(s.achievements) })),
      setProfitHistory: (updater) => set((s) => ({ profitHistory: updater(s.profitHistory) })),
      setWeeklyReports: (updater) => set((s) => ({ weeklyReports: updater(s.weeklyReports) })),
      setEventLog: (updater) => set((s) => ({ eventLog: updater(s.eventLog) })),
      setAnalyticsData: (updater) => set((s) => ({ analyticsData: updater(s.analyticsData) })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setShowTutorial: (v) => set({ showTutorial: v }),
      setTutorialStep: (step) => set({ tutorialStep: step }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      loadGame: (gs) => set({
        game: gs.game ?? undefined,
        staff: gs.staff ?? undefined,
        rates: gs.rates ?? undefined,
        loanPortfolio: gs.loanPortfolio ?? [],
        savingsPortfolio: gs.savingsPortfolio ?? [],
        investments: gs.investments ?? [],
        activeProducts: gs.activeProducts ?? ["tabungan_reguler", "kpr"],
        branches: gs.branches ?? [],
        acquired: gs.acquired ?? [],
        lpsEnabled: gs.lpsEnabled ?? false,
        achievements: gs.achievements ?? [],
        profitHistory: gs.profitHistory ?? [],
        weeklyReports: gs.weeklyReports ?? [],
        eventLog: gs.eventLog ?? [],
        competitors: gs.competitors ?? [],
        notifs: [],
        negotiation: null,
        fraudEvent: null,
        earlyRepayRequests: [],
        earlyRepayOffers: [],
        showHire: false,
        showWeeklyReport: null,
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
      resetGame: (difficulty) => set({
        game: makeInitGame(difficulty),
        staff: initialStaff(),
        notifs: [],
        negotiation: null,
        fraudEvent: null,
        earlyRepayRequests: [],
        earlyRepayOffers: [],
        showHire: false,
        showWeeklyReport: null,
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
        creditPipeline: [],
        branches: [],
        acquired: [],
        lpsEnabled: false,
        bmpkLog: [],
        stressResult: null,
        achievements: [],
        profitHistory: [{ day: 1, profit: 0 }],
        weeklyReports: [],
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
        branches: state.branches,
        acquired: state.acquired,
        lpsEnabled: state.lpsEnabled,
        achievements: state.achievements,
        profitHistory: state.profitHistory,
        weeklyReports: state.weeklyReports,
        eventLog: state.eventLog,
        darkMode: state.darkMode,
        isMuted: state.isMuted,
      }),
    }
  )
);

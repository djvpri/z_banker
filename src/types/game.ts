// src/types/game.ts

export type Difficulty = "easy" | "normal" | "hard";
export type StaffRole = "teller" | "analis" | "cs" | "manajer";
export type StaffStatus = "aktif" | "istirahat" | "burnout";
export type LoanStatus = "lancar" | "perhatian" | "macet" | "lunas";
export type LoanRisk = "low" | "medium" | "high";

export interface Staff {
  id: number;
  name: string;
  role: StaffRole;
  skill: number;
  speed: number;
  loyalty: number;
  workload: number;
  morale: number;
  exp: number;
  status: StaffStatus;
  daysWorked: number;
  restDay: number;
  warningCount: number;
  lastReviewDay: number;
  salary?: number;
}

export interface Candidate extends Staff {
  expectedSalary: number;
}

export interface FraudEvent {
  suspect: Staff;
  amount: number;
  evidence: number;
}

export interface Customer {
  id: number;
  name: string;
  type: string;
  amount: number;
  score: number;
  risk: number;
  day: number;
  isLoan: boolean;
  needsCollateral: boolean;
  collateral: string | null;
  collateralValue: number;
  wantsNegotiate: boolean;
  counterRateDiscount: number;
  negotiationRound: number;
  processDays: number;
  inPipeline: boolean;
}

export interface LoanPortfolioItem {
  id: number;
  debtor: string;
  type: string;
  amount: number;
  rate: number;
  tenor: number;
  paidMonths: number;
  risk: LoanRisk;
  status: LoanStatus;
  collateral: string | null;
  collateralValue: number;
}

export interface SavingsPortfolioItem {
  id: number;
  holder: string;
  type: string;
  amount: number;
  rate: number;
  maturity: number;
  daysLeft: number;
}

export interface Prospect {
  id: number;
  name: string;
  sector: string;
  product: string;
  isLoan: boolean;
  potential: number;
  interest: number;
  score: number;
  contacted: boolean;
  approached: number;
  daysLeft: number;
  lastApproachDay: number;
}

export interface Investment {
  id: string | number;
  instrument: string;
  amount: number;
  startDay: number;
}

export interface CityBranch {
  cityId: string;
  openDay: number;
  activeDay: number;
  status: "building" | "aktif";
  deposits: number;
  loans: number;
}

export interface PendingProduct {
  id: string;
  readyDay: number;
}

export interface CreditPipelineItem {
  id: number;
  customer: Customer;
  analystId: number;
  startDay: number;
  processDays: number;
  agreedRate: number;
  daysLeft: number;
}

export interface WeeklyReport {
  week: number;
  day: number;
  profit: number;
  profitDaily: number;
  npl: number;
  nplDelta: number;
  reputation: number;
  repDelta: number;
  deposits: number;
  depositsDelta: number;
  loans: number;
  car: number;
  staffCount: number;
  rating: "Sehat" | "Cukup" | "Waspada";
}

export interface QuarterlyKpiItem {
  label: string;
  value: number;
  targetLabel: string;
  pass: boolean;
}

export interface QuarterlyKpiResult {
  quarter: number;
  day: number;
  items: QuarterlyKpiItem[];
  passedCount: number;
  rating: "Sehat" | "Cukup" | "Pengawasan" | "Sanksi";
  consequence: string;
}

export interface Notif {
  id: number;
  msg: string;
  type: "success" | "danger" | "warning" | "info";
}

export interface Negotiation {
  customer: Customer;
  proposedRate: number;
}

export interface EarlyRepayRequest {
  loanId: number;
  debtorName: string;
  loanType: string;
  day: number;
}

export interface EarlyRepayOffer {
  loanId: number;
  sentDay: number;
}

export interface GameEvent {
  id: string;
  title: string;
  desc: string;
  type: string;
}

export interface ReviewResult {
  id: number;
  name: string;
  role: StaffRole;
  perf: number;
  verdict: "baik" | "cukup" | "buruk";
  warnings: number;
}

export interface ReviewModalData {
  results: ReviewResult[];
  day: number;
}

export interface PredictiveWarning {
  id: string;
  msg: string;
  type: "success" | "danger" | "warning" | "info";
}

export interface EventLogEntry {
  day: number;
  title: string;
  type: "success" | "danger" | "warning" | "info";
}

export interface Competitor {
  id: number;
  name: string;
  speciality: string;
  strategy: string;
  reputation: number;
  deposits: number;
  loans: number;
  age: number;
  lifespan: number;
  enteredDay: number;
  exitWarning: boolean;
}

export type EconPhase = "normal" | "boom" | "resesi";

export interface GameState {
  day: number;
  cash: number;
  deposits: number;
  loans: number;
  reputation: number;
  npl: number;
  car: number;
  ldr: number;
  nim: number;
  profit: number;
  totalProfit: number;
  gameOver: boolean;
  gameWon: boolean;
  branch: number;
  level: number;
  difficulty: Difficulty;
  tutorialStep: number;
  tutorialDone: boolean;
  bankName: string;
  econPhase: EconPhase;
  econPhaseUntil: number;
}

export interface DailyChallengeData {
  id: string;
  date: string;
  title: string;
  description: string;
  targetType: "profit" | "npl" | "reputation" | "approvals" | "prospects";
  targetValue: number;
  bonusXp: number;
  completed?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  totalProfit: number;
  day: number;
  level: number;
  difficulty: Difficulty;
  branch: string;
  achievements: number;
  submittedAt: string;
  isCurrentUser?: boolean;
}

export interface AnalyticsData {
  segmentHistory: Array<{ day: number; retail: number; umkm: number; korporat: number }>;
  nplForecast: Array<{ day: number; trend: number }>;
  heatmap: number[][];
  staffProductivity: Record<number, { name: string; role: StaffRole; totalHandled: number; avgWorkload: number; days: number }>;
}

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  target: string;       // CSS selector or tab id to highlight
  action?: string;      // what user needs to do to proceed
  position: "top" | "bottom" | "left" | "right";
}

// Difficulty multipliers
export const DIFFICULTY_CONFIG = {
  easy: {
    label: "Mudah 🌱",
    startCash: 800_000_000,
    eventFrequency: 0.15,
    badEventWeight: 0.3,
    targetProfit: 5_000_000_000,
    nplTolerance: 12,
    color: "#22c55e",
    desc: "Starting cash lebih besar, event buruk lebih jarang",
  },
  normal: {
    label: "Normal ⚖️",
    startCash: 500_000_000,
    eventFrequency: 0.28,
    badEventWeight: 0.5,
    targetProfit: 10_000_000_000,
    nplTolerance: 10,
    color: "#f59e0b",
    desc: "Pengalaman standar, seimbang antara tantangan dan reward",
  },
  hard: {
    label: "Sulit 🔥",
    startCash: 250_000_000,
    eventFrequency: 0.40,
    badEventWeight: 0.7,
    targetProfit: 10_000_000_000,
    nplTolerance: 8,
    color: "#ef4444",
    desc: "Kas awal minim, event buruk sering, NPL limit lebih ketat",
  },
} as const;

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Selamat Datang di Bank Nusantara! 🏦",
    description: "Kamu adalah manajer bank yang baru ditunjuk. Tugasmu: kembangkan bank dari cabang kecil menjadi empire perbankan!",
    target: "header",
    position: "bottom",
  },
  {
    id: 2,
    title: "Dashboard — Pantau Kondisi Bank",
    description: "Di sini kamu lihat KPI utama: Kas, Deposito, Kredit, Reputasi, dan rasio kesehatan (CAR, NPL, LDR, NIM).",
    target: "dashboard",
    position: "bottom",
  },
  {
    id: 3,
    title: "Tab Antrian — Layani Nasabah",
    description: "Nasabah baru datang setiap hari. Setujui deposito untuk menambah dana, atau proses kredit (butuh Analis aktif!)",
    target: "nasabah",
    position: "bottom",
  },
  {
    id: 4,
    title: "Tab Tim — Kelola Staf",
    description: "Rekrut Teller, CS, Analis, dan Manajer. Jaga workload dan moral mereka agar tidak burnout!",
    target: "staf",
    position: "bottom",
  },
  {
    id: 5,
    title: "Tab Bunga — Atur Suku Bunga",
    description: "Spread antara bunga kredit dan tabungan = profit kamu. Jaga NIM minimal 2% agar menguntungkan.",
    target: "bunga",
    position: "bottom",
  },
  {
    id: 6,
    title: "Next Day — Maju ke Hari Berikutnya",
    description: "Tekan tombol ini untuk memproses satu hari. Profit dihitung, staf dibayar, event acak bisa muncul!",
    target: "nextday-btn",
    position: "bottom",
  },
  {
    id: 7,
    title: "Target: Rp10 Miliar Profit! 🏆",
    description: "Kumpulkan total profit Rp10M untuk menang. CAR harus ≥12%, NPL ≤10%, dan kas tidak boleh habis. Selamat bermain!",
    target: "winbar",
    position: "bottom",
    action: "start",
  },
];

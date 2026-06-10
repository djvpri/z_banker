// src/lib/gameConstants.ts
// Konstanta game — dipindahkan dari artifact bank-manager-simulator.jsx
import { M, B, clamp } from "./gameFormat";
import type { StaffRole, EconPhase } from "@/types/game";

export const STAFF_ROLES: Record<StaffRole, { label: string; icon: string; color: string; salary: number; desc: string }> = {
  teller:  { label: "Teller",           icon: "🏧", color: "#60a5fa", salary: 45000,  desc: "Layani nasabah harian" },
  analis:  { label: "Analis Kredit",    icon: "📋", color: "#f59e0b", salary: 70000,  desc: "Evaluasi risiko pinjaman" },
  cs:      { label: "Customer Service", icon: "💬", color: "#a78bfa", salary: 50000,  desc: "Jaga kepuasan & reputasi" },
  manajer: { label: "Manajer",          icon: "👔", color: "#c8a96e", salary: 120000, desc: "Boost performa tim" },
};

export const PROMO_PATHS: Partial<Record<StaffRole, { to: StaffRole; expNeeded: number; cost: number; label: string }>> = {
  teller: { to: "cs",      expNeeded: 20, cost: 3 * M,  label: "Naik ke CS" },
  cs:     { to: "analis",  expNeeded: 40, cost: 5 * M,  label: "Naik ke Analis" },
  analis: { to: "manajer", expNeeded: 60, cost: 10 * M, label: "Naik ke Manajer" },
};

export const BRANCHES = [
  { name: "Cabang Kecil", icon: "🏠", maxCustomers: 5,  repBonus: 0,  cost: 0,        workloadCap: 60, maxStaff: 5  },
  { name: "Cabang Madya", icon: "🏢", maxCustomers: 10, repBonus: 10, cost: 500 * M,  workloadCap: 75, maxStaff: 10 },
  { name: "Kantor Pusat", icon: "🏙️", maxCustomers: 20, repBonus: 25, cost: 2 * B,    workloadCap: 90, maxStaff: 20 },
];

// Waktu (dalam hari) sebelum cabang baru / produk baru aktif sepenuhnya
export const BRANCH_CONSTRUCTION_DAYS = 3;
export const PRODUCT_INSTALL_DAYS = 2;

export const CITIES = [
  { id: "jakarta",  name: "Jakarta",  icon: "🏙️", marketSize: "besar",  cost: 500 * M, maxCusts: 25, compCount: 5, depBonus: 0.3,  desc: "Pusat bisnis — pasar besar tapi kompetisi ketat" },
  { id: "surabaya", name: "Surabaya", icon: "🌊", marketSize: "besar",  cost: 400 * M, maxCusts: 20, compCount: 4, depBonus: 0.25, desc: "Kota industri terbesar kedua, UMKM aktif" },
  { id: "bandung",  name: "Bandung",  icon: "🌸", marketSize: "sedang", cost: 250 * M, maxCusts: 15, compCount: 3, depBonus: 0.18, desc: "Kota kreatif & pendidikan, deposito stabil" },
  { id: "medan",    name: "Medan",    icon: "🌴", marketSize: "sedang", cost: 300 * M, maxCusts: 18, compCount: 3, depBonus: 0.2,  desc: "Pintu gerbang Sumatera, pertanian & perdagangan" },
  { id: "bali",     name: "Bali",     icon: "🌺", marketSize: "sedang", cost: 350 * M, maxCusts: 16, compCount: 2, depBonus: 0.22, desc: "Pariwisata tinggi, nasabah asing potensial" },
  { id: "makassar", name: "Makassar", icon: "⚓", marketSize: "kecil",  cost: 200 * M, maxCusts: 12, compCount: 2, depBonus: 0.15, desc: "Hub Sulawesi, potensi tumbuh pesat" },
];

export const STRESS_SCENARIOS = [
  { id: "mild",   name: "Perlambatan Ekonomi", icon: "🌧️", nplShock: +2.0, depShock: -0.10, cashShock: -0.05, carShock: -1.5, desc: "Pertumbuhan melambat, NPL naik moderat" },
  { id: "severe", name: "Krisis Keuangan",     icon: "⛈️", nplShock: +4.0, depShock: -0.25, cashShock: -0.15, carShock: -3.0, desc: "Krisis sistemik, bank run sedang" },
  { id: "extreme",name: "Depresi Ekonomi",     icon: "🌪️", nplShock: +7.0, depShock: -0.40, cashShock: -0.30, carShock: -5.0, desc: "Skenario terburuk, depresi besar" },
];

// ── Siklus Ekonomi Makro ─────────────────────────────────────────────────────
// Fase ekonomi bergilir tiap N hari, mempengaruhi permintaan kredit/nasabah baru,
// arah drift NPL, dan pertumbuhan/penyusutan deposito harian.
export const ECONOMIC_PHASES: Record<EconPhase, {
  label: string; icon: string; color: string; desc: string;
  demandMultiplier: number; nplDriftBias: number; depositGrowthBias: number;
  aggressionBias: number; minDuration: number; maxDuration: number;
}> = {
  normal: { label: "Normal", icon: "➖", color: "#60a5fa",
    desc: "Kondisi ekonomi stabil.",
    demandMultiplier: 1, nplDriftBias: 0, depositGrowthBias: 0, aggressionBias: 0, minDuration: 20, maxDuration: 35 },
  boom: { label: "Ekspansi", icon: "📈", color: "#22c55e",
    desc: "Ekonomi tumbuh pesat. Permintaan kredit & nasabah baru naik, NPL cenderung membaik.",
    demandMultiplier: 1.5, nplDriftBias: -0.4, depositGrowthBias: 0.05, aggressionBias: -0.2, minDuration: 15, maxDuration: 30 },
  resesi: { label: "Resesi", icon: "📉", color: "#ef4444",
    desc: "Ekonomi melambat. Permintaan kredit turun, NPL cenderung memburuk, deposito tertekan.",
    demandMultiplier: 0.6, nplDriftBias: 0.5, depositGrowthBias: -0.08, aggressionBias: 0.5, minDuration: 15, maxDuration: 30 },
};

// Transisi tertimbang: boom/resesi cenderung kembali ke normal dulu sebelum berganti arah
export const ECON_NEXT_PHASE: Record<EconPhase, EconPhase[]> = {
  normal: ["boom", "resesi"],
  boom: ["normal", "normal", "resesi"],
  resesi: ["normal", "normal", "boom"],
};

// Tingkat agresivitas kompetitor: naik perlahan seiring hari, dipengaruhi fase ekonomi
export function getCompetitionAggression(day: number, econPhase: EconPhase): number {
  return clamp(1 + day / 150 + ECONOMIC_PHASES[econPhase].aggressionBias, 0.6, 2.5);
}

export const LPS_PREMIUM_RATE = 0.002; // 0.2% per tahun dari simpanan dijamin
export const LPS_MAX_COVERAGE = 2 * B; // Rp2 Miliar per nasabah

export const ACQUISITION_TARGETS = [
  { id: "bank_kecil",   name: "Bank Perkasa",  icon: "🏦", health: "buruk", price: 150 * M, deposits: 80 * M,  loans: 60 * M,  staff: 2, npl: 8.5, desc: "NPL tinggi tapi nasabah banyak. Risiko besar." },
  { id: "bank_umkm",    name: "BPR Nusantara", icon: "🏪", health: "cukup", price: 300 * M, deposits: 200 * M, loans: 150 * M, staff: 4, npl: 4.2, desc: "Fokus UMKM, portofolio cukup bersih." },
  { id: "bank_digital", name: "FinBank ID",    icon: "📱", health: "sehat", price: 600 * M, deposits: 400 * M, loans: 200 * M, staff: 6, npl: 1.8, desc: "Bank digital, nasabah muda, NPL rendah." },
];

export const COLLATERAL_TYPES = ["Sertifikat Rumah", "BPKB Kendaraan", "Deposito Jaminan", "Surat Tanah", "Rekening Giro", "Saham Perusahaan"];

export const CUST_NAMES = ["Pak Tono","Bu Lia","Mas Bram","Neng Gita","Koh Andi","Pak Surya","Bu Ratna","Mbak Vivi","Bang Reza","Ibu Wulan","Pak Heri","Bu Tati","Mas Diko","Mbak Sari","Kak Adit"];
export const CUST_TYPES = ["Pinjaman KPR","Deposito","Buka Rekening","Pinjaman Usaha","Pinjaman KTA","Deposito Korporat"];

export const PROSPECT_NAMES = ["Pak Bambang","Bu Endang","Mas Gilang","Neng Ayu","Pak Ridwan","Bu Kartini","Mas Ferdi","Mbak Putri","Pak Wahyu","Bu Nita","PT Maju Jaya","CV Berkah","PT Sinar Mas","UD Mandiri","PT Sejahtera"];
export const PROSPECT_SECTORS = ["Properti","UMKM","Korporasi","Pendidikan","Kesehatan","Retail","Manufaktur","Pertanian","Teknologi","Kuliner"];
export const PROSPECT_PRODUCTS = ["KPR Premium","Deposito Korporat","Tabungan Bisnis","Pinjaman Usaha","KTA Multiguna","Deposito Reguler","Kredit Investasi"];

export const EVENTS = [
  { id: "ojk",          title: "⚠️ Inspeksi OJK",            desc: "OJK memeriksa mendadak! CAR >= 12% & NPL <= 5%.", type: "warning" },
  { id: "bankrun",      title: "😰 Bank Run!",                desc: "Nasabah panik menarik dana massal! Likuiditas turun 25%.", type: "danger" },
  { id: "boom",         title: "📈 Boom Ekonomi",             desc: "Ekonomi menggeliat! Nasabah baru membanjir.", type: "success" },
  { id: "fintech",      title: "📱 Serangan Fintech",         desc: "Fintech agresif merebut nasabah muda.", type: "danger" },
  { id: "startup",      title: "🚀 Startup Unicorn",          desc: "Startup membuka rekening korporat besar!", type: "success" },
  { id: "fraud",        title: "🚨 Fraud Internal",           desc: "Penyelewengan ditemukan!", type: "danger" },
  { id: "award",        title: "🏆 Bank Terbaik",             desc: "Dinobatkan Bank Terbaik Indonesia!", type: "success" },
  { id: "krisis",       title: "🌐 Krisis Global",            desc: "Pasar guncang. NPL naik, deposit turun.", type: "danger" },
  { id: "resign",       title: "👋 Staf Mengundurkan Diri",   desc: "Satu staf tidak tahan dan resign!", type: "danger" },
  { id: "bonus",        title: "🎁 Subsidi KPR Pemerintah",   desc: "Permintaan kredit KPR melonjak drastis!", type: "success" },
  { id: "training_gov", title: "🎓 Pelatihan Gratis BI",      desc: "Bank Indonesia menyelenggarakan pelatihan gratis. Skill seluruh staf naik!", type: "success" },
  { id: "mogok",        title: "✊ Staf Mogok Kerja",          desc: "Staf menuntut kenaikan gaji! Moral tim turun drastis.", type: "danger" },
  { id: "rekrut_baru",  title: "👤 Talenta Langka Melamar",   desc: "Kandidat luar biasa melamar kerja ke bank kamu. Bisa langsung bergabung gratis!", type: "success" },
  { id: "sakit_massal", title: "🤒 Flu Massal Kantor",        desc: "Setengah staf jatuh sakit dan harus istirahat hari ini.", type: "danger" },
  { id: "kenaikan_gaji",title: "💰 Tuntutan Kenaikan Gaji",   desc: "Staf meminta kenaikan gaji. Bayar bonus Rp20jt atau moral tim turun.", type: "warning" },
  { id: "nasabah_vip",  title: "👑 Nasabah VIP Datang",       desc: "Pengusaha besar tertarik menaruh dana jumbo di bank kamu!", type: "success" },
  { id: "kredit_macet", title: "💸 Kredit Macet Massal",      desc: "Beberapa debitur gagal bayar serentak. NPL melonjak!", type: "danger" },
  { id: "viral",        title: "📣 Bank Viral di Medsos",     desc: "Video layanan bank kamu viral! Reputasi melonjak dan antrian nasabah bertambah.", type: "success" },
  { id: "gosip",        title: "🗣️ Gosip Negatif Beredar",    desc: "Kabar burung tentang kondisi bank kamu menyebar. Reputasi turun.", type: "danger" },
  { id: "inflasi",      title: "📊 Inflasi Tinggi",           desc: "Inflasi melonjak. Nasabah menarik tabungan untuk kebutuhan hidup.", type: "danger" },
  { id: "haji",         title: "🕌 Musim Haji",               desc: "Banyak nasabah butuh dana haji mendadak. Penarikan deposito meningkat.", type: "warning" },
  { id: "lebaran",      title: "🌙 Musim Lebaran",            desc: "Kebutuhan uang tunai meningkat. Transaksi melonjak, reputasi naik!", type: "success" },
  { id: "pemilu",       title: "🗳️ Masa Pemilu",              desc: "Ketidakpastian politik membuat nasabah menahan investasi. Deposito turun sementara.", type: "warning" },
  { id: "sistem_down",  title: "💻 Sistem Error Besar",       desc: "Core banking down seharian! Reputasi turun dan nasabah komplain.", type: "danger" },
  { id: "banjir",       title: "🌊 Banjir Melanda Kantor",    desc: "Banjir merusak operasional. Biaya perbaikan besar, staf terpaksa WFH.", type: "danger" },
  { id: "merger_offer", title: "🤝 Tawaran Merger",           desc: "Bank besar menawarkan merger. Dana segar masuk, tapi harus bayar biaya legal.", type: "warning" },
  { id: "gedung_baru",  title: "🏗️ Gedung Baru Selesai",      desc: "Renovasi kantor selesai! Reputasi naik dan moral staf meningkat.", type: "success" },
  { id: "audit_eksternal", title: "🔎 Audit Eksternal",       desc: "Auditor independen masuk. Jika NPL bersih, dapat sertifikat bergengsi.", type: "warning" },
  { id: "beasiswa",     title: "📚 Program Beasiswa Staf",    desc: "Pemerintah memberi beasiswa pelatihan. Satu staf random skill naik 2!", type: "success" },
];

export const BANK_NAMES = ["Bank Maju","Bank Sejahtera","Bank Permata Nusa","Bank Andalan","Bank Cerdas","Bank Prima","Bank Harmoni","Bank Nusaraya","Bank Pratama","Bank Utama","Bank Garuda","Bank Cahaya"];
export const BANK_SPECIALITIES = ["loan","deposit","retail","korporat"];
export const BANK_STRATEGIES = ["agresif","konservatif","ekspansif","defensif"];

export interface Product {
  id: string; icon: string; name: string; desc: string;
  unlockBranch: number; unlockDay: number; fee: number;
  nimBonus: number; depBonus: number; passiveIncome: number; custPerDay: number;
  maintenanceCost: number; payrollInterval: number; payrollDeposit: number;
}

export const ALL_PRODUCTS: Product[] = [
  { id: "tabungan_reguler",  icon: "💳", name: "Tabungan Reguler",  desc: "Produk dasar, sudah aktif",          unlockBranch: 0, unlockDay: 0,  fee: 0,      nimBonus: 0,    depBonus: 0,    passiveIncome: 0,   custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "deposito_3bln",     icon: "🏦", name: "Deposito 3 Bulan",  desc: "Suku bunga kompetitif",              unlockBranch: 0, unlockDay: 7,  fee: 5 * M,  nimBonus: 0.1,  depBonus: 0.05, passiveIncome: 0,   custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "kpr",               icon: "🏠", name: "KPR",               desc: "Kredit pemilikan rumah",             unlockBranch: 0, unlockDay: 0,  fee: 0,      nimBonus: 0,    depBonus: 0,    passiveIncome: 0,   custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "kpr_syariah",       icon: "🕌", name: "KPR Syariah",       desc: "Akad murabahah, margin kompetitif",  unlockBranch: 1, unlockDay: 14, fee: 10 * M, nimBonus: 0.2,  depBonus: 0.08, passiveIncome: 0,   custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "tabungan_anak",     icon: "👶", name: "Tabungan Anak",     desc: "Menarik segmen keluarga muda",       unlockBranch: 1, unlockDay: 10, fee: 8 * M,  nimBonus: 0.05, depBonus: 0.1,  passiveIncome: 0,   custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "kredit_umkm",       icon: "🏪", name: "Kredit UMKM",       desc: "Margin tinggi, target pengusaha",    unlockBranch: 1, unlockDay: 20, fee: 15 * M, nimBonus: 0.3,  depBonus: 0,    passiveIncome: 0,   custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "deposito_korporat", icon: "🏛️", name: "Deposito Korporat", desc: "Dana jumbo dari perusahaan",         unlockBranch: 2, unlockDay: 0,  fee: 0,      nimBonus: 0,    depBonus: 0.15, passiveIncome: 0,   custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "valas",             icon: "💱", name: "Layanan Valas",     desc: "Fee per transaksi, pendapatan non-bunga", unlockBranch: 2, unlockDay: 30, fee: 20 * M, nimBonus: 0.15, depBonus: 0, passiveIncome: 0, custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "bancassurance",     icon: "🛡️", name: "Bancassurance",     desc: "Komisi dari produk asuransi",        unlockBranch: 2, unlockDay: 25, fee: 25 * M, nimBonus: 0.25, depBonus: 0.05, passiveIncome: 0,  custPerDay: 0, maintenanceCost: 0, payrollInterval: 0, payrollDeposit: 0 },
  { id: "atm_network",       icon: "🏧", name: "Jaringan ATM",      desc: "ATM tersebar = nasabah pasif tiap hari + reputasi naik",   unlockBranch: 1, unlockDay: 15, fee: 50 * M, nimBonus: 0,    depBonus: 0.12, passiveIncome: 2 * M, custPerDay: 2, maintenanceCost: 500000, payrollInterval: 0, payrollDeposit: 0 },
  { id: "mobile_banking",    icon: "📱", name: "Mobile Banking",    desc: "Retensi nasabah meningkat, transaksi digital +fee harian", unlockBranch: 0, unlockDay: 20, fee: 30 * M, nimBonus: 0.1,  depBonus: 0.08, passiveIncome: 1 * M, custPerDay: 1, maintenanceCost: 300000, payrollInterval: 0, payrollDeposit: 0 },
  { id: "safe_deposit_box",  icon: "🗄️", name: "Safe Deposit Box",  desc: "Passive income dari sewa brankas nasabah premium",         unlockBranch: 1, unlockDay: 12, fee: 20 * M, nimBonus: 0,    depBonus: 0.05, passiveIncome: 3 * M, custPerDay: 0, maintenanceCost: 200000, payrollInterval: 0, payrollDeposit: 0 },
  { id: "payroll_service",   icon: "💼", name: "Payroll Service",   desc: "Kontrak perusahaan — deposito rutin masuk otomatis tiap 30 hari", unlockBranch: 1, unlockDay: 25, fee: 35 * M, nimBonus: 0, depBonus: 0.2, passiveIncome: 0, custPerDay: 0, payrollInterval: 30, payrollDeposit: 50 * M, maintenanceCost: 400000 },
];

export const INVESTMENT_OPTIONS = [
  { id: "sbi",      name: "SBI (Sertifikat BI)",   icon: "🏛️", rateAnnual: 5.5,  risk: "low",    minAmount: 50 * M,  desc: "Aman, likuid, bunga rendah" },
  { id: "obligasi", name: "Obligasi Negara",        icon: "📜", rateAnnual: 7.0,  risk: "low",    minAmount: 100 * M, desc: "Aman, bunga lebih tinggi" },
  { id: "reksadana",name: "Reksa Dana Pasar Uang",  icon: "📈", rateAnnual: 8.5,  risk: "medium", minAmount: 25 * M,  desc: "Fleksibel, risiko sedang" },
  { id: "saham",    name: "Saham Blue Chip",        icon: "📊", rateAnnual: 12.0, risk: "high",   minAmount: 200 * M, desc: "Potensi tinggi, volatil" },
];

export const ACHIEVEMENTS = [
  { id: "first_profit",    icon: "💰", title: "Profit Pertama",     desc: "Raih profit harian pertama",       reward: "Reputasi +5" },
  { id: "zero_npl",        icon: "🛡️", title: "Zero NPL",           desc: "NPL di bawah 1%",                  reward: "CAR +1%" },
  { id: "bank_terpercaya", icon: "⭐", title: "Bank Terpercaya",    desc: "Reputasi mencapai 80%",            reward: "Deposito +10%" },
  { id: "raja_kredit",     icon: "👑", title: "Raja Kredit",        desc: "Portofolio kredit > Rp1M",         reward: "NIM +0.5%" },
  { id: "tim_solid",       icon: "🤝", title: "Tim Solid",          desc: "Punya 6 staf aktif serentak",      reward: "Workload -10%" },
  { id: "ekspansi",        icon: "🏢", title: "Ekspansi",           desc: "Upgrade ke Cabang Madya",          reward: "Nasabah +2/hari" },
  { id: "kantor_pusat",    icon: "🏙️", title: "Kantor Pusat",       desc: "Upgrade ke Kantor Pusat",          reward: "Reputasi +10" },
  { id: "miliarder",       icon: "💎", title: "Miliarder",          desc: "Total profit Rp1 Miliar",          reward: "CAR +2%" },
  { id: "anti_fraud",      icon: "🔒", title: "Anti Fraud",         desc: "Survive 30 hari tanpa fraud",      reward: "Reputasi +8" },
  { id: "pasar_dominan",   icon: "📊", title: "Dominasi Pasar",     desc: "Pangsa deposito > 50%",            reward: "NIM +0.3%" },
  { id: "kredit_lunas",    icon: "✅", title: "Kredit Lunas",       desc: "5 kredit selesai dilunasi",        reward: "NPL -0.5%" },
  { id: "loyalis",         icon: "❤️", title: "Loyalis",            desc: "Punya staf dengan loyalitas 10/10",reward: "Moral tim +10" },
  { id: "veteran",         icon: "🎖️", title: "Veteran",            desc: "Satu staf bekerja lebih dari 60 hari", reward: "Skill staf +1" },
  { id: "aman_ojk",        icon: "⚖️", title: "Lulus OJK Sempurna", desc: "CAR > 15% & NPL < 2% serentak",    reward: "Reputasi +12" },
  { id: "empire",          icon: "🏆", title: "Bank Empire",        desc: "Total profit Rp10 Miliar",         reward: "WIN!" },
];

export const STAFF_FIRST = ["Budi","Dewi","Hendra","Siti","Agus","Rina","Joko","Maya","Doni","Lestari","Fajar","Intan","Rudi","Citra","Bagas","Yuli","Teguh","Nanda","Wahyu","Fika"];
export const STAFF_LAST  = ["S.","R.","K.","N.","P.","W.","H.","L.","F.","A.","M.","T.","B.","D.","G."];

// Tab navigation — id harus konsisten dengan TUTORIAL_STEPS[].target di types/game.ts
export const TABS = [
  { id: "dashboard",   label: "📊 Dashboard" },
  { id: "nasabah",     label: "👥 Antrian" },
  { id: "portofolio",  label: "📁 Portofolio" },
  { id: "prospek",     label: "🎯 Prospek" },
  { id: "staf",        label: "👔 Tim" },
  { id: "analitik",    label: "🔬 Analitik" },
  { id: "regulasi",    label: "⚖️ Regulasi" },
  { id: "ekspansi",    label: "🌍 Ekspansi" },
  { id: "produk",      label: "📦 Produk" },
  { id: "investasi",   label: "💹 Investasi" },
  { id: "camels",      label: "🏦 CAMELS" },
  { id: "achievement", label: "🏅 Medal" },
  { id: "laporan",     label: "📋 Laporan" },
  { id: "grafik",      label: "📈 Grafik" },
  { id: "cabang",      label: "🏢 Cabang" },
  { id: "kompetitor",  label: "⚔️ Rival" },
  { id: "bunga",       label: "💰 Bunga" },
  { id: "sosial",      label: "🤝 Sosial" },
];

// src/components/game/tabs/index.ts
// Registry tab yang sudah dikonversi dari artifact. Tab yang belum ada di sini
// akan menampilkan placeholder "sedang dikonversi" di GameShell.
import { ComponentType } from "react";
import DashboardTab from "./DashboardTab";
import BungaTab from "./BungaTab";
import GrafikTab from "./GrafikTab";
import AntrianTab from "./AntrianTab";
import PortofolioTab from "./PortofolioTab";
import TimTab from "./TimTab";
import ProspekTab from "./ProspekTab";
import AnalitikTab from "./AnalitikTab";
import CamelsTab from "./CamelsTab";
import InvestasiTab from "./InvestasiTab";
import AchievementTab from "./AchievementTab";
import LaporanTab from "./LaporanTab";
import CabangTab from "./CabangTab";
import KompetitorTab from "./KompetitorTab";
import RegulasiTab from "./RegulasiTab";
import EkspansiTab from "./EkspansiTab";
import ProdukTab from "./ProdukTab";

export const TAB_COMPONENTS: Record<string, ComponentType> = {
  dashboard: DashboardTab,
  bunga: BungaTab,
  grafik: GrafikTab,
  nasabah: AntrianTab,
  portofolio: PortofolioTab,
  staf: TimTab,
  prospek: ProspekTab,
  analitik: AnalitikTab,
  camels: CamelsTab,
  investasi: InvestasiTab,
  achievement: AchievementTab,
  laporan: LaporanTab,
  cabang: CabangTab,
  kompetitor: KompetitorTab,
  regulasi: RegulasiTab,
  ekspansi: EkspansiTab,
  produk: ProdukTab,
};

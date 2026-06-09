// src/components/game/tabs/AnalitikTab.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import { clamp } from "@/lib/gameFormat";
import { STAFF_ROLES } from "@/lib/gameConstants";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const HOUR_LABELS = ["08-10", "10-12", "13-15", "15-17"];

export default function AnalitikTab() {
  const analyticsData = useGameStore((s) => s.analyticsData);
  const game = useGameStore((s) => s.game);

  const seg = analyticsData.segmentHistory;
  const heatmap = analyticsData.heatmap;
  const prod = analyticsData.staffProductivity;
  const forecast = analyticsData.nplForecast;

  let nplTrend = 0;
  if (forecast.length >= 3) {
    const recent = forecast.slice(-7);
    nplTrend = recent.reduce((s, f) => s + f.trend, 0) / recent.length;
  }
  const forecastDays = [1, 3, 7].map((d) => ({
    day: d,
    npl: parseFloat(clamp(game.npl + nplTrend * d * 10, 0.5, 15).toFixed(1)),
  }));

  const totalRetail = seg.length ? seg[seg.length - 1].retail : 0;
  const totalUmkm = seg.length ? seg[seg.length - 1].umkm : 0;
  const totalKorporat = seg.length ? seg[seg.length - 1].korporat : 0;
  const totalSeg = totalRetail + totalUmkm + totalKorporat || 1;

  const maxHeat = Math.max(1, heatmap.reduce((m, row) => Math.max(m, Math.max(...row)), 0));
  const prodList = Object.values(prod).sort((a, b) => b.totalHandled - a.totalHandled).slice(0, 8);

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 14 }}>🔬 Analitik & Insight</div>

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", marginBottom: 10 }}>👥 Segmentasi Nasabah</div>
        <div className="grid-3" style={{ marginBottom: 10 }}>
          {[
            { label: "Retail", val: totalRetail, color: "#60a5fa", icon: "👤", desc: "Tabungan, KTA, deposit kecil" },
            { label: "UMKM", val: totalUmkm, color: "#f59e0b", icon: "🏪", desc: "Pinjaman usaha kecil-menengah" },
            { label: "Korporat", val: totalKorporat, color: "#a78bfa", icon: "🏛️", desc: "Deposito & kredit besar" },
          ].map((s) => {
            const pct = Math.round((s.val / totalSeg) * 100) || 0;
            return (
              <div key={s.label} style={{ background: "#0d0d14", borderRadius: 9, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{pct}%</div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 8, color: "#444", marginTop: 1 }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Distribusi saat ini</div>
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1 }}>
          {[
            { pct: Math.round((totalRetail / totalSeg) * 100), c: "#60a5fa" },
            { pct: Math.round((totalUmkm / totalSeg) * 100), c: "#f59e0b" },
            { pct: Math.round((totalKorporat / totalSeg) * 100), c: "#a78bfa" },
          ].map((s, i) => (
            <div key={i} style={{ flex: s.pct, background: s.c, transition: "flex 0.5s" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#444", marginTop: 3 }}>
          <span style={{ color: "#60a5fa" }}>■ Retail {Math.round((totalRetail / totalSeg) * 100)}%</span>
          <span style={{ color: "#f59e0b" }}>■ UMKM {Math.round((totalUmkm / totalSeg) * 100)}%</span>
          <span style={{ color: "#a78bfa" }}>■ Korporat {Math.round((totalKorporat / totalSeg) * 100)}%</span>
        </div>
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginBottom: 10 }}>🔥 Heatmap Aktivitas Transaksi</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
          <div style={{ width: 28 }} />
          {HOUR_LABELS.map((h) => <div key={h} style={{ flex: 1, fontSize: 8, color: "#444", textAlign: "center" }}>{h}</div>)}
        </div>
        {heatmap.map((row, d) => (
          <div key={d} style={{ display: "flex", gap: 4, marginBottom: 3, alignItems: "center" }}>
            <div style={{ width: 28, fontSize: 9, color: "#555", textAlign: "right" }}>{DAY_LABELS[d]}</div>
            {row.map((v, h) => {
              const intensity = v / maxHeat;
              const alpha = 0.1 + intensity * 0.85;
              const bg = `rgba(34,197,94,${alpha.toFixed(2)})`;
              return (
                <div key={h} style={{ flex: 1, height: 18, borderRadius: 3, background: v > 0 ? bg : "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {v > 0 && <span style={{ fontSize: 7, color: "#fff", fontWeight: 700 }}>{v}</span>}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ fontSize: 9, color: "#444", marginTop: 6 }}>💡 Warna makin terang = transaksi makin ramai di waktu itu</div>
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 10 }}>📉 Forecast NPL</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ background: "#0d0d14", borderRadius: 8, padding: "6px 12px" }}>
            <div style={{ fontSize: 9, color: "#555" }}>NPL SEKARANG</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: game.npl <= 3 ? "#22c55e" : game.npl <= 5 ? "#f59e0b" : "#ef4444", fontFamily: "monospace" }}>{game.npl}%</div>
          </div>
          <div style={{ fontSize: 20, color: "#333" }}>→</div>
          {forecastDays.map((f) => {
            const fc = f.npl <= 3 ? "#22c55e" : f.npl <= 5 ? "#f59e0b" : "#ef4444";
            return (
              <div key={f.day} style={{ background: "#0d0d14", borderRadius: 8, padding: "6px 12px", flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#555" }}>{f.day}H LAGI</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: fc, fontFamily: "monospace" }}>{f.npl}%</div>
                <div style={{ fontSize: 8, color: f.npl > game.npl ? "#ef4444" : "#22c55e" }}>{f.npl > game.npl ? "↑ Naik" : "↓ Turun"}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: "#555", padding: "6px 10px", background: "#0d0d14", borderRadius: 6 }}>
          {nplTrend > 0.01
            ? "⚠️ Tren NPL menanjak — pertimbangkan perketat seleksi kredit atau training analis."
            : nplTrend < -0.01
            ? "✅ Tren NPL membaik — kualitas portofolio kredit terjaga."
            : "📊 NPL stabil — tidak ada perubahan signifikan dalam 7 hari terakhir."}
        </div>
      </div>

      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 10 }}>👔 Produktivitas Staf</div>
        {prodList.length === 0 && <div style={{ fontSize: 11, color: "#555", textAlign: "center", padding: 16 }}>Data produktivitas akan terkumpul setelah beberapa hari.</div>}
        {prodList.map((p, i) => {
          const role = STAFF_ROLES[p.role];
          const wlColor = p.avgWorkload >= 80 ? "#ef4444" : p.avgWorkload >= 60 ? "#f59e0b" : "#22c55e";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #1a1a24" }}>
              <span style={{ fontSize: 16 }}>{role ? role.icon : "👤"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#ddd", fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 9, color: "#555" }}>{role ? role.label : "Staf"} · {p.days} hari aktif</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace" }}>{p.totalHandled} handled</div>
                <div style={{ fontSize: 9, color: wlColor }}>avg beban {p.avgWorkload}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// src/app/leaderboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function fmt(n: number): string {
  if (n >= 1e9) return "Rp" + (n / 1e9).toFixed(2) + "M";
  if (n >= 1e6) return "Rp" + (n / 1e6).toFixed(0) + "jt";
  return "Rp" + n.toLocaleString();
}

const DIFF_COLOR: Record<string, string> = {
  easy: "#22c55e", normal: "#f59e0b", hard: "#ef4444",
};
const DIFF_LABEL: Record<string, string> = {
  easy: "Mudah", normal: "Normal", hard: "Sulit",
};
const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);

  const entries = await prisma.leaderboardEntry.findMany({
    orderBy: { totalProfit: "desc" },
    take: 50,
    include: { user: { select: { name: true, email: true, image: true } } },
  });

  // Aktif hari ini = GameSave yang ter-update sejak tengah malam WIB (UTC+7)
  const WIB_OFFSET = 7 * 60 * 60 * 1000;
  const wibNow = new Date(Date.now() + WIB_OFFSET);
  const startOfTodayWIB = new Date(Date.UTC(wibNow.getUTCFullYear(), wibNow.getUTCMonth(), wibNow.getUTCDate()) - WIB_OFFSET);

  const activeSaves = await prisma.gameSave.findMany({
    where: { updatedAt: { gte: startOfTodayWIB } },
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { name: true } } },
  });
  const seenUsers = new Set<string>();
  const activeToday = activeSaves.filter((s) => {
    if (seenUsers.has(s.userId)) return false;
    seenUsers.add(s.userId);
    return true;
  }).slice(0, 20);

  return (
    <>
      <style>{`
        .lb-wrap { min-height:100vh; background:#080810; color:#e0e0e0; font-family:'Segoe UI',sans-serif; padding:24px 16px; max-width:720px; margin:0 auto; }
        .lb-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; }
        .lb-legend { display:flex; gap:16px; margin-bottom:16px; font-size:10px; color:#555; background:#0e0e18; border-radius:10px; padding:8px 14px; border:1px solid #1a1a2e; flex-wrap:wrap; }
        .lb-active-row { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; -webkit-overflow-scrolling:touch; }
        .lb-active-card { flex-shrink:0; min-width:140px; max-width:160px; background:#0e0e18; border:1px solid #22c55e22; border-radius:10px; padding:8px 12px; }

        /* Desktop table */
        .lb-thead { display:grid; grid-template-columns:36px 1fr 130px 90px 54px 46px 58px; gap:6px; padding:8px 14px; background:#0d0d14; border-radius:10px 10px 0 0; border:1px solid #1a1a2e; border-bottom:none; font-size:9px; color:#555; text-transform:uppercase; letter-spacing:1px; }
        .lb-tbody { border:1px solid #1a1a2e; border-radius:0 0 14px 14px; overflow:hidden; }
        .lb-row { display:grid; grid-template-columns:36px 1fr 130px 90px 54px 46px 58px; gap:6px; padding:10px 14px; border-bottom:1px solid #1a1a2e; align-items:center; }
        .lb-row:last-child { border-bottom:none; }

        /* Mobile: hide table layout, show cards */
        .lb-col-profit, .lb-col-eff, .lb-col-npl, .lb-col-rep, .lb-col-lv { display:block; }
        .lb-card-stats { display:none; }

        @media (max-width: 599px) {
          .lb-thead { display:none; }
          .lb-row { grid-template-columns:36px 1fr; grid-template-rows:auto auto; column-gap:8px; row-gap:0; padding:10px 12px; }
          .lb-col-profit { display:none; }
          .lb-col-eff    { display:none; }
          .lb-col-npl    { display:none; }
          .lb-col-rep    { display:none; }
          .lb-col-lv     { display:none; }
          .lb-card-stats { display:flex; flex-wrap:wrap; gap:6px; margin-top:5px; font-size:10px; grid-column:2; }
        }
      `}</style>

      <div className="lb-wrap">
        {/* Header */}
        <div className="lb-header">
          <div>
            <Link href="/dashboard" style={{ color: "#555", fontSize: 12, textDecoration: "none" }}>← Kembali ke Game</Link>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#c8a96e", marginTop: 4, marginBottom: 2 }}>
              🏆 Leaderboard Global
            </h1>
            <p style={{ fontSize: 11, color: "#444", margin: 0 }}>Skor disubmit otomatis saat menang · Top 50</p>
          </div>
          {session && (
            <span style={{ fontSize: 11, color: "#555", background: "#0e0e18", padding: "6px 12px", borderRadius: 8, border: "1px solid #1a1a2e", whiteSpace: "nowrap" }}>
              👤 {session.user.name}
            </span>
          )}
        </div>

        {/* Aktif hari ini */}
        {activeToday.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Aktif Hari Ini ({activeToday.length})
            </div>
            <div className="lb-active-row">
              {activeToday.map((s) => {
                const gs = s.gameState as any;
                const bankName = gs?.game?.bankName || "Bank Nusantara";
                const dc = DIFF_COLOR[s.difficulty] || "#aaa";
                return (
                  <div key={s.id} className="lb-active-card">
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#ddd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.user?.name || "Pemain"}
                    </div>
                    <div style={{ fontSize: 10, color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      🏦 {bankName}
                    </div>
                    <div style={{ fontSize: 9, marginTop: 2, whiteSpace: "nowrap" }}>
                      <span style={{ color: dc }}>{DIFF_LABEL[s.difficulty] || s.difficulty}</span>
                      <span style={{ color: "#444" }}> · Hari {s.day} · Lv.{s.level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="lb-legend">
          <span>⚡ <b style={{ color: "#f59e0b" }}>Efisiensi</b> = Profit ÷ Hari</span>
          <span>📉 <b style={{ color: "#60a5fa" }}>NPL</b> = Non-Performing Loan (rendah = bagus)</span>
          <span>⭐ <b style={{ color: "#a78bfa" }}>Rep</b> = Reputasi Bank</span>
        </div>

        {/* Table header (desktop only) */}
        <div className="lb-thead">
          <span>#</span>
          <span>Pemain &amp; Bank</span>
          <span style={{ textAlign: "right" }}>Total Profit</span>
          <span style={{ textAlign: "right" }}>Efisiensi</span>
          <span style={{ textAlign: "center" }}>NPL</span>
          <span style={{ textAlign: "center" }}>Rep</span>
          <span style={{ textAlign: "center" }}>Level</span>
        </div>

        {/* Entries */}
        <div className="lb-tbody">
          {entries.map((entry, i) => {
            const isMe = session?.user?.email === entry.user?.email;
            const profit = Number(entry.totalProfit);
            const eff = Math.round(profit / Math.max(entry.day, 1));
            const npl = (entry as any).npl ?? 0;
            const rep = (entry as any).reputation ?? 0;
            const bankName = (entry as any).bankName || "Bank Nusantara";
            const nplColor = npl <= 3 ? "#22c55e" : npl <= 5 ? "#f59e0b" : "#ef4444";
            const repColor = rep >= 70 ? "#22c55e" : rep >= 40 ? "#f59e0b" : "#ef4444";
            const dc = DIFF_COLOR[entry.difficulty] || "#aaa";

            return (
              <div key={entry.id} className="lb-row" style={{
                background: isMe ? "rgba(200,169,110,0.06)" : i % 2 === 0 ? "#0e0e18" : "#0b0b14",
              }}>
                {/* Rank */}
                <span style={{ fontSize: i < 3 ? 16 : 12, textAlign: "center", color: i < 3 ? undefined : "#555", fontWeight: 700 }}>
                  {i < 3 ? MEDALS[i] : i + 1}
                </span>

                {/* Pemain + Bank */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: isMe ? "#c8a96e" : "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.playerName}{isMe ? " 👈" : ""}
                  </div>
                  <div style={{ fontSize: 10, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🏦 {bankName} ·{" "}
                    <span style={{ color: dc }}>{DIFF_LABEL[entry.difficulty] || entry.difficulty}</span>
                    {" · Hari "}{entry.day}
                  </div>

                  {/* Mobile stats row */}
                  <div className="lb-card-stats">
                    <span style={{ color: "#22c55e", fontFamily: "monospace", fontWeight: 700 }}>{fmt(profit)}</span>
                    <span style={{ color: "#333" }}>·</span>
                    <span style={{ color: "#f59e0b", fontFamily: "monospace" }}>⚡{fmt(eff)}/hr</span>
                    {npl > 0 && <><span style={{ color: "#333" }}>·</span><span style={{ color: nplColor }}>NPL {npl.toFixed(1)}%</span></>}
                    {rep > 0 && <><span style={{ color: "#333" }}>·</span><span style={{ color: repColor }}>Rep {rep}%</span></>}
                    <span style={{ color: dc, background: dc + "18", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>Lv.{entry.level}</span>
                  </div>
                </div>

                {/* Total Profit (desktop) */}
                <div className="lb-col-profit" style={{ textAlign: "right", fontFamily: "monospace", color: "#22c55e", fontSize: 12, fontWeight: 700 }}>
                  {fmt(profit)}
                </div>

                {/* Efisiensi (desktop) */}
                <div className="lb-col-eff" style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>{fmt(eff)}</div>
                  <div style={{ fontSize: 9, color: "#444" }}>/hari</div>
                </div>

                {/* NPL (desktop) */}
                <div className="lb-col-npl" style={{ textAlign: "center", fontFamily: "monospace", fontSize: 11, color: nplColor, fontWeight: 700 }}>
                  {npl > 0 ? npl.toFixed(1) + "%" : "—"}
                </div>

                {/* Reputasi (desktop) */}
                <div className="lb-col-rep" style={{ textAlign: "center", fontFamily: "monospace", fontSize: 11, color: repColor, fontWeight: 700 }}>
                  {rep > 0 ? rep + "%" : "—"}
                </div>

                {/* Level (desktop) */}
                <div className="lb-col-lv" style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: dc, background: dc + "18", padding: "2px 7px", borderRadius: 5 }}>
                    Lv.{entry.level}
                  </span>
                </div>
              </div>
            );
          })}

          {entries.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "#444", background: "#0e0e18" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🏆</div>
              <div style={{ fontWeight: 700, color: "#555" }}>Belum ada skor.</div>
              <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>Jadilah yang pertama menang dan masuk leaderboard!</div>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#2a2a3a", fontSize: 10, marginTop: 16 }}>
          Skor disubmit otomatis saat menang · Data diperbarui real-time
        </p>
      </div>
    </>
  );
}

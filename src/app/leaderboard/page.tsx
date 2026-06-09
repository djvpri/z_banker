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

  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      color: "#e0e0e0", fontFamily: "'Segoe UI', sans-serif",
      padding: "24px 16px", maxWidth: 720, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <Link href="/dashboard" style={{ color: "#555", fontSize: 12, textDecoration: "none" }}>← Kembali ke Game</Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#c8a96e", marginTop: 4, marginBottom: 2 }}>
            🏆 Leaderboard Global
          </h1>
          <p style={{ fontSize: 11, color: "#444", margin: 0 }}>Skor disubmit otomatis saat menang · Top 50</p>
        </div>
        {session && (
          <span style={{ fontSize: 11, color: "#555", background: "#0e0e18", padding: "6px 12px", borderRadius: 8, border: "1px solid #1a1a2e" }}>
            👤 {session.user.name}
          </span>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 16, marginBottom: 16, fontSize: 10, color: "#555",
        background: "#0e0e18", borderRadius: 10, padding: "8px 14px",
        border: "1px solid #1a1a2e", flexWrap: "wrap",
      }}>
        <span>⚡ <b style={{ color: "#f59e0b" }}>Efisiensi</b> = Profit ÷ Hari (lebih tinggi = lebih cepat menang)</span>
        <span>📉 <b style={{ color: "#60a5fa" }}>NPL</b> = Non-Performing Loan (lebih rendah lebih baik)</span>
        <span>⭐ <b style={{ color: "#a78bfa" }}>Rep</b> = Reputasi Bank</span>
      </div>

      {/* Table header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 130px 90px 54px 46px 58px",
        gap: 6, padding: "8px 14px",
        background: "#0d0d14", borderRadius: "10px 10px 0 0",
        border: "1px solid #1a1a2e", borderBottom: "none",
        fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 1,
      }}>
        <span>#</span>
        <span>Pemain &amp; Bank</span>
        <span style={{ textAlign: "right" }}>Total Profit</span>
        <span style={{ textAlign: "right" }}>Efisiensi</span>
        <span style={{ textAlign: "center" }}>NPL</span>
        <span style={{ textAlign: "center" }}>Rep</span>
        <span style={{ textAlign: "center" }}>Level</span>
      </div>

      {/* Entries */}
      <div style={{ border: "1px solid #1a1a2e", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
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
            <div key={entry.id} style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 130px 90px 54px 46px 58px",
              gap: 6, padding: "10px 14px",
              borderBottom: "1px solid #1a1a2e",
              background: isMe ? "rgba(200,169,110,0.06)" : i % 2 === 0 ? "#0e0e18" : "#0b0b14",
              alignItems: "center",
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
              </div>

              {/* Total Profit */}
              <div style={{ textAlign: "right", fontFamily: "monospace", color: "#22c55e", fontSize: 12, fontWeight: 700 }}>
                {fmt(profit)}
              </div>

              {/* Efisiensi */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>
                  {fmt(eff)}
                </div>
                <div style={{ fontSize: 9, color: "#444" }}>/hari</div>
              </div>

              {/* NPL */}
              <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 11, color: nplColor, fontWeight: 700 }}>
                {npl > 0 ? npl.toFixed(1) + "%" : "—"}
              </div>

              {/* Reputasi */}
              <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 11, color: repColor, fontWeight: 700 }}>
                {rep > 0 ? rep + "%" : "—"}
              </div>

              {/* Level */}
              <div style={{ textAlign: "center" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: dc, background: dc + "18",
                  padding: "2px 7px", borderRadius: 5,
                }}>
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
  );
}

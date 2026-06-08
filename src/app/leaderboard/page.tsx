// src/app/leaderboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const BRANCH_NAMES: Record<number, string> = {
  0: "Cabang Kecil 🏠",
  1: "Cabang Madya 🏢",
  2: "Kantor Pusat 🏙️",
};

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);

  const entries = await prisma.leaderboardEntry.findMany({
    orderBy: { totalProfit: "desc" },
    take: 50,
    include: { user: { select: { name: true, image: true } } },
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      color: "#e0e0e0", fontFamily: "'Segoe UI', sans-serif",
      padding: "24px 16px", maxWidth: 680, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <Link href="/dashboard" style={{ color: "#555", fontSize: 12, textDecoration: "none" }}>← Kembali</Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#c8a96e", marginTop: 4 }}>
            🏆 Leaderboard Global
          </h1>
        </div>
        {session && (
          <span style={{ fontSize: 11, color: "#555", background: "#0e0e18", padding: "4px 10px", borderRadius: 6 }}>
            👤 {session.user.name}
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "40px 1fr 120px 80px 70px",
          gap: 8, padding: "10px 16px",
          background: "#0d0d14", borderBottom: "1px solid #1a1a2e",
          fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 1,
        }}>
          <span>#</span>
          <span>Pemain</span>
          <span style={{ textAlign: "right" }}>Total Profit</span>
          <span style={{ textAlign: "center" }}>Hari</span>
          <span style={{ textAlign: "center" }}>Difficulty</span>
        </div>

        {entries.map((entry, i) => {
          const isCurrentUser = session?.user?.email === entry.user?.name;
          const profitNum = Number(entry.totalProfit);
          const profitStr = profitNum >= 1e9
            ? "Rp" + (profitNum / 1e9).toFixed(1) + "M"
            : "Rp" + (profitNum / 1e6).toFixed(0) + "jt";
          const diffColors: Record<string, string> = {
            easy: "#22c55e", normal: "#f59e0b", hard: "#ef4444"
          };
          const medals = ["🥇","🥈","🥉"];

          return (
            <div key={entry.id} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 120px 80px 70px",
              gap: 8, padding: "11px 16px",
              borderBottom: "1px solid #1a1a2e",
              background: isCurrentUser ? "rgba(200,169,110,0.05)" : "transparent",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 14, textAlign: "center" }}>
                {i < 3 ? medals[i] : `${i + 1}`}
              </span>
              <div>
                <div style={{ fontWeight: 700, color: isCurrentUser ? "#c8a96e" : "#ddd", fontSize: 12 }}>
                  {entry.playerName}
                  {isCurrentUser && " (Kamu)"}
                </div>
                <div style={{ fontSize: 9, color: "#444" }}>{entry.branch}</div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "monospace", color: "#22c55e", fontSize: 12, fontWeight: 700 }}>
                {profitStr}
              </div>
              <div style={{ textAlign: "center", fontSize: 11, color: "#aaa" }}>
                Hari {entry.day}
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  color: diffColors[entry.difficulty] || "#aaa",
                  background: (diffColors[entry.difficulty] || "#aaa") + "18",
                  padding: "2px 6px", borderRadius: 4,
                }}>
                  {entry.difficulty}
                </span>
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#444" }}>
            Belum ada skor. Jadilah yang pertama! 🏆
          </div>
        )}
      </div>

      <p style={{ textAlign: "center", color: "#333", fontSize: 10, marginTop: 16 }}>
        Skor disubmit otomatis saat menang. Update tiap hari.
      </p>
    </div>
  );
}

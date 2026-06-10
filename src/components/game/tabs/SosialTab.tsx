// src/components/game/tabs/SosialTab.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import { fmt } from "@/lib/gameFormat";
import { DIFFICULTY_CONFIG } from "@/types/game";

interface FriendEntry {
  friendshipId: string;
  id: string;
  name: string | null;
  image: string | null;
  bankName: string;
  totalProfit: number;
  day: number;
  level: number;
  difficulty: string;
}

interface RequestEntry {
  friendshipId: string;
  id: string;
  name: string | null;
  image: string | null;
}

interface BoardEntry {
  id: string;
  name: string | null;
  image: string | null;
  bankName: string;
  totalProfit: number;
  day: number;
  level: number;
  difficulty: string;
  isMe: boolean;
}

interface FriendsData {
  friendCode: string;
  friends: FriendEntry[];
  incoming: RequestEntry[];
  outgoing: RequestEntry[];
  board: BoardEntry[];
}

const diffMeta = (difficulty: string) => {
  const cfg = (DIFFICULTY_CONFIG as Record<string, { label: string; color: string }>)[difficulty];
  return cfg ? { label: cfg.label, color: cfg.color } : { label: difficulty, color: "#aaa" };
};

export default function SosialTab() {
  const addNotif = useGameStore((s) => s.addNotif);
  const [data, setData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/friends");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      addNotif("❌ Gagal memuat data sosial.", "danger");
    } finally {
      setLoading(false);
    }
  }, [addNotif]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!code.trim()) return;
    setBusy("add");
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        addNotif("❌ " + (json.error || "Gagal menambah teman"), "danger");
      } else {
        addNotif(json.status === "accepted" ? "🎉 Kalian sekarang berteman!" : "✅ Permintaan pertemanan terkirim!", "success");
        setCode("");
        load();
      }
    } catch {
      addNotif("❌ Gagal menambah teman.", "danger");
    } finally {
      setBusy(null);
    }
  };

  const respond = async (friendshipId: string, action: "accept" | "decline" | "cancel" | "remove") => {
    setBusy(friendshipId);
    try {
      const res = await fetch("/api/friends/" + friendshipId, { method: action === "accept" ? "PATCH" : "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        addNotif("❌ " + (json.error || "Aksi gagal"), "danger");
      } else {
        if (action === "accept") addNotif("🎉 Permintaan diterima!", "success");
        else if (action === "decline") addNotif("Permintaan ditolak.", "info");
        else if (action === "cancel") addNotif("Permintaan dibatalkan.", "info");
        else addNotif("Teman dihapus.", "info");
        load();
      }
    } catch {
      addNotif("❌ Aksi gagal, coba lagi.", "danger");
    } finally {
      setBusy(null);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard?.writeText(data.friendCode).then(() => {
      addNotif("📋 Kode teman disalin!", "success");
    }).catch(() => {});
  };

  const handleInviteWA = () => {
    const codeText = data ? " Kode temanku: " + data.friendCode + "." : "";
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const msg = "Yuk main Z Banker, game simulasi manajemen bank! 🏦" + codeText + " Setelah main, tambahkan aku sebagai teman di tab Sosial ya. " + url;
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40, color: "#555", fontSize: 12 }}>Memuat data sosial...</div>;
  }
  if (!data) {
    return <div style={{ textAlign: "center", padding: 40, color: "#ef4444", fontSize: 12 }}>Gagal memuat data. Coba refresh halaman.</div>;
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e", marginBottom: 4 }}>🤝 Sosial & Teman</div>
      <div style={{ fontSize: 10, color: "#555", marginBottom: 10 }}>{data.friends.length} teman</div>

      {/* Kode teman & undang via WA */}
      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 11, padding: 13, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#666", marginBottom: 6, fontWeight: 700 }}>KODE TEMAN KAMU</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800, letterSpacing: 4, color: "#c8a96e", background: "#0d0d14", border: "1px solid #c8a96e33", borderRadius: 8, padding: "8px 16px", flex: 1, textAlign: "center" }}>
            {data.friendCode}
          </div>
          <button onClick={handleCopy} style={{ background: "#1a1a2e", border: "1px solid #333", color: "#aaa", borderRadius: 7, padding: "10px 12px", cursor: "pointer", fontSize: 13 }}>📋</button>
        </div>
        <button onClick={handleInviteWA} style={{ width: "100%", background: "linear-gradient(135deg,#25d366,#128c4a)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          💬 Undang Teman lewat WhatsApp
        </button>
      </div>

      {/* Tambah teman */}
      <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 11, padding: 13, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#666", marginBottom: 6, fontWeight: 700 }}>TAMBAH TEMAN PAKAI KODE</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Masukkan kode teman..."
            maxLength={12}
            style={{ flex: 1, background: "#0d0d14", border: "1px solid #333", borderRadius: 7, padding: "9px 12px", color: "#ddd", fontSize: 12, fontFamily: "monospace", letterSpacing: 2 }}
          />
          <button
            onClick={handleAdd}
            disabled={busy === "add" || !code.trim()}
            style={{ background: code.trim() ? "linear-gradient(135deg,#c8a96e,#8a6030)" : "#222", color: code.trim() ? "#000" : "#555", border: "none", borderRadius: 7, padding: "9px 16px", cursor: code.trim() ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 700 }}>
            Tambah
          </button>
        </div>
      </div>

      {/* Permintaan masuk */}
      {data.incoming.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 7 }}>📥 Permintaan Masuk ({data.incoming.length})</div>
          {data.incoming.map((r) => (
            <div key={r.friendshipId} style={{ background: "#0d1a0d", border: "1px solid #22c55e33", borderRadius: 10, padding: 10, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#ddd", fontWeight: 700 }}>{r.name || "Pemain"}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => respond(r.friendshipId, "accept")} disabled={busy === r.friendshipId} style={{ background: "#22c55e18", border: "1px solid #22c55e33", color: "#22c55e", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✅ Terima</button>
                <button onClick={() => respond(r.friendshipId, "decline")} disabled={busy === r.friendshipId} style={{ background: "#ef444418", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✗</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permintaan keluar */}
      {data.outgoing.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 7 }}>📤 Menunggu Konfirmasi ({data.outgoing.length})</div>
          {data.outgoing.map((r) => (
            <div key={r.friendshipId} style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 10, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>{r.name || "Pemain"}</span>
              <button onClick={() => respond(r.friendshipId, "cancel")} disabled={busy === r.friendshipId} style={{ background: "#1a1a2e", border: "1px solid #333", color: "#888", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11 }}>Batalkan</button>
            </div>
          ))}
        </div>
      )}

      {/* Daftar teman */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#c8a96e", marginBottom: 7 }}>👥 Daftar Teman ({data.friends.length})</div>
        {data.friends.length === 0 ? (
          <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 12, padding: 24, textAlign: "center", color: "#555", fontSize: 11 }}>
            Belum ada teman. Undang lewat WhatsApp atau tambahkan pakai kode teman!
          </div>
        ) : data.friends.map((f) => {
          const dm = diffMeta(f.difficulty);
          return (
            <div key={f.friendshipId} style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 10, padding: 11, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd" }}>{f.name || "Pemain"}</div>
                <div style={{ fontSize: 10, color: "#555" }}>
                  🏦 {f.bankName} · <span style={{ color: dm.color }}>{dm.label}</span> · Hari {f.day} · Lv.{f.level}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "monospace", color: "#22c55e", fontSize: 12, fontWeight: 700 }}>{fmt(f.totalProfit)}</span>
                <button onClick={() => respond(f.friendshipId, "remove")} disabled={busy === f.friendshipId} style={{ background: "transparent", border: "none", color: "#444", cursor: "pointer", fontSize: 13 }}>✗</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard teman */}
      {data.board.length > 1 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", marginBottom: 7 }}>🏆 Leaderboard Teman</div>
          {data.board.map((b, i) => (
            <div key={b.id} style={{ background: b.isMe ? "rgba(200,169,110,0.06)" : i % 2 === 0 ? "#0e0e18" : "#0b0b14", border: "1px solid #1a1a2e", borderRadius: 10, padding: "9px 12px", marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: i < 3 ? "#f59e0b" : "#555", fontWeight: 700, width: 18, textAlign: "center" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.isMe ? "#c8a96e" : "#ddd" }}>{b.name || "Pemain"}{b.isMe ? " 👈" : ""}</span>
              </div>
              <span style={{ fontFamily: "monospace", color: "#22c55e", fontSize: 12, fontWeight: 700 }}>{fmt(b.totalProfit)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

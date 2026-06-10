// src/components/layout/LandingPage.tsx
"use client";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: "💰", title: "Kelola Kredit & Tabungan", desc: "Terima/tolak nasabah, nego bunga, kelola risiko & kolateral." },
  { icon: "👥", title: "Tim & SDM", desc: "Rekrut teller, CS, analis & manajer — kelola beban kerja dan moral tim." },
  { icon: "📊", title: "CAMELS Rating", desc: "Jaga CAR, NPL, LDR, NIM tetap sehat sesuai standar OJK/BI." },
  { icon: "🌍", title: "Ekspansi Kota", desc: "Buka cabang di 6 kota besar dan akuisisi bank rival." },
  { icon: "🏆", title: "Leaderboard Global", desc: "Bersaing dengan pemain lain, skor disubmit otomatis saat menang." },
  { icon: "📱", title: "Auto-Save Cloud", desc: "Progress tersimpan otomatis, lanjut main di device manapun." },
];

export default function LandingPage() {
  return (
    <div className="lp-root">
      <style>{`
        @keyframes goldShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .lp-root { min-height:100vh; background:#080810; font-family:'Segoe UI',sans-serif; position:relative; overflow:hidden; padding-bottom:56px; }
        .lp-container { position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:48px 24px 24px; }
        .lp-hero { display:flex; flex-direction:column; align-items:center; text-align:center; gap:32px; min-height:60vh; justify-content:center; }
        .lp-hero-left { max-width:480px; display:flex; flex-direction:column; align-items:center; }
        .lp-mockup { width:100%; max-width:380px; }
        .lp-features { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:48px; }
        .lp-feature-card { background:#0e0e18; border:1px solid #1a1a2e; border-radius:14px; padding:18px; text-align:left; transition:border-color .2s; }
        .lp-feature-card:hover { border-color:rgba(200,169,110,0.35); }
        .lp-feature-icon { font-size:24px; margin-bottom:8px; }
        .lp-feature-title { font-size:13px; font-weight:700; color:#ddd; margin-bottom:4px; }
        .lp-feature-desc { font-size:11px; color:#666; line-height:1.5; }

        @media (min-width: 860px) {
          .lp-hero { flex-direction:row; align-items:center; text-align:left; gap:64px; justify-content:space-between; }
          .lp-hero-left { align-items:flex-start; }
          .lp-hero-left .lp-pills { justify-content:flex-start; }
          .lp-hero-left .lp-cta { align-items:stretch; }
        }
        @media (max-width: 859px) {
          .lp-mockup { max-width:340px; margin:0 auto; }
        }
        @media (max-width: 700px) {
          .lp-features { grid-template-columns:1fr; }
        }
        @media (min-width: 701px) and (max-width: 859px) {
          .lp-features { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#c8a96e 1px, transparent 1px), linear-gradient(90deg, #c8a96e 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Glow left */}
      <div style={{
        position: "absolute", top: "20%", left: "15%", transform: "translate(-50%,-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Glow right */}
      <div style={{
        position: "absolute", top: "35%", right: "5%", transform: "translate(50%,-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="lp-container">
        <div className="lp-hero">
          {/* ── Left: Branding & CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lp-hero-left"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
              style={{ fontSize: 64, marginBottom: 12 }}
            >
              🏦
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: 48, fontWeight: 800, letterSpacing: -1,
                background: "linear-gradient(135deg, #c8a96e, #e8c88e, #c8a96e)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "goldShimmer 3s linear infinite",
                marginBottom: 6,
              }}
            >
              Z Banker
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: "#777", fontSize: 16, marginBottom: 8, letterSpacing: 1 }}
            >
              Bank Manager Simulator · Indonesia
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{ color: "#555", fontSize: 13, marginBottom: 28, maxWidth: 420, lineHeight: 1.6 }}
            >
              Jadi direktur bank: kelola kredit, tim, ekspansi, dan jaga kesehatan bank
              tetap sehat — sambil bersaing di leaderboard global.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="lp-pills"
              style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}
            >
              {["💰 Kelola Kredit","👥 Tim Staf","📊 CAMELS Rating","🌍 Ekspansi Kota","🏆 Leaderboard","📱 Auto-Save"].map((f) => (
                <span key={f} style={{
                  background: "rgba(200,169,110,0.08)",
                  border: "1px solid rgba(200,169,110,0.2)",
                  color: "#c8a96e",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {f}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="lp-cta"
              style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%", maxWidth: 340 }}
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(200,169,110,0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                style={{
                  background: "linear-gradient(135deg, #c8a96e, #8a6030)",
                  color: "#000",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 40px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 0.5,
                  width: "100%",
                }}
              >
                🔵 Masuk dengan Google
              </motion.button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                <div style={{ flex: 1, height: 1, background: "#2a2a3a" }} />
                <span style={{ fontSize: 11, color: "#444" }}>atau</span>
                <div style={{ flex: 1, height: 1, background: "#2a2a3a" }} />
              </div>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(200,169,110,0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = "/auth/signin"}
                style={{
                  background: "transparent",
                  color: "#c8a96e",
                  border: "1px solid rgba(200,169,110,0.4)",
                  borderRadius: 12,
                  padding: "13px 40px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 0.5,
                  width: "100%",
                }}
              >
                ✉️ Masuk dengan Email
              </motion.button>
            </motion.div>

            <p style={{ color: "#333", fontSize: 11, marginTop: 16 }}>
              Progress tersimpan otomatis · Gratis selamanya
            </p>
          </motion.div>

          {/* ── Right: Dashboard preview mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="lp-mockup"
          >
            <div style={{ background: "#0e0e18", border: "1px solid #1a1a2e", borderRadius: 16, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              {/* header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#c8a96e" }}>🏦 Bank Nusantara</span>
                <span style={{ fontSize: 10, color: "#a78bfa", background: "#a78bfa18", padding: "2px 8px", borderRadius: 6 }}>Lv.3 · Hari 42</span>
              </div>

              {/* stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div style={{ background: "#0d0d14", border: "1px solid #1a1a2e", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 9, color: "#555", marginBottom: 4 }}>PROFIT HARI INI</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", fontFamily: "monospace" }}>+Rp 4,2jt</div>
                </div>
                <div style={{ background: "#0d0d14", border: "1px solid #1a1a2e", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 9, color: "#555", marginBottom: 4 }}>TOTAL PROFIT</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace" }}>Rp 1,8M</div>
                </div>
              </div>

              {/* health bars */}
              <div style={{ background: "#0d0d14", border: "1px solid #1a1a2e", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", marginBottom: 10 }}>🎯 Kesehatan Bank</div>
                {[
                  { label: "CAR", val: 74, color: "#22c55e", text: "18.5%" },
                  { label: "NPL", val: 28, color: "#22c55e", text: "1.4%" },
                  { label: "Reputasi", val: 75, color: "#a78bfa", text: "75%" },
                ].map((b) => (
                  <div key={b.label} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", marginBottom: 3 }}>
                      <span>{b.label}</span><span style={{ color: b.color, fontFamily: "monospace" }}>{b.text}</span>
                    </div>
                    <div style={{ height: 5, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: b.val + "%", height: "100%", background: b.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* mini leaderboard */}
              <div style={{ background: "#0d0d14", border: "1px solid #1a1a2e", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", marginBottom: 8 }}>🏆 Leaderboard</div>
                {[
                  { medal: "🥇", name: "BankCorp Jaya", val: "Rp 12,4M" },
                  { medal: "🥈", name: "Kamu", val: "Rp 9,8M", me: true },
                  { medal: "🥉", name: "Mandiri Sentosa", val: "Rp 8,1M" },
                ].map((r) => (
                  <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, padding: "4px 0", color: r.me ? "#c8a96e" : "#999" }}>
                    <span>{r.medal} {r.name}</span>
                    <span style={{ fontFamily: "monospace", color: "#22c55e" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Feature grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="lp-features"
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div className="lp-feature-icon">{f.icon}</div>
              <div className="lp-feature-title">{f.title}</div>
              <div className="lp-feature-desc">{f.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer kontak */}
      <div style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid #1a1a2e",
        marginTop: 48,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 24, flexWrap: "wrap",
      }}>
        <span style={{ color: "#333", fontSize: 11 }}>© Muhammad Adi Juprianto</span>
        <a
          href="https://wa.me/6282153533164"
          target="_blank" rel="noopener noreferrer"
          style={{ color: "#555", fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
        >
          <span style={{ color: "#25d366" }}>●</span> WhatsApp
        </a>
        <a
          href="https://www.linkedin.com/in/muhammad-andi-juprianto-s-pd-mm-380745192"
          target="_blank" rel="noopener noreferrer"
          style={{ color: "#555", fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
        >
          <span style={{ color: "#0077b5" }}>●</span> LinkedIn
        </a>
        <a
          href="mailto:sentarummedia@gmail.com"
          style={{ color: "#555", fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
        >
          <span style={{ color: "#c8a96e" }}>●</span> sentarummedia@gmail.com
        </a>
      </div>
    </div>
  );
}

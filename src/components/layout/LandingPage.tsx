// src/components/layout/LandingPage.tsx
"use client";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
      padding: 20,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#c8a96e 1px, transparent 1px), linear-gradient(90deg, #c8a96e 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          style={{ fontSize: 72, marginBottom: 16 }}
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
            marginBottom: 8,
          }}
        >
          Z Banker
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: "#666", fontSize: 16, marginBottom: 48, letterSpacing: 1 }}
        >
          Bank Manager Simulator · Indonesia
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}
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
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
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
          }}
        >
          🚀 Mulai Bermain dengan Google
        </motion.button>

        <p style={{ color: "#333", fontSize: 11, marginTop: 16 }}>
          Progress tersimpan otomatis · Gratis selamanya
        </p>
      </motion.div>

      <style>{`
        @keyframes goldShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
    }

    const result = await signIn("credentials", {
      email, password, redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError(mode === "login" ? "Email atau password salah" : "Gagal masuk setelah daftar");
    } else {
      router.push("/dashboard");
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    background: "#0d0d14", border: "1px solid #2a2a3a",
    color: "#ddd", fontSize: 13, outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#13131e", border: "1px solid #1a1a2e",
        borderRadius: 16, padding: 32, width: "100%", maxWidth: 380,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏦</div>
          <div style={{
            fontWeight: 800, fontSize: 20,
            background: "linear-gradient(135deg,#c8a96e,#e8c88e)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Z Banker</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Bank Manager Simulator</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#0d0d14", borderRadius: 8, padding: 3, marginBottom: 20 }}>
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
              background: mode === m ? "#1a1a2e" : "transparent",
              color: mode === m ? "#c8a96e" : "#555",
              fontWeight: mode === m ? 700 : 400, fontSize: 12, cursor: "pointer",
            }}>
              {m === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <input
              placeholder="Nama (opsional)"
              value={name} onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email" placeholder="Email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Password (min. 6 karakter)" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && (
            <div style={{ fontSize: 11, color: "#ef4444", background: "#ef444415", padding: "8px 12px", borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: 11, borderRadius: 8, border: "none",
            background: "linear-gradient(135deg,#c8a96e,#8a6030)",
            color: "#000", fontWeight: 700, fontSize: 13,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar & Masuk"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#1a1a2e" }} />
          <span style={{ fontSize: 11, color: "#444" }}>atau masuk dengan</span>
          <div style={{ flex: 1, height: 1, background: "#1a1a2e" }} />
        </div>

        {/* OAuth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} style={{
            padding: "10px 14px", borderRadius: 8, border: "1px solid #2a2a3a",
            background: "#0d0d14", color: "#ddd", fontSize: 12, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span>🔵</span> Google
          </button>
          <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} style={{
            padding: "10px 14px", borderRadius: 8, border: "1px solid #2a2a3a",
            background: "#0d0d14", color: "#ddd", fontSize: 12, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span>⚫</span> GitHub
          </button>
          <button onClick={() => signIn("discord", { callbackUrl: "/dashboard" })} style={{
            padding: "10px 14px", borderRadius: 8, border: "1px solid #2a2a3a",
            background: "#0d0d14", color: "#ddd", fontSize: 12, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span>🟣</span> Discord
          </button>
        </div>
      </div>
    </div>
  );
}

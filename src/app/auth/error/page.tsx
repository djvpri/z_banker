"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ERRORS: Record<string, string> = {
  OAuthSignin: "Gagal memulai login OAuth.",
  OAuthCallback: "Gagal proses callback OAuth.",
  OAuthAccountNotLinked: "Email ini sudah terdaftar dengan metode login lain.",
  CredentialsSignin: "Email atau password salah.",
  Default: "Terjadi kesalahan saat login.",
};

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error") || "Default";
  const msg = ERRORS[error] || ERRORS.Default;

  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#13131e", border: "1px solid #ef444444",
        borderRadius: 16, padding: 32, maxWidth: 360, width: "100%", textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontWeight: 700, color: "#ef4444", fontSize: 16, marginBottom: 8 }}>Login Gagal</div>
        <div style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>{msg}</div>
        <Link href="/auth/signin" style={{
          display: "block", padding: "10px 0", borderRadius: 8,
          background: "linear-gradient(135deg,#c8a96e,#8a6030)",
          color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none",
        }}>
          Coba Lagi
        </Link>
      </div>
    </div>
  );
}

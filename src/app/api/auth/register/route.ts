export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name || email.split("@")[0], email, password: hashed },
    });
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[register]", msg);
    if (msg.includes("column") || msg.includes("password")) {
      return NextResponse.json({ error: "Kolom password belum ada di database. Jalankan ALTER TABLE." }, { status: 500 });
    }
    return NextResponse.json({ error: "Terjadi kesalahan server: " + msg }, { status: 500 });
  }
}

// src/lib/friendCode.ts
import { prisma } from "./prisma";

// Hindari karakter yang gampang ketukar (0/O, 1/I/L)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function ensureFriendCode(userId: string, existing: string | null): Promise<string> {
  if (existing) return existing;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      await prisma.user.update({ where: { id: userId }, data: { friendCode: code } });
      return code;
    } catch (err: any) {
      if (err?.code !== "P2002") throw err;
    }
  }
  throw new Error("Gagal membuat kode teman, coba lagi.");
}

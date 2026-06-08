// src/app/api/daily-challenge/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CHALLENGE_POOL = [
  { title: "Profit Hunter",       description: "Raih profit harian minimal Rp5jt hari ini",         targetType: "profit",      targetValue: 5_000_000  },
  { title: "NPL Guardian",        description: "Pertahankan NPL di bawah 2% sampai akhir hari",     targetType: "npl",         targetValue: 2          },
  { title: "Reputasi Emas",       description: "Naikkan reputasi bank ke 80% atau lebih",            targetType: "reputation",  targetValue: 80         },
  { title: "Kredit Rajin",        description: "Approve minimal 5 pengajuan kredit hari ini",        targetType: "approvals",   targetValue: 5          },
  { title: "Prospek Master",      description: "Konversi 3 prospek menjadi nasabah hari ini",        targetType: "prospects",   targetValue: 3          },
  { title: "Deposito Magnet",     description: "Terima deposito total minimal Rp100jt hari ini",     targetType: "profit",      targetValue: 100_000_000},
  { title: "Zero Default",        description: "Tidak ada kredit baru yang masuk perhatian hari ini",targetType: "npl",         targetValue: 3          },
  { title: "Banker Terbaik",      description: "Capai reputasi 90+ dan NPL di bawah 1.5%",          targetType: "reputation",  targetValue: 90         },
];

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let challenge = await prisma.dailyChallenge.findFirst({
    where: { date: today },
  });

  if (!challenge) {
    // Generate today's challenge deterministically based on date
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const template = CHALLENGE_POOL[dayOfYear % CHALLENGE_POOL.length];

    challenge = await prisma.dailyChallenge.create({
      data: {
        date: today,
        title: template.title,
        description: template.description,
        targetType: template.targetType,
        targetValue: template.targetValue,
        bonusXp: 150,
      },
    });
  }

  const session = await getServerSession(authOptions);
  let completed = false;

  if (session?.user?.id) {
    const completion = await prisma.dailyChallengeCompletion.findFirst({
      where: { userId: session.user.id, challengeId: challenge.id },
    });
    completed = !!completion;
  }

  return NextResponse.json({ ...challenge, completed });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { challengeId } = await req.json();

  const existing = await prisma.dailyChallengeCompletion.findFirst({
    where: { userId: session.user.id, challengeId },
  });

  if (existing) {
    return NextResponse.json({ alreadyCompleted: true });
  }

  await prisma.dailyChallengeCompletion.create({
    data: { userId: session.user.id, challengeId },
  });

  return NextResponse.json({ success: true });
}

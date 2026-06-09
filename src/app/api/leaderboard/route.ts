// src/app/api/leaderboard/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty") || undefined;
  const limit = parseInt(searchParams.get("limit") || "20");

  const entries = await prisma.leaderboardEntry.findMany({
    where: difficulty ? { difficulty } : undefined,
    orderBy: { totalProfit: "desc" },
    take: Math.min(limit, 100),
    include: { user: { select: { name: true, image: true } } },
  });

  const session = await getServerSession(authOptions);

  return NextResponse.json(
    entries.map((e, i) => ({
      rank: i + 1,
      playerName: e.playerName,
      totalProfit: Number(e.totalProfit),
      day: e.day,
      level: e.level,
      difficulty: e.difficulty,
      branch: e.branch,
      achievements: e.achievements,
      submittedAt: e.submittedAt,
      avatar: e.user?.image,
      isCurrentUser: session?.user?.id === e.userId,
    }))
  );
}

const SubmitSchema = z.object({
  playerName: z.string().min(1).max(30),
  bankName: z.string().min(1).max(40).default("Bank Nusantara"),
  totalProfit: z.number(),
  day: z.number().int(),
  level: z.number().int(),
  difficulty: z.enum(["easy", "normal", "hard"]),
  branch: z.string(),
  achievements: z.number().int(),
  npl: z.number().min(0).max(100).default(0),
  reputation: z.number().int().min(0).max(100).default(0),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const entry = await prisma.leaderboardEntry.create({
    data: {
      userId: session.user.id,
      ...parsed.data,
      totalProfit: BigInt(Math.floor(parsed.data.totalProfit)),
    },
  });

  return NextResponse.json({ success: true, id: entry.id });
}

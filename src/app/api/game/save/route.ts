// src/app/api/game/save/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SaveSchema = z.object({
  slot: z.number().int().min(1).max(3),
  gameState: z.record(z.any()),
  day: z.number().int().min(1),
  totalProfit: z.number(),
  level: z.number().int().min(1),
  difficulty: z.enum(["easy", "normal", "hard"]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { slot, gameState, day, totalProfit, level, difficulty } = parsed.data;

  const save = await prisma.gameSave.upsert({
    where: { userId_slot: { userId: session.user.id, slot } },
    create: {
      userId: session.user.id,
      slot,
      gameState,
      day,
      totalProfit: BigInt(Math.floor(totalProfit)),
      level,
      difficulty,
    },
    update: {
      gameState,
      day,
      totalProfit: BigInt(Math.floor(totalProfit)),
      level,
      difficulty,
    },
  });

  return NextResponse.json({ success: true, savedAt: save.updatedAt });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saves = await prisma.gameSave.findMany({
    where: { userId: session.user.id },
    orderBy: { slot: "asc" },
  });

  return NextResponse.json(saves.map((s) => ({
    slot: s.slot,
    day: s.day,
    totalProfit: Number(s.totalProfit),
    level: s.level,
    difficulty: s.difficulty,
    savedAt: s.updatedAt,
    gameState: s.gameState,
  })));
}

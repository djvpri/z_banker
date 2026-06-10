// src/app/api/friends/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureFriendCode } from "@/lib/friendCode";
import { z } from "zod";

type BoardEntry = {
  id: string;
  name: string | null;
  image: string | null;
  bankName: string;
  totalProfit: number;
  day: number;
  level: number;
  difficulty: string;
  isMe: boolean;
};

function progressFromSave(save: { gameState: unknown; totalProfit: bigint; day: number; level: number; difficulty: string } | null) {
  const gs = save?.gameState as any;
  return {
    bankName: gs?.game?.bankName || "Bank Nusantara",
    totalProfit: save ? Number(save.totalProfit) : 0,
    day: save?.day ?? 0,
    level: save?.level ?? 1,
    difficulty: save?.difficulty ?? "normal",
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const myId = session.user.id;

  const me = await prisma.user.findUnique({ where: { id: myId } });
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const friendCode = await ensureFriendCode(me.id, me.friendCode);

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: myId }, { addresseeId: myId }] },
    include: {
      requester: { select: { id: true, name: true, image: true } },
      addressee: { select: { id: true, name: true, image: true } },
    },
  });

  const acceptedIds: string[] = [];
  const friendsBasic: { friendshipId: string; id: string; name: string | null; image: string | null }[] = [];
  const incoming: { friendshipId: string; id: string; name: string | null; image: string | null }[] = [];
  const outgoing: { friendshipId: string; id: string; name: string | null; image: string | null }[] = [];

  friendships.forEach((f) => {
    const isMeRequester = f.requesterId === myId;
    const other = isMeRequester ? f.addressee : f.requester;
    if (f.status === "accepted") {
      acceptedIds.push(other.id);
      friendsBasic.push({ friendshipId: f.id, id: other.id, name: other.name, image: other.image });
    } else if (isMeRequester) {
      outgoing.push({ friendshipId: f.id, id: other.id, name: other.name, image: other.image });
    } else {
      incoming.push({ friendshipId: f.id, id: other.id, name: other.name, image: other.image });
    }
  });

  const saves = acceptedIds.length > 0
    ? await prisma.gameSave.findMany({ where: { userId: { in: acceptedIds }, slot: 1 } })
    : [];
  const saveByUser = new Map(saves.map((s) => [s.userId, s]));
  const mySave = await prisma.gameSave.findUnique({ where: { userId_slot: { userId: myId, slot: 1 } } });

  const friends = friendsBasic.map((f) => ({ ...f, ...progressFromSave(saveByUser.get(f.id) ?? null) }));

  const board: BoardEntry[] = [
    ...friends.map((f) => ({
      id: f.id, name: f.name, image: f.image, bankName: f.bankName,
      totalProfit: f.totalProfit, day: f.day, level: f.level, difficulty: f.difficulty, isMe: false,
    })),
    {
      id: me.id, name: me.name, image: me.image, isMe: true,
      ...progressFromSave(mySave),
    },
  ].sort((a, b) => b.totalProfit - a.totalProfit);

  return NextResponse.json({ friendCode, friends, incoming, outgoing, board });
}

const AddFriendSchema = z.object({ code: z.string().min(4).max(12) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const myId = session.user.id;

  const body = await req.json();
  const parsed = AddFriendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Kode tidak valid" }, { status: 400 });
  }

  const code = parsed.data.code.trim().toUpperCase();
  const target = await prisma.user.findUnique({ where: { friendCode: code } });
  if (!target) {
    return NextResponse.json({ error: "Kode teman tidak ditemukan" }, { status: 404 });
  }
  if (target.id === myId) {
    return NextResponse.json({ error: "Tidak bisa menambahkan diri sendiri" }, { status: 400 });
  }

  // Kalau target sudah lebih dulu mengirim permintaan ke kita, langsung terima (saling berteman)
  const reverse = await prisma.friendship.findUnique({
    where: { requesterId_addresseeId: { requesterId: target.id, addresseeId: myId } },
  });
  if (reverse) {
    if (reverse.status === "accepted") {
      return NextResponse.json({ error: "Sudah berteman" }, { status: 400 });
    }
    await prisma.friendship.update({ where: { id: reverse.id }, data: { status: "accepted" } });
    return NextResponse.json({ success: true, status: "accepted" });
  }

  const existing = await prisma.friendship.findUnique({
    where: { requesterId_addresseeId: { requesterId: myId, addresseeId: target.id } },
  });
  if (existing) {
    return NextResponse.json(
      { error: existing.status === "accepted" ? "Sudah berteman" : "Permintaan sudah dikirim sebelumnya" },
      { status: 400 }
    );
  }

  await prisma.friendship.create({
    data: { requesterId: myId, addresseeId: target.id, status: "pending" },
  });

  return NextResponse.json({ success: true, status: "pending", name: target.name });
}

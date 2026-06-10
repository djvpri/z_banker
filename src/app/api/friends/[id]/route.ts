// src/app/api/friends/[id]/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Terima permintaan pertemanan masuk
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const friendship = await prisma.friendship.findUnique({ where: { id: params.id } });
  if (!friendship || friendship.addresseeId !== session.user.id) {
    return NextResponse.json({ error: "Permintaan tidak ditemukan" }, { status: 404 });
  }
  if (friendship.status !== "pending") {
    return NextResponse.json({ error: "Permintaan sudah diproses" }, { status: 400 });
  }

  await prisma.friendship.update({ where: { id: params.id }, data: { status: "accepted" } });
  return NextResponse.json({ success: true });
}

// Tolak permintaan masuk, batalkan permintaan keluar, atau hapus pertemanan
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const friendship = await prisma.friendship.findUnique({ where: { id: params.id } });
  if (!friendship || (friendship.requesterId !== session.user.id && friendship.addresseeId !== session.user.id)) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  await prisma.friendship.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

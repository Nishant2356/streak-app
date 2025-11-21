import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await req.json();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const item = await prisma.storeItem.findUnique({ where: { id: itemId } });

    if (!user || !item)
      return NextResponse.json({ error: "Invalid item/user" }, { status: 400 });

    const owned = await prisma.userItem.findUnique({
      where: { userId_itemId: { userId: user.id, itemId } },
    });

    if (owned)
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });

    if (user.xp < item.price)
      return NextResponse.json({ error: "Not enough XP" }, { status: 400 });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { xp: user.xp - item.price },
      }),
      prisma.userItem.create({
        data: { userId: user.id, itemId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 });
  }
}

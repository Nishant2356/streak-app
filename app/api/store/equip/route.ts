import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ItemType } from "@prisma/client";
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

    const item = await prisma.storeItem.findUnique({
      where: { id: itemId },
    });

    if (!user || !item)
      return NextResponse.json({ error: "Invalid item or user" }, { status: 400 });

    // Check ownership
    const owned = await prisma.userItem.findUnique({
      where: { userId_itemId: { userId: user.id, itemId } },
    });

    if (!owned)
      return NextResponse.json({ error: "You do not own this item" }, { status: 400 });

    // Equip the item (upsert = replace old equipped item in same category)
    await prisma.userEquip.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: item.type,
        },
      },
      update: {
        itemId: item.id,
      },
      create: {
        userId: user.id,
        itemId: item.id,
        type: item.type,
      },
    });

    return NextResponse.json({ success: true, message: "Item equipped!" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Failed to equip item" }, { status: 500 });
  }
}

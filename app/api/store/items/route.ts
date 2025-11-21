import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import type { ItemType } from "@prisma/client";


export async function GET() {
  try {
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    const items = await prisma.storeItem.findMany({
      orderBy: { price: "asc" },
    });

    if (!userEmail) {
      return NextResponse.json({ items, owned: [], equipped: {} });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        inventory: true,
        equipped: true,
      },
    });

    const owned = user?.inventory.map((i) => i.itemId) ?? [];
    const equipped: Partial<Record<ItemType, number>> = {};

    user?.equipped.forEach((e) => {
      equipped[e.type] = e.itemId;
    });

    return NextResponse.json({ items, owned, equipped });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { ItemType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type } = await req.json();

    if (!type || !Object.values(ItemType).includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 400 });

    // Delete equipped row
    await prisma.userEquip.deleteMany({
      where: {
        userId: user.id,
        type: type,
      },
    });

    return NextResponse.json({ success: true, message: "Item unequipped!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to unequip item" }, { status: 500 });
  }
}

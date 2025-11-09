import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch users with their tasks (expired tasks will be cleaned up by cron job)
    const users = await prisma.user.findMany({
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            xpReward: true,
            completed: true,
          },
        },
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

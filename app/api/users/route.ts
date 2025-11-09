import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 🕛 Automatically delete expired tasks for ALL users (only when current time EXCEEDS dueDate)
    const now = new Date();
    
    const deleteResult = await prisma.task.deleteMany({
      where: {
        dueDate: {
          lt: now, // Strictly less than - will NOT delete if dueDate equals now
          not: null, // Only delete tasks that have a dueDate
        },
      },
    });
    
    // Log for debugging
    if (deleteResult.count > 0) {
      console.log(`[Users API] Deleted ${deleteResult.count} expired task(s) across all users`);
    }
    
    // Fetch users with their tasks (expired ones are now removed)
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

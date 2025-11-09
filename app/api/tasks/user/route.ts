import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // 🕛 Automatically delete expired tasks (only when current time EXCEEDS dueDate)
  // lt (less than) is STRICTLY less than, so:
  // - If dueDate < now → DELETED (now has exceeded dueDate) ✅
  // - If dueDate = now → NOT deleted (equal, not exceeded yet) ✅
  // - If dueDate > now → NOT deleted (future, not exceeded yet) ✅
  const now = new Date();
  
  // First, let's check what tasks exist and their dueDates for debugging
  const allTasks = await prisma.task.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, dueDate: true },
  });
  
  console.log(`[Tasks API] Current time: ${now.toISOString()}`);
  console.log(`[Tasks API] User ${user.email} has ${allTasks.length} tasks`);
  allTasks.forEach(task => {
    if (task.dueDate) {
      const isExpired = task.dueDate < now;
      console.log(`[Tasks API] Task "${task.title}" - dueDate: ${task.dueDate.toISOString()}, expired: ${isExpired}`);
    }
  });
  
  // Delete expired tasks (dueDate is in UTC, so we compare with current UTC time)
  const deleteResult = await prisma.task.deleteMany({
    where: {
      userId: user.id,
      dueDate: {
        lt: now, // Strictly less than - will NOT delete if dueDate equals now
        not: null, // Only delete tasks that have a dueDate
      },
    },
  });
  
  // Log for debugging
  if (deleteResult.count > 0) {
    console.log(`[Tasks API] Deleted ${deleteResult.count} expired task(s) for user ${user.email}`);
  } else {
    console.log(`[Tasks API] No expired tasks to delete for user ${user.email}`);
  }

  // 🧾 Fetch updated active tasks
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}
